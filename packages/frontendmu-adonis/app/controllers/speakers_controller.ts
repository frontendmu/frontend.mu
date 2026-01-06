import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class SpeakersController {
  /**
   * Display a list of all speakers
   */
  async index({ inertia }: HttpContext) {
    let speakers: any[] = []

    try {
      const dbSpeakers = await User.query()
        .where('role', 'speaker')
        .orderBy('featured', 'desc')
        .orderBy('name', 'asc')

      speakers = dbSpeakers.map((speaker) => this.serializeSpeaker(speaker))
    } catch (error) {
      console.log('Database not available, using empty data')
    }

    return inertia.render('speakers/index', {
      speakers,
    })
  }

  /**
   * Display a single speaker profile
   */
  async show({ inertia, params }: HttpContext) {
    let speaker: any = null
    let sessions: any[] = []

    try {
      const dbSpeaker = await User.query()
        .where('id', params.id)
        .where('role', 'speaker')
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
    } catch (error) {
      console.log('Database not available, using empty data')
    }

    return inertia.render('speakers/show', {
      speaker,
      sessions,
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
