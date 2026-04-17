<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import SpeakerAvatar from '~/components/shared/SpeakerAvatar.vue'

interface Props {
  event: Data.Event
  isNext?: boolean
  isToday?: boolean
  hasRsvp?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isNext: false,
  isToday: false,
  hasRsvp: false,
})

const formattedDate = computed(() => {
  if (!props.event.date) return ''
  const date = new Date(props.event.date)
  return {
    full: date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    short: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }
})

const speakers = computed(() => {
  return props.event.sessions?.flatMap((session) => session.speakers).filter(Boolean) || []
})
</script>

<template>
  <div
    class="relative overflow-hidden rounded-lg group border"
    :class="[isToday ? 'border-red-500/40' : 'border-gray-200 dark:border-verse-900']"
  >
    <div
      class="bg-white dark:bg-verse-950 rounded-lg p-5 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-10 items-center justify-between"
    >
      <div class="flex-1 space-y-4 md:space-y-6 text-center lg:text-left">
        <!-- Status Badge -->
        <div
          v-if="isToday"
          class="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"
            ></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
          </span>
          Happening Today
        </div>

        <!-- Title -->
        <h3
          class="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white leading-tight"
        >
          {{ event?.title }}
        </h3>

        <!-- Meta info -->
        <div
          class="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-gray-500 dark:text-gray-400 font-medium text-sm"
        >
          <div class="flex items-center gap-2">
            <svg
              class="w-5 h-5 text-verse-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {{ formattedDate.full }}
          </div>
          <div v-if="event.venue" class="flex items-center gap-2">
            <svg
              class="w-5 h-5 text-verse-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {{ event.venue }}
          </div>
        </div>

        <!-- Speakers & CTA -->
        <div class="flex flex-col sm:flex-row items-center gap-4 md:gap-8 pt-2 md:pt-4">
          <div v-if="speakers.length > 0" class="relative z-20 flex items-center gap-3">
            <div class="flex -space-x-3">
              <template v-for="speaker in speakers.slice(0, 3)" :key="speaker?.id">
                <SpeakerAvatar
                  size="md"
                  :name="speaker.name"
                  :github-username="speaker.githubUsername"
                  :avatar-url="speaker.avatarUrl"
                  class="border-2 border-white dark:border-verse-950"
                />
              </template>
              <div
                v-if="speakers.length > 3"
                class="w-12 h-12 rounded-full bg-verse-100 dark:bg-verse-900 border-2 border-white dark:border-verse-950 flex items-center justify-center text-xs font-bold text-verse-600 dark:text-verse-400"
              >
                +{{ speakers.length - 3 }}
              </div>
            </div>
            <div class="text-left">
              <p class="text-xs font-semibold text-gray-400 dark:text-gray-500">Featuring</p>
              <p class="text-sm font-bold dark:text-gray-300">
                {{ speakers[0]?.name }}<template v-if="speakers.length > 1"> & others</template>
              </p>
            </div>
          </div>

          <Link
            v-if="hasRsvp"
            :href="`/meetup/${event.slug || event.id}`"
            class="relative z-20 w-full sm:w-auto px-5 py-2.5 border border-verse-300 dark:border-verse-700 text-verse-600 dark:text-verse-400 rounded-md font-medium text-sm hover:bg-verse-50 dark:hover:bg-verse-900 transition-colors"
          >
            You're going
          </Link>
          <Link
            v-else
            :href="`/meetup/${event.slug || event.id}`"
            class="relative z-20 w-full sm:w-auto px-5 py-2.5 bg-verse-600 text-white rounded-md font-medium text-sm hover:bg-verse-700 transition-colors"
          >
            {{ isToday ? 'Join Now' : 'Save My Spot' }}
          </Link>
        </div>
      </div>

      <!-- Date Large Display (hidden on mobile) -->
      <div
        v-if="event.date"
        class="hidden lg:flex flex-col items-center justify-center w-28 h-28 rounded-lg bg-gray-50 dark:bg-verse-900 border border-gray-200 dark:border-verse-900"
      >
        <span class="text-3xl font-bold text-verse-500 leading-none">{{ formattedDate.day }}</span>
        <span class="text-sm font-medium uppercase tracking-wider text-gray-400 mt-1">{{
          formattedDate.month
        }}</span>
      </div>
    </div>
    <Link
      :href="`/meetup/${event.slug || event.id}`"
      class="absolute inset-0 z-10"
      aria-label="View event details"
    />
  </div>
</template>
