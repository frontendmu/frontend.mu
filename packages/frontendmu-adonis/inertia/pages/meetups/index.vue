<script setup lang="ts">
import { computed } from 'vue'
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
import EventCard from '~/components/event/EventCard.vue'
import { isDateToday, isDateInFuture } from '~/utils/date'
import type { Meetup } from '~/types'

interface Props {
  meetups: Meetup[]
}

const props = defineProps<Props>()

// Group meetups by year
const meetupsGroupedByYear = computed(() => {
  return props.meetups.reduce((acc: Record<number, Meetup[]>, event) => {
    const year = new Date(event.Date).getFullYear()
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
  props.meetups.filter((meetup) => isDateInFuture(new Date(meetup.Date)))
)

// Get next meetup
const nextMeetup = computed(() => {
  const sorted = [...upcomingMeetups.value].sort(
    (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
  )
  return sorted[0]
})

// Get today's meetups
const todaysMeetups = computed(() =>
  props.meetups.filter((meetup) => isDateToday(new Date(meetup.Date)))
)

const nextMeetupId = computed(() => nextMeetup.value?.id)
</script>

<template>
  <Head title="All Meetups" />
  <DefaultLayout>
    <ContentBlock>
      <div class="past-events-container pb-4 py-8">
        <div class="flex flex-col gap-2 mb-8">
          <BaseHeading :level="1"> All meetups </BaseHeading>
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
              class="absolute origin-bottom-left left-[-150px] top-[50px] opacity-10 -rotate-90 text-[100px] font-bold text-verse-900 dark:text-verse-100 group-hover-[.is-page]:left-[-170px] transition-all duration-300 hidden md:block"
            >
              {{ year }}
            </div>
            <div class="grid grid-cols-2 gap-8 relative z-10">
              <EventCard
                v-for="event in meetupsGroupedByYear[year]"
                :key="event.id"
                :event="event"
                :is-next-meetup="event.id === nextMeetupId"
                :is-meetup-today="
                  todaysMeetups.some((meetup) => meetup.id === event.id)
                "
                class="card-entrance"
              />
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <div
          v-if="!meetups.length"
          class="text-center py-16 text-verse-600 dark:text-verse-400"
        >
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
