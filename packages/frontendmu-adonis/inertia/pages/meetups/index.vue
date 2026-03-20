<script setup lang="ts">
import { computed } from 'vue'
import { Head } from '@inertiajs/vue3'
import { Link } from '@inertiajs/vue3'
import { Data } from '@generated/data'
import EventCard from '~/components/event/EventCard.vue'
import { isDateInFuture, isDateToday } from '~/utils/date'

interface Props {
  meetups: Data.Event[]
  canCreate: boolean
}

const props = defineProps<Props>()

// Group meetups by year
const meetupsGroupedByYear = computed(() => {
  return props.meetups.reduce((acc: Record<number, Data.Event[]>, event) => {
    if (!event.date) return acc
    const year = new Date(event.date).getFullYear()
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
    return meetup.date ? isDateInFuture(new Date(meetup.date)) : false
  })
)

// Get next meetup
const nextMeetup = computed(() => {
  const sorted = [...upcomingMeetups.value].sort((a, b) => {
    return new Date(a.date!).getTime() - new Date(b.date!).getTime()
  })
  return sorted[0]
})

// Get today's meetups
const todaysMeetups = computed(() =>
  props.meetups.filter((meetup) => {
    return meetup.date ? isDateToday(new Date(meetup.date)) : false
  })
)

const nextMeetupId = computed(() => nextMeetup.value?.id)
</script>

<template>
  <Head title="All Meetups" />
  <main class="relative min-h-screen pt-40 pb-32">
    <div class="contain relative z-10 max-w-5xl">
      <!-- Page Header -->
      <div class="mb-16 space-y-4">
        <div class="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <h1
              class="text-3xl md:text-4xl font-display tracking-tight text-gray-900 dark:text-white leading-none"
            >
              Meetup Archive
            </h1>
          </div>

          <Link
            v-if="canCreate"
            href="/admin/events/create"
            class="text-xs font-semibold text-verse-500 dark:text-verse-400 hover:text-verse-600 dark:hover:text-verse-300 transition-colors"
          >
            + Create Event
          </Link>
        </div>
      </div>

      <!-- Timeline Grid -->
      <div class="space-y-16">
        <template v-for="year in years" :key="year">
          <div class="relative group/year">
            <div class="flex flex-col md:flex-row gap-8">
              <!-- Year Header -->
              <div class="md:w-24 shrink-0">
                <div class="sticky top-24">
                  <span class="text-3xl font-display text-gray-300 dark:text-gray-600 select-none">
                    {{ year }}
                  </span>
                </div>
              </div>

              <!-- Events Grid -->
              <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <EventCard
                  v-for="event in meetupsGroupedByYear[year]"
                  :key="event.id"
                  :event="event"
                  :is-next-meetup="event.id === nextMeetupId"
                  :is-meetup-today="todaysMeetups.some((meetup) => meetup.id === event.id)"
                />
              </div>
            </div>

            <!-- Year Divider -->
            <div class="mt-16 h-px w-full bg-gray-100 dark:bg-verse-900"></div>
          </div>
        </template>
      </div>

      <!-- Empty state -->
      <div v-if="!meetups.length" class="text-center py-32 space-y-6">
        <div
          class="w-16 h-16 bg-gray-50 dark:bg-verse-900 rounded-lg flex items-center justify-center mx-auto"
        >
          <svg
            class="w-8 h-8 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p class="text-2xl font-bold text-gray-400">No meetups found in the archives.</p>
      </div>
    </div>
  </main>
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
