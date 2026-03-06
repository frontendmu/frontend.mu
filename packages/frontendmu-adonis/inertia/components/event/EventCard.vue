<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import SpeakerAvatar from '~/components/shared/SpeakerAvatar.vue'
import type { EventSummaryDto } from '~/types'
import { isDateInFuture } from '~/utils/date'

interface Props {
  event: EventSummaryDto
  isNextMeetup?: boolean
  isMeetupToday?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isNextMeetup: false,
  isMeetupToday: false,
})

const formattedDate = computed(() => {
  if (!props.event.date) return { day: '', month: '', year: '' }
  const date = new Date(props.event.date)
  return {
    day: date.getDate(),
    month: date.toLocaleString('en-US', { month: 'short' }),
    year: date.getFullYear(),
  }
})

const isUpcoming = computed(() => {
  return props.event.date ? isDateInFuture(new Date(props.event.date)) : false
})

const speakers = computed(() => {
  return props.event.sessions
    ?.flatMap((session) => session.speakers)
    .filter(Boolean) || []
})
</script>

<template>
  <div
    class="group relative bg-white dark:bg-verse-900/40 border border-verse-100 dark:border-verse-800 rounded-xl squircle p-4 transition-all duration-200 hover:border-verse-500/50 hover:bg-verse-50/30 dark:hover:bg-verse-800/40 shadow-sm dark:shadow-none"
  >
    <div class="flex items-center gap-4">
      <!-- Minimal Date -->
      <div class="flex flex-col items-center justify-center w-14 shrink-0 text-gray-400 dark:text-gray-400 group-hover:text-verse-500 transition-colors">
        <span class="text-2xl font-black leading-none tracking-tighter">{{ formattedDate.day }}</span>
        <span class="text-xs font-bold uppercase tracking-widest">{{ formattedDate.month }}</span>
      </div>

      <div class="flex-1 min-w-0 space-y-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {{ event.title }}
            </h3>
            <div v-if="isMeetupToday || isNextMeetup" class="shrink-0 flex gap-1">
              <span v-if="isMeetupToday" class="text-[10px] font-black uppercase tracking-widest bg-red-500 text-white px-2 py-0.5 rounded">
                Today
              </span>
              <span v-else-if="isNextMeetup" class="text-[10px] font-black uppercase tracking-widest bg-green-500 text-white px-2 py-0.5 rounded">
                Next
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-gray-500 dark:text-gray-400">
            <div v-if="event.venue" class="flex items-center gap-1">
              <span class="opacity-50 text-verse-500 dark:text-verse-300">@</span>
              <span class="truncate max-w-[180px]">{{ event.venue }}</span>
            </div>
            
            <div v-if="event.attendeeCount" class="flex items-center gap-1">
              <span class="opacity-50 text-verse-500 dark:text-verse-300">#</span>
              {{ event.attendeeCount }} attendees
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
                :github-username="speaker.githubUsername"
                :avatar-url="speaker.avatarUrl"
                class="border border-white dark:border-verse-950 shadow-sm transition-transform hover:scale-110 hover:z-30"
              />
            </template>
            <div v-if="speakers.length > 4" class="w-8 h-8 rounded-lg bg-verse-50 dark:bg-verse-900 border border-white dark:border-verse-950 flex items-center justify-center text-[10px] font-black text-verse-600">
              +{{ speakers.length - 4 }}
            </div>
          </div>
          <span class="text-xs font-bold text-gray-500 dark:text-gray-400">
            {{ speakers[0].name }}<template v-if="speakers.length > 1"> & {{ speakers.length - 1 }} others</template>
          </span>
        </div>
      </div>
    </div>
    
    <Link :href="`/meetup/${event.id}`" class="absolute inset-0 z-20" aria-label="View event details" />
  </div>
</template>
