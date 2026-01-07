<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import type { Meetup } from '~/types'
import { isDateInFuture } from '~/utils/date'

interface Props {
  event: Meetup
}

const props = defineProps<Props>()

const formattedDate = computed(() => {
  if (!props.event.Date) return ''
  return new Date(props.event.Date).toDateString()
})

const isUpcoming = computed(() => {
  return props.event.Date ? isDateInFuture(new Date(props.event.Date)) : false
})
</script>

<template>
  <div
    class="mt-4 md:mt-0 relative rounded-xl flex flex-col gap-2 group bg-white dark:bg-verse-700/40 p-6 shadow-md transition-all hover:shadow-lg"
  >
    <div v-if="event.Date">
      <span
        class="inline-flex items-center rounded-lg p-3 ring-4 ring-white dark:ring-white/5"
        :class="
          isUpcoming
            ? 'bg-verse-50 text-verse-600 dark:text-verse-400 font-bold dark:bg-verse-900/10'
            : 'bg-gray-50 text-gray-700 dark:bg-verse-800 dark:text-verse-400'
        "
      >
        <svg
          class="mr-2 h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          fill="currentColor"
        >
          <path
            d="M26 4h-4V2h-2v2h-8V2h-2v2H6c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 22H6V12h20zm0-16H6V6h4v2h2V6h8v2h2V6h4z"
          />
        </svg>
        <span>{{ formattedDate }}</span>
      </span>
    </div>

    <div class="flex flex-col gap-4 md:gap-0">
      <h3 class="leading-2 text-xl md:text-2xl font-medium py-2 text-verse-500 dark:text-white">
        <Link :href="`/meetup/${event.id}`" class="w-[300px] md:w-96 focus:outline-none">
          <span class="absolute inset-0" aria-hidden="true" />
          {{ event?.title }}
        </Link>
      </h3>

      <div class="flex gap-4 border-gray-100">
        <div
          class="flex gap-1 md:gap-0 items-center justify-start text-base font-medium text-gray-500"
        >
          <svg
            class="mr-1.5 h-4 w-4 flex-shrink-0 truncate"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="currentColor"
          >
            <path
              d="M31 30h-2v-5a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v5h-2v-5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5zM24 12a3 3 0 1 1-3 3a3 3 0 0 1 3-3m0-2a5 5 0 1 0 5 5a5 5 0 0 0-5-5M15 22h-2v-5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v5H1v-5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5zM8 4a3 3 0 1 1-3 3a3 3 0 0 1 3-3m0-2a5 5 0 1 0 5 5a5 5 0 0 0-5-5"
            />
          </svg>
          <div v-if="event?.Attendees !== 0" class="line-clamp-1 md:line-clamp-0">
            Attendees {{ event?.Attendees }}
          </div>
          <div v-else>Seats: {{ event?.Attendees || 'TBA' }}</div>
        </div>

        <div
          v-if="event.Venue"
          class="flex gap-1 md:gap-0 items-center justify-start text-base font-medium text-gray-500"
        >
          <svg
            class="ml-[-1px] mr-1.5 h-4 w-4 flex-shrink-0 truncate"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="currentColor"
          >
            <path
              d="M16 2A11.013 11.013 0 0 0 5 13a10.889 10.889 0 0 0 2.216 6.6s.3.395.349.452L16 30l8.439-9.953c.044-.053.345-.447.345-.447l.001-.003A10.885 10.885 0 0 0 27 13A11.013 11.013 0 0 0 16 2m0 15a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4"
            />
          </svg>
          <div class="line-clamp-1 md:line-clamp-0">
            {{ event.Venue }}
          </div>
        </div>
      </div>
    </div>

    <span
      class="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-verse-500"
      aria-hidden="true"
    >
      <svg
        class="h-6 w-6"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
      >
        <path
          d="m10 6l1.41 1.41L7.83 11H28v2H7.83l3.58 3.59L10 18l-6-6z"
          transform="rotate(180 16 16)"
        />
      </svg>
    </span>
  </div>
</template>
