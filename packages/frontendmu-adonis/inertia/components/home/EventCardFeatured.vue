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
    class="relative overflow-hidden rounded-2xl group transition-all duration-300 border"
    :class="[
      isToday
        ? 'border-red-500/40 shadow-lg shadow-red-500/5'
        : 'border-verse-500/30 shadow-lg shadow-verse-500/5',
    ]"
  >
    <div class="relative z-10 bg-white dark:bg-verse-950 rounded-[0.9rem] p-5 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-10 items-center justify-between">

      <div class="flex-1 space-y-4 md:space-y-6 text-center lg:text-left">
        <!-- Status Badge -->
        <div v-if="isToday" class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border-2 bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
          </span>
          Happening Today
        </div>

        <!-- Title -->
        <h3 class="text-2xl md:text-4xl lg:text-5xl font-display tracking-tight text-gray-900 dark:text-white leading-[1.1]">
          {{ event?.title }}
        </h3>

        <!-- Meta info -->
        <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-gray-500 dark:text-gray-400 font-bold text-sm md:text-lg">
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
        <div class="flex flex-col sm:flex-row items-center gap-4 md:gap-8 pt-2 md:pt-4">
          <Link
            :href="`/meetup/${event.id}`"
            class="relative z-20 w-full sm:w-auto px-7 py-3 bg-verse-600 text-white rounded-lg font-bold text-sm hover:bg-verse-700 active:scale-[0.98] transition-all"
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
              <p class="text-xs font-semibold text-gray-400 dark:text-gray-500">Featuring</p>
              <p class="text-sm font-bold dark:text-gray-300">{{ speakers[0]?.name }} & others</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Date Large Display (hidden on mobile) -->
      <div v-if="event.date" class="hidden lg:flex flex-col items-center justify-center w-32 h-32 rounded-xl bg-verse-50 dark:bg-verse-900/30 border border-verse-100 dark:border-verse-800">
        <span class="text-4xl font-display text-verse-500 leading-none">{{ new Date(event.date).getDate() }}</span>
        <span class="text-sm font-medium uppercase tracking-wider text-gray-400 mt-1">{{ new Date(event.date).toLocaleString('en-US', { month: 'short' }) }}</span>
      </div>

    </div>
    <Link :href="`/meetup/${event.id}`" class="absolute inset-0 z-10" aria-label="View event details" />
  </div>
</template>
