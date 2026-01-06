import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'

export default class EventsController {
  /**
   * Display a list of all events grouped by year
   */
  async index({ inertia }: HttpContext) {
    let meetups: any[] = []

    try {
      const events = await Event.query()
        .where('status', 'published')
        .orderBy('eventDate', 'desc')
        .preload('sessions', (query) => {
          query.preload('speakers')
        })

      meetups = events.map((event) => this.serializeEvent(event))
    } catch (error) {
      console.log('Database not available, using empty data')
    }

    return inertia.render('meetups/index', {
      meetups,
    })
  }

  /**
   * Display a single event
   */
  async show({ inertia, params }: HttpContext) {
    let meetup: any = null

    try {
      const event = await Event.query()
        .where('id', params.id)
        .where('status', 'published')
        .preload('sessions', (query) => {
          query.preload('speakers')
        })
        .preload('photos')
        .first()

      if (event) {
        meetup = this.serializeEvent(event)
      }
    } catch (error) {
      console.log('Database not available, using empty data')
    }

    return inertia.render('meetups/show', {
      meetup,
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
      seats_available: event.seatsAvailable,
      album: event.albumName,
      map: event.mapUrl,
      parking_location: event.parkingLocation,
      sessions:
        event.sessions?.map((session) => ({
          id: session.id,
          Session_id: {
            title: session.title,
            description: session.description,
            speakers: session.speakers?.[0]
              ? {
                  id: session.speakers[0].id,
                  name: session.speakers[0].name,
                  github_account: session.speakers[0].githubUsername,
                  featured: session.speakers[0].featured,
                }
              : null,
          },
        })) || [],
      sponsors: [], // Will be populated when many-to-many is properly set up
      photos:
        event.photos?.map((photo) => ({
          id: photo.id,
          url: photo.photoUrl,
          caption: photo.caption,
        })) || [],
    }
  }
}
