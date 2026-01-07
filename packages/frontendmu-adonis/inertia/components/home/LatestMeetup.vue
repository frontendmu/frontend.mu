<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import type { Meetup } from '~/types'
import { useMeetups } from '~/composables/useMeetups'
import BaseHeading from '~/components/base/BaseHeading.vue'
import EventCardFeatured from '~/components/home/EventCardFeatured.vue'
import EventCardSmall from '~/components/home/EventCardSmall.vue'
import EventCardModern from '~/components/home/EventCardModern.vue'

interface Props {
  events: Meetup[]
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
  <div class="latest-events-container relative z-20 sm:py-6 md:pt-8 md:px-8 px-0">
    <div
      class="latest-events-wrapper mx-auto flex flex-col gap-16 px-4 pt-8 md:max-w-3xl md:px-0 lg:max-w-5xl"
    >
      <!-- Today's Meetups -->
      <div v-if="areThereMeetupsToday">
        <div class="py-8">
          <BaseHeading weight="light"> Today's Meetups </BaseHeading>
        </div>
        <div class="sm:grid sm:grid-cols-1 gap-8 px-4 md:px-0">
          <EventCardFeatured
            v-for="meetup in todaysMeetups"
            :key="meetup.id"
            :event="meetup"
            is-today
          />
        </div>
      </div>

      <!-- Next Meetup (only if no meetup today) -->
      <div v-if="!areThereMeetupsToday && nextMeetup">
        <div class="py-8">
          <BaseHeading weight="light"> Next Meetup </BaseHeading>
        </div>
        <div class="sm:grid sm:grid-cols-1 gap-8 px-4 md:px-0">
          <EventCardFeatured :event="nextMeetup" is-next />
        </div>
      </div>

      <!-- Upcoming Meetups -->
      <div v-if="remainingUpcomingData.length > 0">
        <div class="py-8">
          <BaseHeading weight="light"> Upcoming Meetups </BaseHeading>
        </div>
        <div class="sm:grid sm:grid-cols-2 gap-8 px-4 md:px-0">
          <EventCardSmall v-for="event in remainingUpcomingData" :key="event.id" :event="event" />
        </div>
      </div>

      <!-- Recent Meetups -->
      <div v-if="pastMeetups.length > 0">
        <div class="py-8">
          <BaseHeading weight="light"> Recent Meetups </BaseHeading>
        </div>
        <div class="sm:grid sm:grid-cols-1 gap-0 px-4 md:px-0">
          <EventCardModern v-for="event in pastMeetups" :key="event.id" :event="event" />
        </div>
      </div>

      <!-- View All Button -->
      <div class="flex h-32 items-center justify-center">
        <Link
          href="/meetups"
          class="text-md w-48 rounded-md bg-verse-600 px-4 py-8 text-center font-medium text-white md:w-64 md:px-8 md:text-xl hover:bg-verse-700 transition-colors"
        >
          View all meetups
        </Link>
      </div>
    </div>
  </div>
</template>
