import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import { urlFor } from '@adonisjs/core/services/url_builder'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import SpeakerPolicy from '#policies/speaker_policy'
import { speakerValidator } from '#validators/speaker_validator'
import SpeakerTransformer from '#transformers/speaker_transformer'

export default class AdminSpeakersController {
  async index({ inertia, bouncer }: HttpContext) {
    await bouncer.with(SpeakerPolicy).authorize('viewAny')

    const speakers = await User.query()
      .whereIn('id', db.from('session_speakers').select('speaker_id').distinct())
      .preload('sessions', (query) => {
        query.preload('event')
      })
      .orderBy('name', 'asc')

    return inertia.render('admin/speakers/index', {
      speakers: SpeakerTransformer.transform(speakers).useVariant('forAdminIndex'),
    })
  }

  async create({ inertia, bouncer }: HttpContext) {
    await bouncer.with(SpeakerPolicy).authorize('create')

    return inertia.render('admin/speakers/create', {})
  }

  async store({ request, bouncer, response, session }: HttpContext) {
    await bouncer.with(SpeakerPolicy).authorize('create')

    const data = await request.validateUsing(speakerValidator)

    const speaker = await User.create({
      id: randomUUID(),
      name: data.name,
      email: data.email || null,
      githubUsername: data.githubUsername || null,
      bio: data.bio || null,
      linkedinUrl: data.linkedinUrl || null,
      twitterUrl: data.twitterUrl || null,
      websiteUrl: data.websiteUrl || null,
      featured: data.featured || false,
      role: 'member',
      password: null,
    })

    session.flash('success', 'Speaker created successfully!')
    return response.redirect().toPath(urlFor('admin.users.edit', { id: speaker.id }))
  }

  async destroy({ params, auth, bouncer, response, session }: HttpContext) {
    await bouncer.with(SpeakerPolicy).authorize('delete')

    const speaker = await User.findOrFail(params.id)

    if (auth.user && speaker.id === auth.user.id) {
      return response.badRequest('You cannot remove yourself from speakers.')
    }

    await db.from('session_speakers').where('speaker_id', speaker.id).delete()

    session.flash('success', 'Speaker removed from all sessions successfully!')
    return response.redirect().toPath(urlFor('admin.speakers.index'))
  }
}
