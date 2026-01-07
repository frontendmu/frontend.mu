import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class ProfileController {
  async show({ inertia, auth, response }: HttpContext) {
    await auth.check()
    
    if (!auth.isAuthenticated || !auth.user) {
      return response.redirect('/login')
    }

    return inertia.render('profile', {
      user: auth.user,
    })
  }

  async update({ request, response, auth, session }: HttpContext) {
    await auth.check()
    
    if (!auth.isAuthenticated || !auth.user) {
      return response.redirect('/login')
    }

    const data = request.only(['name', 'bio', 'linkedinUrl', 'twitterUrl', 'websiteUrl'])

    const user = await User.findOrFail((auth.user as User).id)
    user.merge(data)
    await user.save()

    session.flash('success', 'Profile updated successfully!')

    return response.redirect('/profile')
  }
}
