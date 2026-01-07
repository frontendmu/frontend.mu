import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import User from '#models/user'
import Sponsor from '#models/sponsor'

export default class HomeController {
  /**
   * Display the home page with latest events, featured speakers, and sponsors
   */
  async index({ inertia }: HttpContext) {
    // Try to get data from database, fallback to empty arrays
    let events: any[] = []
    let featuredSpeakers: any[] = []
    let sponsors: any[] = []
    let stats = {
      meetups: 0,
      speakers: 0,
      contributors: 30, // Will be fetched from GitHub API later
    }

    try {
      // Get all published events for the homepage
      const dbEvents = await Event.query()
        .where('status', 'published')
        .orderBy('eventDate', 'desc')
        .preload('sessions', (query) => {
          query.preload('speakers')
        })
        .preload('sponsors')

      events = dbEvents.map((event) => this.serializeEvent(event))

      // Get featured speakers
      const dbSpeakers = await User.query().where('featured', true).orderBy('name', 'asc').limit(12)

      featuredSpeakers = dbSpeakers.map((speaker) => this.serializeSpeaker(speaker))

      // Get active sponsors
      const dbSponsors = await Sponsor.query().where('status', 'active').orderBy('name', 'asc')

      sponsors = dbSponsors.map((sponsor) => this.serializeSponsor(sponsor))

      // Get stats
      const totalMeetups = await Event.query().where('status', 'published').count('* as total')
      const totalSpeakers = await User.query()
        .whereHas('sessions', (query) => {
          query.whereNotNull('id')
        })
        .count('* as total')

      stats.meetups = Number(totalMeetups[0].$extras.total) || 0
      stats.speakers = Number(totalSpeakers[0].$extras.total) || 0
    } catch (error) {
      // Database not available, use empty data
      console.log('Database not available, using placeholder data', error)
    }

    return inertia.render('home', {
      events,
      featuredSpeakers,
      sponsors,
      stats,
    })
  }

  /**
   * Serialize event for frontend
   */
  private serializeEvent(event: Event) {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      Date: event.eventDate?.toISO(),
      Time: event.startTime,
      Venue: event.venue,
      Location: event.location,
      Attendees: event.attendeeCount,
      accepting_rsvp: event.acceptingRsvp,
      album: event.albumName,
      sessions:
        event.sessions?.map((session) => ({
          id: session.id,
          Session_id: {
            title: session.title,
            speakers: session.speakers?.[0]
              ? {
                  id: session.speakers[0].id,
                  name: session.speakers[0].name,
                  github_account: session.speakers[0].githubUsername,
                }
              : null,
          },
        })) || [],
      sponsors: [],
    }
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
    }
  }

  /**
   * Serialize sponsor for frontend
   */
  private serializeSponsor(sponsor: Sponsor) {
    return {
      id: sponsor.id,
      name: sponsor.name,
      website: sponsor.website,
      logoUrl: sponsor.logoUrl,
      sponsorTypes: sponsor.sponsorTypes,
    }
  }
}
