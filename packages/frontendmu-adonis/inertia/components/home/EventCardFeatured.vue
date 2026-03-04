<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import SpeakerAvatar from '~/components/shared/SpeakerAvatar.vue'
import type { EventSummaryDto } from '~/types'

interface Props {
  event: EventSummaryDto
  isNext?: boolean
  isToday?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isNext: false,
  isToday: false,
})

const formattedDate = computed(() => {
  if (!props.event.date) return ''
  const date = new Date(props.event.date)
  return {
    full: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    short: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
})

const speakers = computed(() => {
  return (
    props.event.sessions?.flatMap((session) => session.speakers).filter(Boolean) || []
  )
})
</script>

<template>
  <div
    class="relative overflow-hidden rounded-[2.5rem] squircle group transition-all duration-500 hover:scale-[1.01] border-2"
    :class="[
      isToday
        ? 'border-red-500/50 shadow-2xl shadow-red-500/10'
        : 'border-verse-500/50 shadow-2xl shadow-verse-500/10',
    ]"
  >
    <div class="relative z-10 bg-white dark:bg-verse-950 rounded-[2.3rem] squircle p-6 md:p-10 flex flex-col lg:flex-row gap-10 items-center justify-between">

      <div class="flex-1 space-y-6 text-center lg:text-left">
        <!-- Status Badge -->
        <div v-if="isToday" class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] border-2 bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
          </span>
          Happening Today
        </div>

        <!-- Title -->
        <h3 class="text-5xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.1]">
          {{ event?.title }}
        </h3>

        <!-- Meta info -->
        <div class="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-gray-500 dark:text-gray-400 font-bold text-lg">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-verse-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ formattedDate.full }}
          </div>
          <div v-if="event.venue" class="flex items-center gap-2">
            <svg class="w-5 h-5 text-verse-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ event.venue }}
          </div>
        </div>

        <!-- Speakers & CTA -->
        <div class="flex flex-col sm:flex-row items-center gap-8 pt-4">
          <Link
            :href="`/meetup/${event.id}`"
            class="relative z-20 w-full sm:w-auto px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            {{ isToday ? 'Join Now' : 'Save My Spot' }}
          </Link>

          <div v-if="speakers.length > 0" class="relative z-20 flex items-center gap-3">
            <div class="flex -space-x-3">
              <template v-for="speaker in speakers.slice(0, 3)" :key="speaker?.id">
                <SpeakerAvatar
                  size="md"
                  :name="speaker.name"
                  :github-username="speaker.githubUsername"
                  :avatar-url="speaker.avatarUrl"
                  class="border-4 border-white dark:border-verse-950 shadow-lg ring-2 ring-verse-500/20"
                />
              </template>
              <div v-if="speakers.length > 3" class="w-12 h-12 rounded-full bg-verse-100 dark:bg-verse-900 border-4 border-white dark:border-verse-950 flex items-center justify-center text-xs font-black text-verse-600 dark:text-verse-400 ring-2 ring-verse-500/20">
                +{{ speakers.length - 3 }}
              </div>
            </div>
            <div class="text-left">
              <p class="text-xs font-black uppercase tracking-tighter text-gray-400 dark:text-gray-500">Featuring</p>
              <p class="text-sm font-bold dark:text-gray-300">{{ speakers[0]?.name }} & others</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Date Large Display (hidden on mobile) -->
      <div v-if="event.date" class="hidden lg:flex flex-col items-center justify-center w-40 h-40 rounded-[2rem] bg-verse-50 dark:bg-verse-900/30 border-2 border-verse-100 dark:border-verse-800 rotate-3 group-hover:rotate-0 transition-transform duration-500">
        <span class="text-5xl font-black text-verse-500 leading-none">{{ new Date(event.date).getDate() }}</span>
        <span class="text-lg font-black uppercase tracking-[0.2em] text-gray-400">{{ new Date(event.date).toLocaleString('en-US', { month: 'short' }) }}</span>
      </div>

    </div>
    <Link :href="`/meetup/${event.id}`" class="absolute inset-0 z-10" aria-label="View event details" />
  </div>
</template>
