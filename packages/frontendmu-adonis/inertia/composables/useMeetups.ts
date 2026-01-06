import { computed, type ComputedRef } from 'vue'
import { isDateInFuture, isDateInPast, isDateToday } from '../utils/date'
import type { Meetup } from '../types'

interface UseMeetupsOptions {
  pastMeetupsLimit?: number
}

interface UseMeetupsReturn {
  meetupsGroupedByYear: ComputedRef<Record<number, Meetup[]>>
  sortedMeetups: ComputedRef<Meetup[]>
  upcomingMeetups: ComputedRef<Meetup[]>
  todaysMeetups: ComputedRef<Meetup[]>
  pastMeetups: ComputedRef<Meetup[]>
  nextMeetup: ComputedRef<Meetup | undefined>
  areThereMeetupsToday: ComputedRef<boolean>
}

export function useMeetups(
  meetups: Meetup[],
  options: UseMeetupsOptions = {}
): UseMeetupsReturn {
  const { pastMeetupsLimit = 10 } = options

  const meetupsGroupedByYear = computed(() => {
    return meetups.reduce((acc: Record<number, Meetup[]>, event) => {
      const year = new Date(event.Date).getFullYear()
      if (!acc[year]) {
        acc[year] = []
      }
      acc[year].push(event)
      return acc
    }, {})
  })

  const sortedMeetups = computed(() => {
    return [...meetups].sort((a, b) => {
      return new Date(b.Date).getTime() - new Date(a.Date).getTime()
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

  return {
    meetupsGroupedByYear,
    sortedMeetups,
    upcomingMeetups,
    todaysMeetups,
    pastMeetups,
    nextMeetup,
    areThereMeetupsToday,
  }
}

export default useMeetups
