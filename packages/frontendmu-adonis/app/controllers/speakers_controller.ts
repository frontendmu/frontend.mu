import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import SpeakerPolicy from '#policies/speaker_policy'

export default class SpeakersController {
  /**
   * Display a list of all speakers
   */
  async index({ inertia }: HttpContext) {
    let speakers: any[] = []

    try {
      const dbSpeakers = await User.query()
        .whereHas('sessions', () => {})
        .orderBy('featured', 'desc')
        .orderBy('name', 'asc')

      speakers = dbSpeakers.map((speaker) => this.serializeSpeaker(speaker))
    } catch {
      // Database not available, use empty data
    }

    return inertia.render('speakers/index', {
      speakers,
    })
  }

  /**
   * Display a single speaker profile
   */
  async show({ inertia, params, bouncer, auth }: HttpContext) {
    let speaker: any = null
    let sessions: any[] = []
    let canEdit = false

    try {
      const dbSpeaker = await User.query()
        .where('id', params.id)
        .preload('sessions', (query) => {
          query.preload('event')
        })
        .first()

      if (dbSpeaker) {
        speaker = this.serializeSpeaker(dbSpeaker)
        sessions =
          dbSpeaker.sessions?.map((session) => ({
            id: session.id,
            title: session.title,
            eventId: session.event?.id,
            eventTitle: session.event?.title,
            eventDate: session.event?.eventDate?.toFormat('dd MMM yyyy'),
          })) || []

      }
    } catch {
      // Database not available, use empty data
    }

    try {
      await auth.check()
      if (auth.user) {
        canEdit = await bouncer.with(SpeakerPolicy).allows('edit')
      }
    } catch {
      canEdit = false
    }

    return inertia.render('speakers/show', {
      speaker,
      sessions,
      canEdit,
    })
  }

  /**
   * Serialize speaker for frontend
   */
  private serializeSpeaker(speaker: User) {
    return {
      id: speaker.id,
      name: speaker.name,
      github_account: speaker.githubUsername,
      featured: speaker.featured,
      bio: speaker.bio,
      avatar_url:
        speaker.avatarUrl ||
        (speaker.githubUsername
          ? `https://avatars.githubusercontent.com/${speaker.githubUsername}`
          : null),
      linkedinUrl: speaker.linkedinUrl,
      twitterUrl: speaker.twitterUrl,
      websiteUrl: speaker.websiteUrl,
    }
  }
}
