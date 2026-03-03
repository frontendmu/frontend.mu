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
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return { day, month, year }
})

const isUpcoming = computed(() => {
  return props.event.Date ? isDateInFuture(new Date(props.event.Date)) : false
})
</script>

<template>
  <div class="group relative py-6 transition-all duration-300">
    <Link :href="`/meetup/${event.id}`" class="absolute inset-0 z-10" />
    
    <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 group-hover:translate-x-2 transition-transform duration-300">
      <!-- Date Column -->
      <div class="flex md:flex-col items-baseline md:items-center justify-start md:min-w-[80px] gap-2 md:gap-0">
        <span class="text-3xl font-black text-verse-500 dark:text-verse-400 leading-none">
          {{ formattedDate.day }}
        </span>
        <span class="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {{ formattedDate.month }} {{ formattedDate.year }}
        </span>
      </div>

      <!-- Content Column -->
      <div class="flex-1 space-y-1">
        <div class="flex items-center gap-3">
          <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-verse-500 dark:group-hover:text-verse-400 transition-colors">
            {{ event.title }}
          </h3>
          <span v-if="isUpcoming" class="px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter bg-green-500 text-white rounded-full">
            Upcoming
          </span>
        </div>
        
        <div class="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          <div v-if="event.Venue" class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-verse-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ event.Venue }}
          </div>
          
          <div v-if="event.Attendees" class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-verse-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {{ event.Attendees }} Attended
          </div>
        </div>
      </div>

      <!-- Action Column -->
      <div class="hidden md:block">
        <div class="w-10 h-10 rounded-full border border-verse-200 dark:border-verse-800 flex items-center justify-center group-hover:bg-verse-500 group-hover:border-verse-500 transition-all duration-300">
          <svg class="w-5 h-5 text-verse-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent group-hover:via-verse-500/30 transition-all duration-500"></div>
  </div>
</template>
