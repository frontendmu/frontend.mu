import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'
import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import { updateProfileValidator } from '#validators/profile_validator'

export default class ProfileController {
  async show({ inertia, auth }: HttpContext) {
    const user = await User.query()
      .where('id', auth.user!.id)
      .preload('roles')
      .preload('rsvps', (query) => {
        query.preload('event').orderBy('createdAt', 'desc')
      })
      .firstOrFail()

    const rsvpMeetups = user.rsvps
      .filter((r) => r.event)
      .map((r) => ({
        id: r.event.id,
        title: r.event.title,
        date: r.event.eventDate?.toFormat('dd MMM yyyy') ?? null,
        status: r.status,
      }))

    return inertia.render('profile', {
      user: UserTransformer.transform(user),
      rsvpMeetups,
    })
  }

  async update({ request, response, auth, session }: HttpContext) {
    const data = await request.validateUsing(updateProfileValidator)

    const user = await User.findOrFail(auth.user!.id)
    user.merge({
      name: data.name,
      githubUsername: data.githubUsername || null,
      bio: data.bio || null,
      linkedinUrl: data.linkedinUrl || null,
      twitterUrl: data.twitterUrl || null,
      websiteUrl: data.websiteUrl || null,
    })
    await user.save()

    session.flash('success', 'Profile updated successfully!')

    return response.redirect().toPath(urlFor('profile.show'))
  }
}
