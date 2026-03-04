import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import vine from '@vinejs/vine'
import UserPolicy from '#policies/user_policy'
import { resolveAvatarUrl } from '#dtos/factories'

const updateUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    email: vine.string().email().optional(),
    roleIds: vine.array(vine.number()).minLength(1),
    githubUsername: vine.string().trim().maxLength(100).optional(),
    bio: vine.string().trim().maxLength(2000).optional(),
    linkedinUrl: vine.string().url().optional(),
    twitterUrl: vine.string().url().optional(),
    websiteUrl: vine.string().url().optional(),
    featured: vine.boolean().optional(),
    isOrganizer: vine.boolean().optional(),
    isCommunityMember: vine.boolean().optional(),
  })
)

export default class AdminUsersController {
  async index({ inertia, bouncer, request }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('viewAny')

    const roleFilter = request.input('role', 'all')
    const search = request.input('search', '')

    let query = User.query().preload('roles').orderBy('createdAt', 'desc')

    if (roleFilter !== 'all') {
      query = query.whereHas('roles', (roleQuery) => {
        roleQuery.where('name', roleFilter)
      })
    }

    if (search) {
      query = query.where((q) => {
        q.whereILike('name', `%${search}%`)
          .orWhereILike('email', `%${search}%`)
          .orWhereILike('githubUsername', `%${search}%`)
      })
    }

    const users = await query

    const allRoles = await Role.query().orderBy('name', 'asc')

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
      users: users.map((u) => ({
        ...u.serialize(),
        roles: u.roles.map((r) => ({ id: r.id, name: r.name })),
        avatarUrl: resolveAvatarUrl(u),
      })),
      allRoles: allRoles.map((r) => ({ id: r.id, name: r.name, description: r.description })),
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
      .firstOrFail()

    const allRoles = await Role.query().preload('permissions').orderBy('name', 'asc')

    const userPermissions = await user.getAllPermissions()

    return inertia.render('admin/users/edit', {
      user: {
        ...user.serialize(),
        roles: user.roles.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          permissions: r.permissions.map((p) => ({ id: p.id, name: p.name })),
        })),
        permissions: userPermissions,
        avatarUrl: resolveAvatarUrl(user),
      },
      allRoles: allRoles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: r.permissions.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
        })),
      })),
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

    user.merge({
      name: data.name,
      email: data.email || null,
      githubUsername: data.githubUsername || null,
      bio: data.bio || null,
      linkedinUrl: data.linkedinUrl || null,
      twitterUrl: data.twitterUrl || null,
      websiteUrl: data.websiteUrl || null,
      featured: data.featured || false,
      isOrganizer: data.isOrganizer || false,
      isCommunityMember: data.isCommunityMember || false,
    })

    await user.save()

    await bouncer.with(UserPolicy).authorize('assignRoles')

    if (superadminRole && data.roleIds.includes(superadminRole.id) && !isSuperadmin) {
      return response.forbidden('Only superadmins can assign the superadmin role.')
    }

    await user.related('roles').sync(data.roleIds)

    user.clearRbacCache()

    session.flash('success', 'User updated successfully!')
    return response.redirect().toRoute('admin.users.index')
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
    return response.redirect().toRoute('admin.users.index')
  }
}
