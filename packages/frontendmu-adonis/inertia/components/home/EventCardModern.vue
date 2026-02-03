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
  const date = new Date(props.event.Date)
  const year = date.getFullYear()
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })
  return `${year} ${day} ${month}`
})

const isUpcoming = computed(() => {
  return props.event.Date ? isDateInFuture(new Date(props.event.Date)) : false
})
</script>

<template>
  <div class="py-2 group">
    <div
      class="relative rounded-xl flex flex-col md:flex-row p-4 md:p-0 gap-2 group bg-white dark:bg-verse-900/10 dark:border-verse-100/10 group-hover:shadow-lg group-focus-within:shadow-lg transition-all duration-300 border-2 border-verse-100 group-hover:border-verse-400 group-focus-within:border-verse-400 group-hover:scale-105 group-focus-within:scale-105"
    >
      <!-- Date -->
      <div v-if="event.Date">
        <span
          :title="isUpcoming ? 'Upcoming' : 'Past'"
          class="inline-flex rounded-lg p-[0.35rem] md:p-3 font-mono text-sm font-medium items-center"
          :class="[
            isUpcoming
              ? 'bg-green-50 text-green-600 font-bold dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-50 dark:bg-transparent text-verse-500 dark:text-verse-400 dark:font-bold',
          ]"
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

      <!-- Title -->
      <h3
        class="leading-2 text-xl font-semibold flex-1 py-2 text-verse-500 dark:text-verse-400 group-hover:text-verse-500 group-focus-within:text-verse-500 dark:group-hover:text-verse-100 dark:group-focus-within:text-verse-100"
      >
        <Link :href="`/meetup/${event.id}`" class="w-[300px] md:w-96 focus:outline-none">
          <span class="absolute inset-0" aria-hidden="true" />
          {{ event?.title }}
        </Link>
      </h3>

      <div class="flex gap-4 pr-4 border-gray-100">
        <div
          v-if="event.Venue"
          class="flex gap-1 md:gap-0 items-center justify-start text-base font-medium text-gray-500"
        >
          <svg
            class="mr-1.5 h-[15px] w-[15px] flex-shrink-0 truncate"
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

        <div
          class="flex gap-1 md:gap-0 items-center justify-start text-base font-medium text-gray-500"
        >
          <div v-if="event.Attendees" class="flex items-center" title="Attendees">
            <svg
              class="mr-1.5 h-[15px] w-[15px] flex-shrink-0 truncate"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              fill="currentColor"
            >
              <path
                d="M31 30h-2v-5a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v5h-2v-5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5zM24 12a3 3 0 1 1-3 3a3 3 0 0 1 3-3m0-2a5 5 0 1 0 5 5a5 5 0 0 0-5-5M15 22h-2v-5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v5H1v-5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5zM8 4a3 3 0 1 1-3 3a3 3 0 0 1 3-3m0-2a5 5 0 1 0 5 5a5 5 0 0 0-5-5"
              />
            </svg>
            <div class="line-clamp-1 md:line-clamp-0">
              {{ event?.Attendees }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
