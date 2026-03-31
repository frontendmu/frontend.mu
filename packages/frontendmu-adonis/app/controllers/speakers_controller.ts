import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import SpeakerPolicy from '#policies/speaker_policy'
import SpeakerTransformer from '#transformers/speaker_transformer'
import SessionTransformer from '#transformers/session_transformer'

export default class SpeakersController {
  async index({ inertia }: HttpContext) {
    const dbSpeakers = await User.query()
      .whereHas('sessions', () => {})
      .orderBy('featured', 'desc')
      .orderBy('name', 'asc')

    const speakers = SpeakerTransformer.transform(dbSpeakers)

    return inertia.render('speakers/index', {
      speakers,
    })
  }

  async show({ inertia, params, bouncer, auth }: HttpContext) {
    const dbSpeaker = await User.query()
      .where('id', params.id)
      .preload('sessions', (query) => {
        query.preload('event')
      })
      .firstOrFail()

    const speaker = SpeakerTransformer.transform(dbSpeaker)
    const sessions = (dbSpeaker.sessions ?? []).sort((a, b) => {
      const dateA = a.event?.eventDate?.toMillis() ?? 0
      const dateB = b.event?.eventDate?.toMillis() ?? 0
      return dateB - dateA
    })

    const serializedSessions =
      SessionTransformer.transform(sessions).useVariant('forSpeakerProfile')

    let canEdit = false
    await auth.check()
    if (auth.user) {
      canEdit = await bouncer.with(SpeakerPolicy).allows('edit')
    }

    return inertia.render('speakers/show', {
      speaker,
      sessions: serializedSessions,
      canEdit,
    })
  }
}
