import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import Rsvp from '#models/rsvp'
import User from '#models/user'
import EventPolicy from '#policies/event_policy'
import { toEventSummary, toEvent, toPublicAttendee } from '#dtos/factories'

export default class EventsController {
  async index({ inertia, auth, bouncer }: HttpContext) {
    const events = await Event.query()
      .where('status', 'published')
      .orderBy('eventDate', 'desc')
      .preload('sessions', (query) => {
        query.preload('speakers')
      })

    const meetups = events.map(toEventSummary)

    let canCreate = false
    await auth.check()
    if (auth.user) {
      canCreate = await bouncer.with(EventPolicy).allows('create')
    }

    return inertia.render('meetups/index', {
      meetups,
      canCreate,
    })
  }

  async show({ inertia, params, auth, bouncer }: HttpContext) {
    const event = await Event.query()
      .where('id', params.id)
      .where('status', 'published')
      .preload('sessions', (query) => {
        query.preload('speakers')
      })
      .preload('photos')
      .preload('sponsors')
      .firstOrFail()

    let userRsvp: Rsvp | null = null
    let canEdit = false
    let attendees: ReturnType<typeof toPublicAttendee>[] = []
    let rsvpCount = 0

    await auth.check()
    const user = auth.user as User | undefined

    if (user) {
      const rsvps = await Rsvp.query()
        .where('eventId', event.id)
        .where('status', 'confirmed')
        .preload('user')
        .orderBy('createdAt', 'asc')

      rsvpCount = rsvps.length

      userRsvp = await Rsvp.query()
        .where('userId', user.id)
        .where('eventId', event.id)
        .whereNot('status', 'cancelled')
        .first()

      canEdit = await bouncer.with(EventPolicy).allows('edit', event)

      attendees = rsvps.map((rsvp) =>
        toPublicAttendee(rsvp.user, this.truncateName(rsvp.user.name))
      )
    } else {
      const countResult = await Event.query()
        .where('id', event.id)
        .withCount('rsvps', (q) => q.where('status', 'confirmed'))
        .firstOrFail()
      rsvpCount = Number(countResult.$extras.rsvps_count) || 0
    }

    return inertia.render('meetups/show', {
      meetup: toEvent(event),
      userRsvp,
      rsvpCount,
      canEdit,
      attendees,
    })
  }

  private truncateName(fullName: string): string {
    if (!fullName) return 'Anonymous'
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) return parts[0]
    const firstName = parts[0]
    const lastInitial = parts[parts.length - 1][0]
    return `${firstName} ${lastInitial}.`
  }
}
