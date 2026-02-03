import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import vine from '@vinejs/vine'
import UserPolicy from '#policies/user_policy'

// Validator for updating users
const updateUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    email: vine.string().email().optional(),
    roleIds: vine.array(vine.number()).minLength(1), // New RBAC: array of role IDs
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
  /**
   * List all users
   */
  async index({ inertia, bouncer, response, request }: HttpContext) {
    if (await bouncer.with(UserPolicy).denies('viewAny')) {
      return response.forbidden('You are not authorized to view users.')
    }

    const roleFilter = request.input('role', 'all')
    const search = request.input('search', '')

    let query = User.query().preload('roles').orderBy('createdAt', 'desc')

    // Apply role filter (filter by RBAC role name)
    if (roleFilter !== 'all') {
      query = query.whereHas('roles', (roleQuery) => {
        roleQuery.where('name', roleFilter)
      })
    }

    // Apply search
    if (search) {
      query = query.where((q) => {
        q.whereILike('name', `%${search}%`)
          .orWhereILike('email', `%${search}%`)
          .orWhereILike('githubUsername', `%${search}%`)
      })
    }

    const users = await query

    // Get all available roles for the filter
    const allRoles = await Role.query().orderBy('name', 'asc')

    // Get role counts using RBAC
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
        avatarUrl:
          u.avatarUrl ||
          (u.githubUsername ? `https://avatars.githubusercontent.com/${u.githubUsername}` : null),
      })),
      allRoles: allRoles.map((r) => ({ id: r.id, name: r.name, description: r.description })),
      roleFilter,
      search,
      counts: roleCounts,
    })
  }

  /**
   * Show the edit form for a user
   */
  async edit({ inertia, params, bouncer, response }: HttpContext) {
    if (await bouncer.with(UserPolicy).denies('edit')) {
      return response.forbidden('You are not authorized to edit users.')
    }

    const user = await User.query()
      .where('id', params.id)
      .preload('roles', (query) => {
        query.preload('permissions')
      })
      .firstOrFail()

    // Get all available roles with their permissions
    const allRoles = await Role.query().preload('permissions').orderBy('name', 'asc')

    // Get the user's current permissions (derived from roles)
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
        avatarUrl:
          user.avatarUrl ||
          (user.githubUsername
            ? `https://avatars.githubusercontent.com/${user.githubUsername}`
            : null),
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

  /**
   * Update a user
   */
  async update({ params, request, auth, bouncer, response, session }: HttpContext) {
    if (await bouncer.with(UserPolicy).denies('update')) {
      return response.forbidden('You are not authorized to update users.')
    }

    const currentUser = auth.user!
    const user = await User.query().where('id', params.id).preload('roles').firstOrFail()

    const data = await request.validateUsing(updateUserValidator)

    // Check if user is trying to remove superadmin role from themselves
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

    // Update basic user info
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

    // Update user's roles using the pivot table
    await user.related('roles').sync(data.roleIds)

    // Clear the RBAC cache since roles changed
    user.clearRbacCache()

    session.flash('success', 'User updated successfully!')
    return response.redirect('/admin/users')
  }

  /**
   * Delete a user
   */
  async destroy({ params, auth, bouncer, response, session }: HttpContext) {
    if (await bouncer.with(UserPolicy).denies('delete')) {
      return response.forbidden('You are not authorized to delete users.')
    }

    const currentUser = auth.user!
    const user = await User.findOrFail(params.id)

    // Prevent deleting yourself
    if (user.id === currentUser.id) {
      return response.badRequest('You cannot delete your own account.')
    }

    await user.delete()

    session.flash('success', 'User deleted successfully!')
    return response.redirect('/admin/users')
  }
}
