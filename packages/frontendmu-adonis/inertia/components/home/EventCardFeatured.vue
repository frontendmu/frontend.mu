<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import type { Meetup } from '~/types'
import Logo from '~/components/layout/Logo.vue'

interface Props {
  event: Meetup
  isNext?: boolean
  isToday?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isNext: false,
  isToday: false,
})

const formattedDate = computed(() => {
  if (!props.event.Date) return ''
  return new Date(props.event.Date).toDateString()
})

const speakers = computed(() => {
  return (
    props.event.sessions?.flatMap((session) => session.Session_id?.speakers).filter(Boolean) || []
  )
})
</script>

<template>
  <div
    class="mt-4 md:mt-0 relative rounded-xl group flex flex-col items-start md:items-center gap-6 md:gap-16 bg-white dark:bg-verse-950 p-8 md:p-16 shadow-xl border-2"
    :class="[
      isToday
        ? 'border-red-500 dark:border-red-400'
        : isNext
          ? 'border-green-500 dark:border-green-400'
          : 'border-verse-100 dark:border-verse-800',
    ]"
  >
    <Logo
      class="w-32 z-0 dark:text-white transition-all hidden md:block select-none top-0 saturate-100 opacity-100 overflow-hidden text-verse-500"
    />

    <!-- Badge -->
    <div v-if="isToday || isNext" class="absolute top-4 right-4">
      <span
        v-if="isToday"
        class="flex items-center gap-1 text-sm font-mono text-red-800 dark:text-red-300 px-3 py-1 rounded-md font-bold bg-red-100 dark:bg-red-900/30"
      >
        <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        TODAY
      </span>
      <span
        v-else-if="isNext"
        class="bg-green-700 text-sm font-mono text-white px-3 py-1 rounded-md font-bold"
      >
        NEXT MEETUP
      </span>
    </div>

    <h3
      class="leading-2 text-xl md:text-5xl font-medium md:h-12 z-20 text-verse-600 dark:text-verse-300 text-center"
    >
      <Link :href="`/meetup/${event.id}`" class="w-[300px] md:w-full focus:outline-none">
        <span class="absolute inset-0" aria-hidden="true" />
        {{ event?.title }}
      </Link>
    </h3>

    <div class="flex flex-col md:flex-row w-full justify-between gap-4 border-gray-100">
      <span
        v-if="event.Date"
        class="inline-flex items-center rounded-lg p-3 ring-4 ring-white dark:ring-white/10 text-green-600 bg-green-50 dark:bg-verse-900 font-bold"
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

      <div
        class="flex gap-1 md:gap-0 items-center justify-start text-xl font-medium text-gray-500 dark:text-gray-100"
      >
        <svg
          class="mr-1.5 h-5 w-5 flex-shrink-0 truncate"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          fill="currentColor"
        >
          <path
            d="M31 30h-2v-5a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v5h-2v-5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5zM24 12a3 3 0 1 1-3 3a3 3 0 0 1 3-3m0-2a5 5 0 1 0 5 5a5 5 0 0 0-5-5M15 22h-2v-5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v5H1v-5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5zM8 4a3 3 0 1 1-3 3a3 3 0 0 1 3-3m0-2a5 5 0 1 0 5 5a5 5 0 0 0-5-5"
          />
        </svg>
        <div v-if="event && event?.Attendees !== 0" class="line-clamp-1 md:line-clamp-0">
          Attendees {{ event?.Attendees }}
        </div>
        <div v-else>Seats: {{ event?.Attendees || 'TBA' }}</div>
      </div>

      <div
        v-if="event.Venue"
        class="flex gap-1 md:gap-0 items-center justify-start text-xl font-medium text-gray-500 dark:text-gray-100"
      >
        <svg
          class="ml-[-1px] mr-1.5 h-5 w-5 flex-shrink-0 truncate"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          fill="currentColor"
        >
          <path
            d="M16 2A11.013 11.013 0 0 0 5 13a10.889 10.889 0 0 0 2.216 6.6s.3.395.349.452L16 30l8.439-9.953c.044-.053.345-.447.345-.447l.001-.003A10.885 10.885 0 0 0 27 13A11.013 11.013 0 0 0 16 2m0 15a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4"
          />
        </svg>
        <div>{{ event.Venue }}</div>
      </div>

      <div v-else class="text-gray-400">No venue added.</div>
    </div>

    <!-- Speakers -->
    <div v-if="speakers.length > 0" class="flex -space-x-2">
      <template v-for="speaker in speakers.slice(0, 5)" :key="speaker?.id">
        <img
          v-if="speaker?.github_account"
          :src="`https://avatars.githubusercontent.com/${speaker.github_account}`"
          :alt="speaker.name"
          class="w-10 h-10 rounded-full border-2 border-white dark:border-verse-800 object-cover"
        />
      </template>
      <span
        v-if="speakers.length > 5"
        class="w-10 h-10 rounded-full border-2 border-white dark:border-verse-800 bg-verse-200 dark:bg-verse-700 flex items-center justify-center text-xs font-medium"
      >
        +{{ speakers.length - 5 }}
      </span>
    </div>

    <span
      class="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-green-500"
      :class="{ hidden: isToday || isNext }"
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
