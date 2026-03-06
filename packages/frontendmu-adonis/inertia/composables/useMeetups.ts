import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { isDateInFuture, isDateInPast, isDateToday } from '../utils/date.js'
import type { EventSummaryDto } from '../types/index.js'

interface UseMeetupsOptions {
  pastMeetupsLimit?: number
}

interface UseMeetupsReturn {
  meetupsGroupedByYear: ComputedRef<Record<number, EventSummaryDto[]>>
  sortedMeetups: ComputedRef<EventSummaryDto[]>
  upcomingMeetups: ComputedRef<EventSummaryDto[]>
  todaysMeetups: ComputedRef<EventSummaryDto[]>
  pastMeetups: ComputedRef<EventSummaryDto[]>
  nextMeetup: ComputedRef<EventSummaryDto | undefined>
  areThereMeetupsToday: ComputedRef<boolean>
}

export function useMeetups(
  meetups: MaybeRefOrGetter<EventSummaryDto[]>,
  options: UseMeetupsOptions = {}
): UseMeetupsReturn {
  const { pastMeetupsLimit = 10 } = options

  const meetupsGroupedByYear = computed(() => {
    return toValue(meetups).reduce((acc: Record<number, EventSummaryDto[]>, event) => {
      const year = event.date ? new Date(event.date).getFullYear() : 0
      if (!acc[year]) {
        acc[year] = []
      }
      acc[year].push(event)
      return acc
    }, {})
  })

  const sortedMeetups = computed(() => {
    return [...toValue(meetups)].sort((a, b) => {
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    })
  })

  const upcomingMeetups = computed(() => {
    return sortedMeetups.value.filter((item) => {
      return item.date ? isDateInFuture(new Date(item.date)) : false
    })
  })

  const todaysMeetups = computed(() => {
    return sortedMeetups.value.filter((item) => {
      return item.date ? isDateToday(new Date(item.date)) : false
    })
  })

  const pastMeetups = computed(() => {
    const pastMeetupsData = sortedMeetups.value.filter((item) => {
      return item.date ? isDateInPast(new Date(item.date)) : false
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
