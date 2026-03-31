import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import Rsvp from '#models/rsvp'
import type User from '#models/user'
import EventPolicy from '#policies/event_policy'
import EventTransformer from '#transformers/event_transformer'
import RsvpTransformer from '#transformers/rsvp_transformer'
import PublicAttendeeTransformer from '#transformers/public_attendee_transformer'

export default class EventsController {
  async index({ inertia, auth, bouncer }: HttpContext) {
    const events = await Event.query()
      .where('status', 'published')
      .orderBy('eventDate', 'desc')
      .preload('sessions', (query) => {
        query.preload('speakers')
      })

    const meetups = EventTransformer.transform(events)

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

  async show(ctx: HttpContext) {
    const { inertia, params, auth, bouncer, serializeWithoutWrapping: serialize } = ctx
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
    let attendees: Array<{
      id: string
      name: string
      avatarUrl: string | null
      githubUsername: string | null
    }> = []
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

      attendees = await Promise.all(
        rsvps.map(async (rsvp) => {
          rsvp.user.$extras.displayName = this.truncateName(rsvp.user.name)
          return (await serialize(PublicAttendeeTransformer.transform(rsvp.user))) as {
            id: string
            name: string
            avatarUrl: string | null
            githubUsername: string | null
          }
        })
      )
    } else {
      const countResult = await Event.query()
        .where('id', event.id)
        .withCount('rsvps', (q) => q.where('status', 'confirmed'))
        .firstOrFail()
      rsvpCount = Number(countResult.$extras.rsvps_count) || 0
    }

    return inertia.render('meetups/show', {
      meetup: EventTransformer.transform(event).useVariant('detail'),
      userRsvp: userRsvp ? RsvpTransformer.transform(userRsvp) : null,
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
