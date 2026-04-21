<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import { useMeetups } from '~/composables/use_meetups'
import EventCardFeatured from '~/components/home/EventCardFeatured.vue'
import EventCardSmall from '~/components/home/EventCardSmall.vue'
import EventCardModern from '~/components/home/EventCardModern.vue'

interface Props {
  events: Data.Event[]
  userRsvpEventIds?: string[]
}

const props = defineProps<Props>()

const { nextMeetup, upcomingMeetups, pastMeetups, todaysMeetups, areThereMeetupsToday } =
  useMeetups(props.events, { pastMeetupsLimit: 5 })

const remainingUpcomingData = computed(() =>
  areThereMeetupsToday.value
    ? upcomingMeetups.value
    : upcomingMeetups.value.slice(0, upcomingMeetups.value.length - 1)
)
</script>

<template>
  <section class="relative z-20 py-24 overflow-hidden">
    <div class="contain mx-auto flex flex-col gap-16">
      <!-- Featured / Today / Next -->
      <div v-if="areThereMeetupsToday || nextMeetup" class="space-y-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="space-y-2">
            <h2
              class="text-3xl md:text-4xl font-display tracking-tight text-gray-900 dark:text-white"
            >
              {{ areThereMeetupsToday ? 'Happening Today' : 'Next event' }}
            </h2>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8">
          <EventCardFeatured
            v-for="meetup in areThereMeetupsToday ? todaysMeetups : [nextMeetup]"
            :key="meetup.id"
            :event="meetup"
            :is-today="areThereMeetupsToday"
            :is-next="!areThereMeetupsToday"
            :has-rsvp="userRsvpEventIds?.includes(meetup.id) ?? false"
          />
        </div>
      </div>

      <!-- Upcoming Queue -->
      <div v-if="remainingUpcomingData.length > 0" class="space-y-8">
        <div class="flex items-center gap-4">
          <h2 class="text-lg font-semibold text-verse-500 dark:text-verse-400">Upcoming</h2>
          <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EventCardSmall v-for="event in remainingUpcomingData" :key="event.id" :event="event" />
        </div>
      </div>

      <!-- Historical Meetups -->
      <div v-if="pastMeetups.length > 0" class="space-y-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="space-y-2">
            <h2
              class="text-2xl md:text-3xl font-display tracking-tight text-gray-900 dark:text-white"
            >
              Previous meetups
            </h2>
          </div>

          <Link
            href="/meetups"
            class="hidden md:inline-flex items-center gap-2 text-verse-500 dark:text-verse-300 font-medium hover:text-verse-600 dark:hover:text-verse-200 transition-colors"
          >
            Explore all meetups
            <svg
              class="w-5 h-5 text-verse-500 dark:text-verse-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        <div class="divide-y divide-transparent">
          <EventCardModern v-for="event in pastMeetups" :key="event.id" :event="event" />
        </div>

        <div class="flex md:hidden pt-4">
          <Link
            href="/meetups"
            class="w-full text-center py-3 bg-verse-50 dark:bg-verse-900 text-verse-600 dark:text-verse-200 rounded-md font-medium"
          >
            Explore all meetups
          </Link>
        </div>
      </div>
    </div>
  </section>
</template>
