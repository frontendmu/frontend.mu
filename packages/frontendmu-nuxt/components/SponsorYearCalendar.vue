<script setup lang="ts">
import { computed, ref } from 'vue'
import useMeetups from '../composables/useMeetups'
import type { Meetup } from '../utils/types'

const { meetupsGroupedByYear } = useMeetups({ pastMeetupsLimit: 1000 })

const currentYear = new Date().getFullYear()
const selectedYear = ref<number>(currentYear)

const years = computed(() => {
  const allYears = Object.keys(meetupsGroupedByYear.value)
    .map(year => Number.parseInt(year))
    .sort((a, b) => b - a)

  // Filter to show past years and 2 years in future
  return allYears.filter(year => year <= currentYear + 2)
})

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const yearMeetups = computed<(Meetup | null)[]>(() => {
  const yearData = meetupsGroupedByYear.value[selectedYear.value]
  const monthlyMeetups: (Meetup | null)[] = Array(12).fill(null)

  if (yearData) {
    yearData.forEach((meetup) => {
      const date = new Date(meetup.Date)
      const month = date.getMonth()
      const existingMeetup = monthlyMeetups[month]

      // If no existing meetup for this month, use this one
      if (!existingMeetup) {
        monthlyMeetups[month] = meetup
        return
      }

      // If current meetup has sponsors and existing doesn't, prefer current
      const currentHasSponsors = meetup.sponsors && meetup.sponsors.length > 0
      const existingHasSponsors = existingMeetup.sponsors && existingMeetup.sponsors.length > 0

      if (currentHasSponsors && !existingHasSponsors) {
        monthlyMeetups[month] = meetup
        return
      }

      // If existing has sponsors and current doesn't, keep existing
      if (existingHasSponsors && !currentHasSponsors) {
        return
      }

      // If both have sponsors or both don't have sponsors, choose the later date
      const currentDate = new Date(meetup.Date)
      const existingDate = new Date(existingMeetup.Date)

      if (currentDate > existingDate) {
        monthlyMeetups[month] = meetup
      }
    })
  }

  return monthlyMeetups
})

function isInFuture(month: number) {
  const today = new Date()
  const meetup = yearMeetups.value[month]

  // If no meetup for this month, fall back to month-based comparison
  if (!meetup) {
    return selectedYear.value > today.getFullYear()
      || (selectedYear.value === today.getFullYear() && month > today.getMonth())
  }

  // Compare actual meetup date with today
  const meetupDate = new Date(meetup.Date)
  return meetupDate > today
}

function navigateYear(direction: number) {
  const newYear = selectedYear.value + direction
  if (years.value.includes(newYear)) {
    selectedYear.value = newYear
  }
}
</script>

<template>
  <div class="mb-16">
    <div class="flex items-center justify-between mb-8">
      <div id="calendar">
        <BaseHeading :level="2" class="!mb-4">
          Meetup Calendar
        </BaseHeading>
        <p class="text-lg text-verse-600 dark:text-verse-300">
          View upcoming sponsorship opportunities
        </p>
      </div>
      <div class="flex items-center gap-4">
        <button
          :disabled="!years.includes(selectedYear - 1)"
          class="p-2 rounded-lg hover:bg-verse-100 dark:hover:bg-verse-700 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="navigateYear(-1)"
        >
          <span class="sr-only">Previous Year</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span class="text-xl font-semibold">{{ selectedYear }}</span>
        <button
          :disabled="!years.includes(selectedYear + 1)"
          class="p-2 rounded-lg hover:bg-verse-100 dark:hover:bg-verse-700 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="navigateYear(1)"
        >
          <span class="sr-only">Next Year</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <div class="pb-4">
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-4">
        <div v-for="(month, index) in months" :key="month" class="flex-1">
          <MonthCard :month="month" :meetup="yearMeetups[index]" :is-in-future="isInFuture(index)" />
        </div>
      </div>
    </div>
  </div>
</template>
