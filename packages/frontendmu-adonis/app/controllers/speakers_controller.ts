import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import SpeakerPolicy from '#policies/speaker_policy'
import SpeakerTransformer from '#transformers/speaker_transformer'
import SessionTransformer from '#transformers/session_transformer'
import { setSeoMeta } from '#utils/seo'

export default class SpeakersController {
  async index(ctx: HttpContext) {
    const { inertia } = ctx
    setSeoMeta(ctx, {
      title: 'Speakers',
      description:
        'People who have shared their knowledge at coders.mu meetups — from junior devs to seasoned engineers.',
      canonical: '/speakers',
    })

    const dbSpeakers = await User.query()
      .whereHas('sessions', () => {})
      .orderBy('featured', 'desc')
      .orderBy('name', 'asc')

    const speakers = SpeakerTransformer.transform(dbSpeakers)

    return inertia.render('speakers/index', {
      speakers,
    })
  }

  async show(ctx: HttpContext) {
    const { inertia, params, bouncer, auth, response } = ctx
    const dbSpeaker = await User.query()
      .where('id', params.id)
      .preload('sessions', (query) => {
        query.preload('event')
      })
      .first()

    // Many legacy speaker UUIDs from the old Directus site no longer exist in
    // the new DB. Returning 410 (instead of the default 404 from firstOrFail)
    // signals "permanently gone" so Google drops them from the index faster.
    if (!dbSpeaker) {
      setSeoMeta(ctx, { title: 'Speaker not found', noindex: true })
      response.status(410)
      return inertia.render('errors/not_found', {})
    }

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

    const speakerDescription =
      sessions.length > 0
        ? `${dbSpeaker.name} has spoken at ${sessions.length} coders.mu meetup${sessions.length === 1 ? '' : 's'}.`
        : `${dbSpeaker.name} on coders.mu.`

    setSeoMeta(ctx, {
      title: dbSpeaker.name,
      description: speakerDescription,
      canonical: `/speaker/${dbSpeaker.id}`,
      ogType: 'profile',
      ogImage: dbSpeaker.avatarUrl ?? undefined,
      noindex: sessions.length === 0,
    })

    return inertia.render('speakers/show', {
      speaker,
      sessions: serializedSessions,
      canEdit,
    })
  }
}
