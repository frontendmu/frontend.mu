import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import Rsvp from '#models/rsvp'
import User from '#models/user'
import EventPolicy from '#policies/event_policy'

// Public-safe attendee info (no email, limited data)
interface PublicAttendee {
  id: string
  name: string
  avatarUrl: string | null
  githubUsername: string | null
}

export default class EventsController {
  /**
   * Display a list of all events grouped by year
   */
  async index({ inertia, auth, bouncer }: HttpContext) {
    let meetups: Event[] = []
    let canCreate = false

    try {
      const events = await Event.query()
        .where('status', 'published')
        .orderBy('eventDate', 'desc')
        .preload('sessions', (query) => {
          query.preload('speakers')
        })

      meetups = events

      // Check if user can create events
      await auth.check()
      if (auth.user) {
        canCreate = await bouncer.with(EventPolicy).allows('create')
      }
    } catch (error) {
      console.log('Database not available, using empty data')
    }

    return inertia.render('meetups/index', {
      meetups,
      canCreate,
    })
  }

  /**
   * Display a single event
   */
  async show({ inertia, params, auth, bouncer }: HttpContext) {
    let meetup: Event | null = null
    let userRsvp: Rsvp | null = null
    let rsvpCount = 0
    let canEdit = false
    let attendees: PublicAttendee[] = []

    try {
      const event = await Event.query()
        .where('id', params.id)
        .where('status', 'published')
        .preload('sessions', (query) => {
          query.preload('speakers')
        })
        .preload('photos')
        .preload('sponsors')
        .first()

      if (event) {
        meetup = event

        // Get RSVP count for this event
        const countResult = await Rsvp.query()
          .where('eventId', event.id)
          .where('status', 'confirmed')
          .count('* as total')
          .first()
        rsvpCount = Number(countResult?.$extras.total || 0)

        // Check if authenticated user has RSVPd
        // Need to call auth.check() first to populate auth.user
        await auth.check()
        const user = auth.user as User | undefined
        if (user) {
          userRsvp = await Rsvp.query()
            .where('userId', user.id)
            .where('eventId', event.id)
            .whereNot('status', 'cancelled')
            .first()

          // Check if user can edit this event
          canEdit = await bouncer.with(EventPolicy).allows('edit', event)

          // Get attendees list (only for authenticated users)
          // Return truncated info for privacy
          const rsvps = await Rsvp.query()
            .where('eventId', event.id)
            .where('status', 'confirmed')
            .preload('user')
            .orderBy('createdAt', 'asc')

          attendees = rsvps.map((rsvp) => ({
            id: rsvp.user.id,
            name: this.truncateName(rsvp.user.name),
            avatarUrl: rsvp.user.avatarUrl,
            githubUsername: rsvp.user.githubUsername,
          }))
        }
      }
    } catch (error) {
      console.log('Database not available, using empty data', error)
    }

    return inertia.render('meetups/show', {
      meetup,
      userRsvp,
      rsvpCount,
      canEdit,
      attendees,
    })
  }

  /**
   * Truncate name for privacy - show first name and last initial
   * e.g., "Sandeep Ramgolam" -> "Sandeep R."
   */
  private truncateName(fullName: string): string {
    if (!fullName) return 'Anonymous'
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) return parts[0]
    const firstName = parts[0]
    const lastInitial = parts[parts.length - 1][0]
    return `${firstName} ${lastInitial}.`
  }
}
