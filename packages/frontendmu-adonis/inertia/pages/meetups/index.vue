<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import EventCard from '~/components/event/EventCard.vue'
import type { EventSummaryDto } from '~/types'
import { isDateInFuture, isDateToday } from '~/utils/date'

interface Props {
  meetups: EventSummaryDto[]
  canCreate: boolean
}

const props = defineProps<Props>()

// Group meetups by year
const meetupsGroupedByYear = computed(() => {
  return props.meetups.reduce((acc: Record<number, EventSummaryDto[]>, event) => {
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
        <div class="mb-20 space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black uppercase tracking-[0.3em] text-verse-500 dark:text-verse-300 bg-verse-500/10 px-2 py-0.5 rounded">Timeline</span>
          </div>
          
          <div class="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <h1 class="text-5xl md:text-7xl font-black tracking-tighter dark:text-white leading-none">
              Archives<span class="text-verse-600 dark:text-verse-400">.</span>
            </h1>
            
            <Link
              v-if="canCreate"
              href="/admin/events/create"
              class="text-xs font-black uppercase tracking-widest text-verse-600 dark:text-verse-400 hover:text-verse-500 transition-colors"
            >
              + Create Event
            </Link>
          </div>
          
          <p class="text-base text-gray-500 dark:text-gray-400 font-medium max-w-xl leading-relaxed">
            Historical record of all community gatherings since 2016.
          </p>
        </div>

        <!-- Timeline Grid -->
        <div class="space-y-16">
          <template v-for="year in years" :key="year">
            <div class="relative group/year">
              <div class="flex flex-col md:flex-row gap-8">
                <!-- Year Header -->
                <div class="md:w-24 shrink-0">
                  <div class="sticky top-24">
                    <span class="text-4xl font-black tracking-tighter text-gray-200 dark:text-verse-800 transition-colors group-hover/year:text-verse-500/30 select-none">
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
              <div class="mt-16 h-px w-full bg-gradient-to-r from-transparent via-gray-100 dark:via-verse-800 to-transparent"></div>
            </div>
          </template>
        </div>

        <!-- Empty state -->
        <div v-if="!meetups.length" class="text-center py-32 space-y-6">
          <div class="w-20 h-20 bg-verse-50 dark:bg-verse-900/20 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-10 h-10 text-verse-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
