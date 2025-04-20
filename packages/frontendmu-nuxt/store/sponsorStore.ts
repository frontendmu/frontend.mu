import { defineStore } from 'pinia'
import sponsorsRaw from '../../frontendmu-data/data/sponsors-raw.json'

// Type definitions
export interface SponsorMeetup {
  id: string | number
  title: string
  date: string
  location?: string
  venue?: string
  description?: string
}

export interface Sponsor {
  id: string
  name: string
  logo: string
  website?: string
  description?: string
  sponsor_type?: string[]
  darkbg?: boolean
  meetups: SponsorMeetup[]
}

function getYear(date: string) {
  if (!date)
    return undefined
  return date.slice(0, 4)
}

export const useSponsorStore = defineStore('sponsor', {
  state: () => ({
    sponsors: sponsorsRaw as unknown as Sponsor[],
  }),
  getters: {
    // 1. Get sponsors for a given eventId
    getSponsorByEventId: state => (eventId: string | number) => {
      return state.sponsors.filter(sponsor =>
        sponsor.meetups.some(meetup => String(meetup.id) === String(eventId)),
      )
    },
    // 2. Get sponsors sorted by most recent event date
    getSponsorsSortedByDate: (state) => {
      return [...state.sponsors].sort((a, b) => {
        const aLatest = a.meetups.reduce((max, m) => m.date > max ? m.date : max, '')
        const bLatest = b.meetups.reduce((max, m) => m.date > max ? m.date : max, '')
        return bLatest.localeCompare(aLatest)
      })
    },
    // 3. Get sponsors with most events
    getSponsorsMostEvents: (state) => {
      return [...state.sponsors].sort((a, b) => b.meetups.length - a.meetups.length)
    },
    // 4. Group sponsors' events by year
    getSponsorsEventsGroupedByYear: (state) => {
      const grouped: Record<string, { sponsor: Sponsor, meetups: SponsorMeetup[] }[]> = {}
      for (const sponsor of state.sponsors) {
        for (const meetup of sponsor.meetups) {
          const year = getYear(meetup.date)
          if (!year)
            continue
          if (!grouped[year])
            grouped[year] = []
          let sponsorYear = grouped[year].find(entry => entry.sponsor.id === sponsor.id)
          if (!sponsorYear) {
            sponsorYear = { sponsor, meetups: [] }
            grouped[year].push(sponsorYear)
          }
          sponsorYear.meetups.push(meetup)
        }
      }
      return grouped
    },
    // 5. Get sponsors for a specific year
    getSponsorsForYear: state => (year: string) => {
      return state.sponsors.filter(sponsor =>
        sponsor.meetups.some(meetup => getYear(meetup.date) === year),
      )
    },
    // 6. Get sponsors for the current year
    getSponsorsForCurrentYear(): Sponsor[] {
      const year = new Date().getFullYear().toString()
      return this.getSponsorsForYear(year)
    },
  },
})
