<script setup lang="ts">
import { computed } from 'vue'
import { DateTime } from 'luxon'
import { Head, Link } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
import EventCard from '~/components/event/EventCard.vue'
import type Event from '#models/event'

interface Props {
  meetups: Event[]
  canCreate: boolean
}

const props = defineProps<Props>()

const parseEventDate = (date: unknown): DateTime | null => {
  if (!date) return null
  if (typeof date === 'string') return DateTime.fromISO(date)
  if (typeof date === 'object' && 'toJSDate' in date) return DateTime.fromJSDate(date.toJSDate())
  return DateTime.fromISO(date as unknown as string)
}

// Group meetups by year
const meetupsGroupedByYear = computed(() => {
  return props.meetups.reduce((acc: Record<number, Event[]>, event) => {
    const dt = parseEventDate(event.eventDate)
    const year = dt?.year ?? 0
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(event)
    return acc
  }, {})
})

// Get years in descending order
const years = computed(() =>
  Object.keys(meetupsGroupedByYear.value)
    .map(Number)
    .sort((a, b) => b - a)
)

// Get upcoming meetups
const upcomingMeetups = computed(() =>
  props.meetups.filter((meetup) => {
    const dt = parseEventDate(meetup.eventDate)
    return dt ? dt > DateTime.now() : false
  })
)

// Get next meetup
const nextMeetup = computed(() => {
  const sorted = [...upcomingMeetups.value].sort((a, b) => {
    const dateA = parseEventDate(a.eventDate)
    const dateB = parseEventDate(b.eventDate)
    return (dateA?.toMillis() ?? 0) - (dateB?.toMillis() ?? 0)
  })
  return sorted[0]
})

// Get today's meetups
const todaysMeetups = computed(() =>
  props.meetups.filter((meetup) => {
    const dt = parseEventDate(meetup.eventDate)
    return dt ? dt.hasSame(DateTime.now(), 'day') : false
  })
)

const nextMeetupId = computed(() => nextMeetup.value?.id)
</script>

<template>

  <Head title="All Meetups" />
  <DefaultLayout>
    <ContentBlock>
      <div class="past-events-container pb-4 py-8">
        <div class="flex flex-col gap-2 mb-8">
          <div class="flex items-center justify-between gap-4">
            <BaseHeading :level="1"> All meetups </BaseHeading>
            <Link
              v-if="canCreate"
              href="/admin/events/create"
              class="inline-flex items-center gap-2 px-4 py-2 bg-verse-600 hover:bg-verse-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Create Event
            </Link>
          </div>
          <p class="text-verse-700 dark:text-verse-300 py-4">
            Over the years, we've organized a lot of meetups. Here's a list of
            all of them.
          </p>
        </div>

        <template v-for="year in years" :key="year">
          <div class="grid pb-16 sm:pb-40 last:pb-0 relative group is-page">
            <div class="text-lg font-bold text-verse-900 uppercase md:hidden">
              {{ year }}
            </div>
            <div
              class="absolute origin-bottom-left left-[-150px] top-[50px] opacity-10 -rotate-90 text-[100px] font-bold text-verse-900 dark:text-verse-100 group-hover-[.is-page]:left-[-170px] transition-all duration-300 hidden md:block">
              {{ year }}
            </div>
            <div class="grid grid-cols-2 gap-8 relative z-10">
              <EventCard v-for="event in meetupsGroupedByYear[year]" :key="event.id" :event="event"
                :is-next-meetup="event.id === nextMeetupId" :is-meetup-today="todaysMeetups.some((meetup) => meetup.id === event.id)
                  " class="card-entrance" />
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <div v-if="!meetups.length" class="text-center py-16 text-verse-600 dark:text-verse-400">
          <p>No meetups found.</p>
        </div>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>

<style scoped>
@keyframes list-item-scroll-effect {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }

  20%,
  80% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(0.95);
  }
}

@supports (animation-timeline: view()) {
  .card-entrance {
    view-timeline-name: --list-item-timeline;
    animation-timeline: --list-item-timeline;
    animation-range-start: entry 20%;
    animation-range-end: cover 95%;
    animation-fill-mode: both;
    animation-name: list-item-scroll-effect;
    transform-origin: center center;
  }
}
</style>
