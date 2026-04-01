<script setup lang="ts">
import type { PropType } from 'vue'
import type { DirectusEvent } from '@/utils/types'

const props = defineProps({
  event: {
    type: Object as PropType<DirectusEvent>,
    default: () => ({}),
  },
})

const tiltOptions = {
  reverse: false,
  speed: 1000,
}
</script>

<template>
  <MiscVanillaTilt>
    <div
      class="mt-4 md:mt-0 relative rounded-xl group flex flex-col items-start md:items-center gap-6 md:gap-16 group bg-white dark:bg-verse-950 dark-glow p-8 md:p-16 shadow-xl"
    >
      <MiscLogoFec
        class="w-32 z-0 dark:text-white transition-all hidden md:block select-none top-0 saturate-100 opacity-100 overflow-hidden"
      />
      <!-- <div class="w-64 top-0 h-64 z-10 bg-gradient-to-t from-white to-transparent absolute">&nbsp;</div> -->

      <h3 class="leading-2 text-xl md:text-5xl font-medium md:h-12 z-20 text-verse-600 dark:text-verse-300">
        <NuxtLink :href="`/meetup/${event.id}`" class="w-[300px] md:w-96 focus:outline-none">
          <span class="absolute inset-0" aria-hidden="true" />
          {{ event?.title }}
        </NuxtLink>
      </h3>

      <div class="flex flex-col md:flex-row w-full justify-between gap-4 border-gray-100">
        <span
          v-if="event.Date" class="inline-flex rounded-lg p-3 ring-4 ring-white dark:ring-white/10 text-green-800 bg-green-50 dark:bg-verse-900 font-bold"
        >
          <Icon name="carbon:calendar" class="mr-2 h-6 w-6" />
          <span>{{ new Date(event.Date).toDateString() }}</span>
        </span>

        <div
          class="flex gap-1 md:gap-0 items-center justify-start text-xl font-medium text-gray-500 dark:text-gray-100"
        >
          <Icon
            name="solar:users-group-rounded-bold"
            class="mr-1.5 h-5 w-5 flex-shrink-0 truncate text-gray-500 dark:text-gray-100" aria-hidden="true"
          />
          <div v-if="event && event?.Attendees !== 0" class="line-clamp-1 md:line-clamp-0">
            Attendees {{ event?.Attendees }}
          </div>
          <div v-else>
            Seats: {{ event?.seats_available }}
          </div>
        </div>

        <div
          v-if="event.Venue"
          class="flex gap-1 md:gap-0 items-center justify-start text-xl font-medium text-gray-500 dark:text-gray-100"
        >
          <Icon
            name="carbon:location"
            class="ml-[-1px] mr-1.5 h-5 w-5 flex-shrink-0 truncate text-gray-500 dark:text-gray-100"
            aria-hidden="true"
          />
          <div>{{ event.Venue }}</div>
        </div>

        <div v-else>
          No venue added.
        </div>
      </div>

      <span
        class="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-green-500"
        aria-hidden="true"
      >
        <Icon name="carbon:arrow-up-right" class="h-6 w-6" />
      </span>
    </div>
  </MiscVanillaTilt>
</template>
