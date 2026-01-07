import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import vine from '@vinejs/vine'

// Validator for updating users
const updateUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    email: vine.string().email().optional(),
    role: vine.enum(['viewer', 'member', 'organizer', 'superadmin']),
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
  async index({ inertia, auth, response, request }: HttpContext) {
    const user = auth.user!
    if (!user.hasAppRole('superadmin')) {
      return response.forbidden('You are not authorized to view users.')
    }

    const roleFilter = request.input('role', 'all')
    const search = request.input('search', '')

    let query = User.query().orderBy('createdAt', 'desc')

    // Apply role filter
    if (roleFilter !== 'all') {
      query = query.where('role', roleFilter)
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

    // Get role counts
    const roleCounts = await User.query()
      .select('role')
      .count('* as count')
      .groupBy('role')

    const counts = {
      all: 0,
      viewer: 0,
      member: 0,
      organizer: 0,
      superadmin: 0,
    }

    roleCounts.forEach((r) => {
      const role = r.role as keyof typeof counts
      const count = Number(r.$extras.count)
      counts[role] = count
      counts.all += count
    })

    return inertia.render('admin/users/index', {
      users: users.map((u) => ({
        ...u.serialize(),
        avatarUrl: u.avatarUrl || 
          (u.githubUsername ? `https://avatars.githubusercontent.com/${u.githubUsername}` : null),
      })),
      roleFilter,
      search,
      counts,
    })
  }

  /**
   * Show the edit form for a user
   */
  async edit({ inertia, params, auth, response }: HttpContext) {
    const currentUser = auth.user!
    if (!currentUser.hasAppRole('superadmin')) {
      return response.forbidden('You are not authorized to edit users.')
    }

    const user = await User.findOrFail(params.id)

    return inertia.render('admin/users/edit', {
      user: {
        ...user.serialize(),
        avatarUrl: user.avatarUrl || 
          (user.githubUsername ? `https://avatars.githubusercontent.com/${user.githubUsername}` : null),
      },
    })
  }

  /**
   * Update a user
   */
  async update({ params, request, auth, response, session }: HttpContext) {
    const currentUser = auth.user!
    if (!currentUser.hasAppRole('superadmin')) {
      return response.forbidden('You are not authorized to update users.')
    }

    const user = await User.findOrFail(params.id)
    const data = await request.validateUsing(updateUserValidator)

    // Prevent superadmin from demoting themselves
    if (user.id === currentUser.id && data.role !== 'superadmin') {
      return response.badRequest('You cannot change your own role.')
    }

    user.merge({
      name: data.name,
      email: data.email || null,
      role: data.role,
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

    session.flash('success', 'User updated successfully!')
    return response.redirect('/admin/users')
  }

  /**
   * Delete a user
   */
  async destroy({ params, auth, response, session }: HttpContext) {
    const currentUser = auth.user!
    if (!currentUser.hasAppRole('superadmin')) {
      return response.forbidden('You are not authorized to delete users.')
    }

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
