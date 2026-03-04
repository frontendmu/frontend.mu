<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import SpeakerAvatar from '~/components/shared/SpeakerAvatar.vue'
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

const speakers = computed(() => {
  return props.event.sessions
    ?.flatMap((session) => session.Session_id?.speakers)
    .filter(Boolean) || []
})
</script>

<template>
  <div class="group relative py-4 transition-all duration-300 squircle">
    <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 group-hover:translate-x-1 transition-transform duration-300">
      <!-- Date Column -->
      <div class="flex md:flex-col items-baseline md:items-center justify-start md:min-w-[60px] gap-2 md:gap-0 shrink-0 text-gray-400 dark:text-gray-400 group-hover:text-verse-500 transition-colors">
        <span class="text-3xl font-black leading-none tracking-tighter">
          {{ formattedDate.day }}
        </span>
        <span class="text-sm font-bold uppercase tracking-widest">
          {{ formattedDate.month }} '{{ formattedDate.year.toString().slice(-2) }}
        </span>
      </div>

      <!-- Content Column -->
      <div class="flex-1 min-w-0 space-y-2">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {{ event.title }}
            </h3>
            <span v-if="isUpcoming" class="shrink-0 px-2 py-0.5 text-xs font-black uppercase tracking-widest bg-green-500 text-white rounded">
              Upcoming
            </span>
          </div>
          
          <div class="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500 dark:text-gray-400">
            <div v-if="event.Venue" class="flex items-center gap-1.5">
              <span class="opacity-50 text-verse-500 dark:text-verse-400">@</span>
              <span class="truncate max-w-[250px]">{{ event.Venue }}</span>
            </div>
            
            <div v-if="event.Attendees" class="flex items-center gap-1.5">
              <span class="opacity-50 text-verse-500 dark:text-verse-400">#</span>
              {{ event.Attendees }} attended
            </div>
          </div>
        </div>

        <!-- Speakers Prominent Row -->
        <div v-if="speakers.length > 0" class="flex items-center gap-3 relative z-20">
          <div class="flex -space-x-2">
            <template v-for="speaker in speakers.slice(0, 4)" :key="speaker?.id">
              <SpeakerAvatar
                size="sm"
                :name="speaker.name"
                :github-username="speaker.github_account"
                class="w-7 h-7 border border-white dark:border-verse-950 shadow-sm transition-transform hover:scale-110 hover:z-30"
              />
            </template>
            <div v-if="speakers.length > 4" class="w-7 h-7 rounded-full bg-verse-50 dark:bg-verse-900 border border-white dark:border-verse-950 flex items-center justify-center text-[9px] font-black text-verse-600">
              +{{ speakers.length - 4 }}
            </div>
          </div>
          <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 italic">
            Featuring {{ speakers[0].name }}<template v-if="speakers.length > 1"> & {{ speakers.length - 1 }} others</template>
          </span>
        </div>
      </div>

      <!-- Action Column -->
      <div class="hidden md:block">
        <div class="w-8 h-8 rounded-lg border border-verse-100 dark:border-verse-800 flex items-center justify-center group-hover:bg-verse-500 group-hover:border-verse-500 transition-all duration-300">
          <svg class="w-4 h-4 text-verse-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="absolute bottom-0 left-0 w-full h-px bg-gray-100 dark:bg-verse-800 group-hover:bg-verse-500/20 transition-all duration-500"></div>
    
    <Link :href="`/meetup/${event.id}`" class="absolute inset-0 z-20" aria-label="View event details" />
  </div>
</template>
