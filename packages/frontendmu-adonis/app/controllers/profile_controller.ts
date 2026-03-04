import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { updateProfileValidator } from '#validators/profile_validator'
import { toUserProfile } from '#dtos/factories'

export default class ProfileController {
  async show({ inertia, auth }: HttpContext) {
    const user = await User.query()
      .where('id', auth.user!.id)
      .preload('roles')
      .firstOrFail()

    return inertia.render('profile', {
      user: toUserProfile(user),
    })
  }

  async update({ request, response, auth, session }: HttpContext) {
    const data = await request.validateUsing(updateProfileValidator)

    const user = await User.findOrFail(auth.user!.id)
    user.merge({
      name: data.name,
      bio: data.bio || null,
      linkedinUrl: data.linkedinUrl || null,
      twitterUrl: data.twitterUrl || null,
      websiteUrl: data.websiteUrl || null,
    })
    await user.save()

    session.flash('success', 'Profile updated successfully!')

    return response.redirect().toRoute('profile.show')
  }
}
