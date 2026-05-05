import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Event from '#models/event'
import Rsvp from '#models/rsvp'
import EventPolicy from '#policies/event_policy'
import EventTransformer from '#transformers/event_transformer'
import AdminAttendeeTransformer from '#transformers/admin_attendee_transformer'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default class AdminEventAttendeesController {
  async show({ inertia, params, bouncer }: HttpContext) {
    await bouncer.with(EventPolicy).authorize('viewAny')

    const lookupColumn = UUID_REGEX.test(params.idOrSlug) ? 'id' : 'slug'
    const event = await Event.query().where(lookupColumn, params.idOrSlug).firstOrFail()

    const rsvps = await Rsvp.query()
      .where('eventId', event.id)
      .preload('user')
      .orderBy('createdAt', 'desc')

    const counts = {
      total: rsvps.length,
      confirmed: rsvps.filter((r) => r.status === 'confirmed').length,
      waitlist: rsvps.filter((r) => r.status === 'waitlist').length,
      cancelled: rsvps.filter((r) => r.status === 'cancelled').length,
    }

    const sortedByCreated = [...rsvps].sort((a, b) => {
      const ta = a.createdAt?.toMillis() ?? 0
      const tb = b.createdAt?.toMillis() ?? 0
      return ta - tb
    })
    const firstRsvpAt = sortedByCreated[0]?.createdAt ?? null
    const rsvpOpenAt = firstRsvpAt
      ? firstRsvpAt.minus({ days: 2 }).toISO()
      : DateTime.now().toISO()

    const timeline = {
      rsvpOpenAt,
      rsvpCloseAt: event.rsvpClosingDate?.toISO() ?? null,
      eventAt: event.eventDate?.toISO() ?? null,
    }

    return inertia.render('admin/events/attendees', {
      event: EventTransformer.transform(event).useVariant('detail'),
      attendees: AdminAttendeeTransformer.transform(rsvps),
      counts,
      timeline,
    })
  }
}
