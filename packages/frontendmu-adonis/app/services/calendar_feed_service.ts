import ical, { ICalEventStatus } from 'ical-generator'
import env from '#start/env'
import Event from '#models/event'
import SiteSetting from '#models/site_setting'
import { canonicalUrl } from '#utils/site_url'

const DEFAULT_DURATION_HOURS = 4
const TIMEZONE = env.get('TZ')

/**
 * Builds the public .ics calendar feed containing all events that should be
 * visible per the per-event `includeInCalendar` override and the global
 * SiteSetting defaults (see Event#shouldAppearInCalendar).
 */
export default class CalendarFeedService {
  static async build(): Promise<string> {
    const settings = await SiteSetting.current()

    const calendar = ical({
      name: 'Frontend.mu Meetups',
      description: 'Upcoming and past Frontend.mu community meetups',
      timezone: TIMEZONE,
      url: canonicalUrl('/api/public/meetups.ics'),
      ttl: 60 * 60, // hint to clients to refresh hourly
    })

    if (!settings.calendarFeedEnabled) {
      return calendar.toString()
    }

    const events = await Event.query().orderBy('eventDate', 'desc')

    for (const event of events) {
      if (!event.shouldAppearInCalendar(settings)) continue
      this.addEvent(calendar, event)
    }

    return calendar.toString()
  }

  private static addEvent(calendar: ReturnType<typeof ical>, event: Event) {
    const { start, end, allDay } = this.resolveTimes(event)

    calendar.createEvent({
      id: event.id,
      start,
      end,
      allDay,
      timezone: TIMEZONE,
      summary: event.title,
      description: this.buildDescription(event),
      location: this.buildLocation(event) || undefined,
      url: canonicalUrl(`/meetup/${event.slug || event.id}`),
      lastModified: event.updatedAt ?? event.createdAt,
      status: event.status === 'cancelled' ? ICalEventStatus.CANCELLED : ICalEventStatus.CONFIRMED,
    })
  }

  private static resolveTimes(event: Event) {
    // start_time/end_time are wall-clock strings ("10:00") and event_date is a
    // calendar date, neither carrying a zone. Pin them to the configured
    // timezone rather than trusting whatever zone Lucid hydrated the date in,
    // so "10:00" always means 10:00 where the meetup happens.
    const date = event.eventDate.setZone(TIMEZONE, { keepLocalTime: true })

    if (!event.startTime) {
      // A DATE-valued DTEND is exclusive (RFC 5545 §3.6.1), so a single all-day
      // meetup ends on the following day. ical-generator passes these through
      // verbatim — an end equal to the start serialises as a zero-length event.
      const start = date.startOf('day')
      return { start, end: start.plus({ days: 1 }), allDay: true }
    }

    const start = this.combineDateAndTime(date, event.startTime)
    const end = event.endTime
      ? this.combineDateAndTime(date, event.endTime)
      : start.plus({ hours: DEFAULT_DURATION_HOURS })

    return { start, end, allDay: false }
  }

  private static combineDateAndTime(date: Event['eventDate'], time: string) {
    const [hour = 0, minute = 0] = time.split(':').map((part) => Number.parseInt(part, 10))
    return date.set({ hour, minute, second: 0, millisecond: 0 })
  }

  private static buildDescription(event: Event): string {
    const lines: string[] = []
    if (event.description) lines.push(event.description)

    const details: string[] = []
    if (event.venue) details.push(`Venue: ${event.venue}`)
    if (event.parkingLocation) details.push(`Parking: ${event.parkingLocation}`)
    if (details.length > 0) lines.push(details.join('\n'))

    lines.push(`More info & RSVP: ${canonicalUrl(`/meetup/${event.slug || event.id}`)}`)

    return lines.join('\n\n')
  }

  private static buildLocation(event: Event): string | null {
    const parts = [event.venue, event.location].filter((part): part is string =>
      Boolean(part && part.trim())
    )
    return parts.length > 0 ? parts.join(', ') : null
  }
}
