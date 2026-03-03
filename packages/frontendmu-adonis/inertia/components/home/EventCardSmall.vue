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
  return {
    day: date.getDate(),
    month: date.toLocaleString('en-US', { month: 'short' }),
    year: date.getFullYear()
  }
})

const isUpcoming = computed(() => {
  return props.event.Date ? isDateInFuture(new Date(props.event.Date)) : false
})
</script>

<template>
  <div
    class="group relative bg-white dark:bg-verse-900/20 border border-verse-100 dark:border-verse-800 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-verse-500/5 hover:-translate-y-1"
  >
    <Link :href="`/meetup/${event.id}`" class="absolute inset-0 z-10" />
    
    <div class="flex items-start gap-4">
      <!-- Date Badge -->
      <div class="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-verse-50 dark:bg-verse-900 text-verse-600 dark:text-verse-400 font-black shrink-0 border border-verse-100 dark:border-verse-800">
        <span class="text-xl leading-none">{{ formattedDate.day }}</span>
        <span class="text-[10px] uppercase tracking-wider">{{ formattedDate.month }}</span>
      </div>

      <div class="flex-1 space-y-3">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-verse-500 transition-colors line-clamp-2">
          {{ event.title }}
        </h3>

        <div class="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          <div v-if="event.Venue" class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-verse-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="truncate max-w-[120px]">{{ event.Venue }}</span>
          </div>
          
          <div v-if="event.Attendees" class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-verse-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {{ event.Attendees }}
          </div>
        </div>
      </div>
    </div>

    <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <svg class="w-5 h-5 text-verse-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </div>
  </div>
</template>
