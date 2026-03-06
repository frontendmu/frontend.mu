<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import type { EventSummaryDto } from '~/types'
import { useMeetups } from '~/composables/useMeetups'
import EventCardFeatured from '~/components/home/EventCardFeatured.vue'
import EventCardSmall from '~/components/home/EventCardSmall.vue'
import EventCardModern from '~/components/home/EventCardModern.vue'

interface Props {
  events: EventSummaryDto[]
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
            <h2 class="text-3xl md:text-5xl font-black tracking-tight dark:text-white">
              {{ areThereMeetupsToday ? "Happening Today" : "Next event" }}
            </h2>
            <p class="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium max-w-xl">
              Join our next session to learn from local experts and connect with the community.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8">
          <EventCardFeatured
            v-for="meetup in (areThereMeetupsToday ? todaysMeetups : [nextMeetup])"
            :key="meetup.id"
            :event="meetup"
            :is-today="areThereMeetupsToday"
            :is-next="!areThereMeetupsToday"
          />
        </div>
      </div>

      <!-- Upcoming Queue -->
      <div v-if="remainingUpcomingData.length > 0" class="space-y-8">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-black uppercase tracking-[0.2em] text-verse-500 dark:text-verse-400">Upcoming</h2>
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
            <h2 class="text-3xl font-black tracking-tight dark:text-white">Recent Memories</h2>
            <p class="text-gray-500 dark:text-gray-400 font-medium">Catch up on what you missed in our previous sessions.</p>
          </div>
          
          <Link
            href="/meetups"
            class="hidden md:inline-flex items-center gap-2 text-verse-500 dark:text-verse-400 font-bold hover:gap-3 transition-all"
          >
            Explore all meetups
            <svg class="w-5 h-5 text-verse-500 dark:text-verse-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div class="divide-y divide-transparent">
          <EventCardModern v-for="event in pastMeetups" :key="event.id" :event="event" />
        </div>
        
        <div class="flex md:hidden pt-4">
          <Link
            href="/meetups"
            class="w-full text-center py-4 bg-verse-50 dark:bg-verse-900/20 text-verse-600 dark:text-verse-400 rounded-2xl font-bold"
          >
            Explore all meetups
          </Link>
        </div>
      </div>

    </div>
  </section>
</template>
