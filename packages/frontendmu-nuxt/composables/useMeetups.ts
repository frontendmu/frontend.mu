import eventsResponse from '../../frontendmu-data/data/meetups-raw.json'
import type { Meetup, Session, Speaker } from '../utils/types'

interface RawEvent {
  id: number
  title: string
  Date: string
  Attendees: number
  Venue: string
  description: string | null
  Location: string
  Time: string
  accepting_rsvp: boolean
  images: { imagename: string }[] | null
  gallery: any[] | null
  album: string | null
  sessions: {
    id: number
    Events_id: any
    Session_id: {
      title: string
      speakers: {
        name: string
        id: string
        github_account: string
        status: string
        sort: string | null
        featured: boolean
        date_created: string
        date_updated: string
      }
    }
  }[] | null
  sponsors: any[] | null
  seats_available?: number
  rsvplink?: string | null
}

function transformSession(rawSession: NonNullable<RawEvent['sessions']>[0]): Session {
  return {
    id: rawSession.id,
    Events_id: rawSession.Events_id,
    Session_id: {
      title: rawSession.Session_id.title,
      speakers: {
        ...rawSession.Session_id.speakers,
        status: rawSession.Session_id.speakers.status || '',
        sort: rawSession.Session_id.speakers.sort || null,
        featured: rawSession.Session_id.speakers.featured || false,
        date_created: rawSession.Session_id.speakers.date_created || '',
        date_updated: rawSession.Session_id.speakers.date_updated || '',
      },
    },
  }
}

const allMeetups: Meetup[] = ((eventsResponse as unknown) as RawEvent[]).map(event => ({
  id: String(event.id),
  title: event.title || '',
  Date: event.Date || '',
  Attendees: event.Attendees || 0,
  Venue: event.Venue || '',
  description: event.description || '',
  Location: event.Location || '',
  Time: event.Time || '',
  accepting_rsvp: event.accepting_rsvp || false,
  images: event.images || [],
  gallery: event.gallery || [],
  album: event.album,
  sessions: event.sessions ? event.sessions.map(transformSession) : [],
  sponsors: event.sponsors || [],
}))
export default function useMeetups({
  pastMeetupsLimit = 10,
}: {
  pastMeetupsLimit?: number
}) {
  const meetupsGroupedByYear = computed(() => allMeetups.reduce((acc: Record<number, Meetup[]>, event) => {
    const year = new Date(event.Date).getFullYear()
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(event)
    return acc
  }, {}))

  const sortedMeetups = computed(() => {
    return (allMeetups || []).sort((a, b) => {
      return (
        new Date(b.Date).getTime() - new Date(a.Date).getTime()
      )
    })
  })

  const upcomingMeetups = computed(() => {
    return sortedMeetups.value.filter((item) => {
      return isDateInFuture(new Date(item.Date))
    })
  })

  const todaysMeetups = computed(() => {
    return sortedMeetups.value.filter((item) => {
      return isDateToday(new Date(item.Date))
    })
  })

  const pastMeetups = computed(() => {
    const pastMeetupsData = sortedMeetups.value.filter((item) => {
      return isDateInPast(new Date(item.Date))
    })

    return pastMeetupsData.slice(0, pastMeetupsLimit)
  })

  const nextMeetup = computed(() => {
    return upcomingMeetups.value[upcomingMeetups.value.length - 1]
  })

  const areThereMeetupsToday = computed(() => {
    return todaysMeetups.value.length > 0
  })

  const allSponsors = computed(() => {
    const sponsorsByName = new Map<string, typeof allMeetups[number]['sponsors'][number]>()
    const sponsors = allMeetups.map(meetup => meetup.sponsors).flat()

    sponsors.forEach((sponsor) => {
      const sponsorName = sponsor.Sponsor_id.Name.toLowerCase()

      sponsorsByName.set(sponsorName, sponsor)
    })

    const dedupedSponsors = [...sponsorsByName.values()]

    return dedupedSponsors
  })

  return {
    allMeetups,
    meetupsGroupedByYear,
    upcomingMeetups,
    todaysMeetups,
    pastMeetups,
    nextMeetup,
    areThereMeetupsToday,
    allSponsors,
  }
}
