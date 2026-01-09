import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class ProfileController {
  async show({ inertia, auth, response }: HttpContext) {
    await auth.check()

    if (!auth.isAuthenticated || !auth.user) {
      return response.redirect('/login')
    }

    // Load user with roles for display
    const user = await User.query()
      .where('id', auth.user.id)
      .preload('roles')
      .firstOrFail()

    return inertia.render('profile', {
      user: {
        ...user.serialize(),
        roles: user.roles.map((r) => ({ id: r.id, name: r.name })),
        avatarUrl:
          user.avatarUrl ||
          (user.githubUsername
            ? `https://avatars.githubusercontent.com/${user.githubUsername}`
            : null),
      },
    })
  }

  async update({ request, response, auth, session }: HttpContext) {
    await auth.check()

    if (!auth.isAuthenticated || !auth.user) {
      return response.redirect('/login')
    }

    const data = request.only(['name', 'bio', 'linkedinUrl', 'twitterUrl', 'websiteUrl'])

    const user = await User.findOrFail(auth.user.id)
    user.merge(data)
    await user.save()

    session.flash('success', 'Profile updated successfully!')

    return response.redirect('/profile')
  }
}
