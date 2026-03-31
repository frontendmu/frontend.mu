import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'
import User from '#models/user'
import Role from '#models/role'
import UserPolicy from '#policies/user_policy'
import AdminUserTransformer from '#transformers/admin_user_transformer'
import RoleTransformer from '#transformers/role_transformer'
import { updateUserValidator } from '#validators/user_validator'
import db from '@adonisjs/lucid/services/db'

export default class AdminUsersController {
  async index({ inertia, bouncer, request }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('viewAny')

    const rawRole = request.input('role', 'all')
    const search = request.input('search', '')

    // Validate role filter against actual roles in DB
    const allRoles = await Role.query().orderBy('name', 'asc')
    const validRoleNames = ['all', ...allRoles.map((r) => r.name)]
    const roleFilter = validRoleNames.includes(rawRole) ? rawRole : 'all'

    let query = User.query().preload('roles').orderBy('createdAt', 'desc')

    if (roleFilter !== 'all') {
      query = query.whereHas('roles', (roleQuery) => {
        roleQuery.where('name', roleFilter)
      })
    }

    if (search) {
      query = query.where((q) => {
        q.whereLike('name', `%${search}%`)
          .orWhereLike('email', `%${search}%`)
          .orWhereLike('githubUsername', `%${search}%`)
      })
    }

    const users = await query

    const roleCounts: Record<string, number> = { all: 0 }
    for (const role of allRoles) {
      const count = await User.query()
        .whereHas('roles', (q) => q.where('role_id', role.id))
        .count('* as total')
        .first()
      roleCounts[role.name] = Number(count?.$extras.total || 0)
      roleCounts.all += roleCounts[role.name]
    }

    return inertia.render('admin/users/index', {
      users: AdminUserTransformer.transform(users).useVariant('forAdminIndex'),
      allRoles: RoleTransformer.transform(allRoles),
      roleFilter,
      search,
      counts: roleCounts,
    })
  }

  async edit({ inertia, params, bouncer }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('edit')

    const user = await User.query()
      .where('id', params.id)
      .preload('roles', (query) => {
        query.preload('permissions')
      })
      .preload('sessions', (query) => {
        query.preload('event')
      })
      .preload('rsvps', (query) => {
        query.preload('event').orderBy('createdAt', 'desc')
      })
      .firstOrFail()

    const allRoles = await Role.query().preload('permissions').orderBy('name', 'asc')

    const userPermissions = await user.getAllPermissions()
    user.$extras.permissions = userPermissions

    return inertia.render('admin/users/edit', {
      user: AdminUserTransformer.transform(user).useVariant('forAdminEdit'),
      allRoles: RoleTransformer.transform(allRoles).useVariant('forAdminEdit'),
    })
  }

  async update({ params, request, auth, bouncer, response, session }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('update')

    const currentUser = auth.user!
    const user = await User.query().where('id', params.id).preload('roles').firstOrFail()

    const data = await request.validateUsing(updateUserValidator)

    const isSuperadmin = await currentUser.hasRole('superadmin')
    const superadminRole = await Role.findBy('name', 'superadmin')

    if (
      user.id === currentUser.id &&
      isSuperadmin &&
      superadminRole &&
      !data.roleIds.includes(superadminRole.id)
    ) {
      return response.badRequest('You cannot remove superadmin role from yourself.')
    }

    // Authorize role assignment before saving anything
    await bouncer.with(UserPolicy).authorize('assignRoles')

    if (superadminRole && data.roleIds.includes(superadminRole.id) && !isSuperadmin) {
      return response.forbidden('Only superadmins can assign the superadmin role.')
    }

    // Wrap save + role sync in transaction
    await db.transaction(async (trx) => {
      user.useTransaction(trx)
      user.merge({
        name: data.name,
        email: data.email || null,
        githubUsername: data.githubUsername || null,
        bio: data.bio || null,
        linkedinUrl: data.linkedinUrl || null,
        twitterUrl: data.twitterUrl || null,
        websiteUrl: data.websiteUrl || null,
        featured: data.featured === true,
        isOrganizer: data.isOrganizer === true,
        isCommunityMember: data.isCommunityMember === true,
        title: data.title || null,
      })
      await user.save()
      await user.related('roles').sync(data.roleIds)
    })

    user.clearRbacCache()

    session.flash('success', 'User updated successfully!')
    return response.redirect().toPath(urlFor('admin.users.index'))
  }

  async destroy({ params, auth, bouncer, response, session }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('delete')

    const currentUser = auth.user!
    const user = await User.findOrFail(params.id)

    if (user.id === currentUser.id) {
      return response.badRequest('You cannot delete your own account.')
    }

    await user.delete()

    session.flash('success', 'User deleted successfully!')
    return response.redirect().toPath(urlFor('admin.users.index'))
  }
}
