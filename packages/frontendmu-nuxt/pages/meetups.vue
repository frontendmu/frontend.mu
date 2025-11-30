<script setup lang="ts">
import { isDateToday } from '../utils/helpers'
// group response by year and sort by reverse date

const { allMeetups, meetupsGroupedByYear, nextMeetup, todaysMeetups } = useMeetups({})

const nextMeetupId = nextMeetup.value?.id
</script>

<template>
  <div>
    <MiscContentBlock>
      <div class="past-events-container pb-4">
        <div class="flex flex-col gap-2">
          <BaseHeading :level="1">
            All meetups
          </BaseHeading>
          <p class="text-verse-700 dark:text-verse-300 py-4">
            Over the years, we've organized a lot of meetups. Here's a list of all
            of them.
          </p>
        </div>

        <template v-for="year in Object.keys(meetupsGroupedByYear).reverse()" :key="year">
          <div class="grid pb-16 sm:pb-40 last:pb-0 relative group is-page">
            <div class="text-lg font-bold text-verse-900 uppercase md:hidden">
              {{ year }}
            </div>
            <div
              class="absolute origin-bottom-lef left-[-150px] top-[50px] opacity-10 -rotate-90 text-[100px] font-bold text-verse-900 dark:text-verse-100 group-hover-[.is-page]:left-[-170px] transition-all duration-300 hidden md:block">
              {{ year }}
            </div>
            <div class="grid grid-cols-2 gap-8 relative z-10">
              <CardsEventCard v-for="event in meetupsGroupedByYear[year]" :key="event.id" :event="event"
                :is-next-meetup="event.id === nextMeetupId"
                :is-meetup-today="todaysMeetups.some(meetup => meetup.id === event.id)" class="card-entrance" />
            </div>
          </div>
        </template>
      </div>
    </MiscContentBlock>
  </div>
</template>

<style scoped lang="postcss">
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
