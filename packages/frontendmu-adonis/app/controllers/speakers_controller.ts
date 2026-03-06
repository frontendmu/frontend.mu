import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import SpeakerPolicy from '#policies/speaker_policy'
import { toSpeaker, toSpeakerSession } from '#dtos/factories'

export default class SpeakersController {
  async index({ inertia }: HttpContext) {
    const dbSpeakers = await User.query()
      .whereHas('sessions', () => {})
      .orderBy('featured', 'desc')
      .orderBy('name', 'asc')

    const speakers = dbSpeakers.map(toSpeaker)

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

    const speaker = toSpeaker(dbSpeaker)
    const sessions = (dbSpeaker.sessions ?? [])
      .sort((a, b) => {
        const dateA = a.event?.eventDate?.toMillis() ?? 0
        const dateB = b.event?.eventDate?.toMillis() ?? 0
        return dateB - dateA
      })
      .map(toSpeakerSession)

    let canEdit = false
    await auth.check()
    if (auth.user) {
      canEdit = await bouncer.with(SpeakerPolicy).allows('edit')
    }

    return inertia.render('speakers/show', {
      speaker,
      sessions,
      canEdit,
    })
  }
}
