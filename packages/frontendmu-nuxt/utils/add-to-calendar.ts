import type { DirectusEvent } from '@/utils/types'

type MeetupData = DirectusEvent
type GoogleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${string}&details=${string}&dates=${string}/${string}${string}`

export function createGoogleCalendarUrl(meetupData: MeetupData): GoogleCalendarUrl {
  const eventTitle = meetupData.title || 'Frontend.mu Meetup'

  const cleanDescription = meetupData.description?.replace(/<[^>]*>/g, '') || ''
  const rsvpUrl = typeof window !== 'undefined' ? window.location.href : ''
  const eventDescription = `${cleanDescription}

Venue: ${meetupData.Venue || 'TBD'}
Location: ${meetupData.Location || 'TBD'}
${meetupData.parking_location ? `Parking: ${meetupData.parking_location}` : ''}

RSVP at: ${rsvpUrl}`

  const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render')
  googleCalendarUrl.searchParams.set('action', 'TEMPLATE')
  googleCalendarUrl.searchParams.set('text', eventTitle)
  googleCalendarUrl.searchParams.set('details', eventDescription)

  let eventStartDate: string = ''
  let eventEndDate: string = ''
  if (meetupData.Date) {
    const eventDate = new Date(meetupData.Date)

    if (meetupData.Time) {
      const timeStr = meetupData.Time.toLowerCase().trim()
      let hours = 10 // Default start time
      const minutes = 0

      if (timeStr.includes('to')) {
        // Handle "10am to 2pm" format
        const match = timeStr.match(/(\d{1,2})(am|pm)\s+to\s+(\d{1,2})(am|pm)/)
        if (match) {
          hours = Number.parseInt(match[1], 10)
          const startAmPm = match[2]
          const endHour = Number.parseInt(match[3], 10)
          const endAmPm = match[4]

          if (startAmPm === 'pm' && hours !== 12)
            hours += 12
          else if (startAmPm === 'am' && hours === 12)
            hours = 0

          let endHour24 = endHour
          if (endAmPm === 'pm' && endHour !== 12)
            endHour24 += 12
          else if (endAmPm === 'am' && endHour === 12)
            endHour24 = 0

          eventDate.setHours(hours, minutes, 0, 0)
          const endDateTime = new Date(eventDate.getTime() + (endHour24 - hours) * 60 * 60 * 1000)
          eventStartDate = `${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
          eventEndDate = `${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
        }
      }
      else {
        // Handle "8pm" format, defaults to 4-hour event
        const match = timeStr.match(/(\d{1,2})(am|pm)/)
        if (match) {
          hours = Number.parseInt(match[1], 10)
          const amOrPm = match[2]

          if (amOrPm === 'pm' && hours !== 12)
            hours += 12
          else if (amOrPm === 'am' && hours === 12)
            hours = 0

          eventDate.setHours(hours, minutes, 0, 0)
          const endDateTime = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000)
          eventStartDate = `${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
          eventEndDate = `${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
        }
      }
    }
    else {
      // Default time: 10:00 AM - 2:00 PM
      eventDate.setHours(10, 0, 0, 0)
      const endDateTime = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000)
      eventStartDate = `${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
      eventEndDate = `${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
    }

    if (!eventStartDate || !eventEndDate) {
      const start = new Date(eventDate)
      start.setHours(10, 0, 0, 0)
      const end = new Date(start.getTime() + 4 * 60 * 60 * 1000)
      eventStartDate = `${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
      eventEndDate = `${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
    }
    googleCalendarUrl.searchParams.set('dates', `${eventStartDate}/${eventEndDate}`)
  }

  const location = [meetupData.Venue, meetupData.Location].filter(Boolean).join(', ').trim()
  if (location)
    googleCalendarUrl.searchParams.set('location', location)

  return googleCalendarUrl.toString() as GoogleCalendarUrl
}

/**
 * Opens Google Calendar and creates a new event in a new tab with the meetup event details
 * @param meetupData - The meetup event data from Directus
 */
export function addEventToGoogleCalendar(meetupData: MeetupData): void {
  const calendarUrl = createGoogleCalendarUrl(meetupData)
  if (typeof window !== 'undefined')
    window.open(calendarUrl, '_blank')
}
