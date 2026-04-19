<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import SpeakerAvatar from '~/components/shared/SpeakerAvatar.vue'
import { isDateInFuture } from '~/utils/date'

interface Props {
  event: Data.Event
  isNextMeetup?: boolean
  isMeetupToday?: boolean
  featured?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isNextMeetup: false,
  isMeetupToday: false,
  featured: false,
})

const formattedDate = computed(() => {
  if (!props.event.date) return { day: '', month: '', full: '' }
  const date = new Date(props.event.date)
  return {
    day: date.getDate(),
    month: date.toLocaleString('en-US', { month: 'short' }),
    full: date.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
  }
})

const isUpcoming = computed(() => {
  return props.event.date ? isDateInFuture(new Date(props.event.date)) : false
})

const status = computed<'live' | 'upcoming' | 'past'>(() => {
  if (props.isMeetupToday) return 'live'
  if (isUpcoming.value) return 'upcoming'
  return 'past'
})

const statusLabel = computed(() =>
  status.value === 'live' ? 'Live now' : status.value === 'upcoming' ? 'Upcoming' : 'Past'
)

const speakers = computed(() => {
  return props.event.sessions?.flatMap((session) => session.speakers).filter(Boolean) || []
})

// Deterministic tint pair seeded from the slug/id so cards feel varied but stable
const TINTS: Array<[string, string]> = [
  ['oklch(58% 0.14 230)', 'oklch(72% 0.10 200)'],
  ['oklch(48% 0.12 260)', 'oklch(38% 0.10 280)'],
  ['oklch(60% 0.13 30)', 'oklch(78% 0.10 55)'],
  ['oklch(55% 0.12 150)', 'oklch(72% 0.09 130)'],
  ['oklch(60% 0.14 310)', 'oklch(75% 0.10 290)'],
  ['oklch(52% 0.13 20)', 'oklch(68% 0.11 40)'],
  ['oklch(50% 0.13 200)', 'oklch(65% 0.10 180)'],
  ['oklch(54% 0.14 85)', 'oklch(72% 0.11 70)'],
  ['oklch(45% 0.10 260)', 'oklch(58% 0.12 240)'],
  ['oklch(58% 0.13 160)', 'oklch(74% 0.10 140)'],
]

const tint = computed(() => {
  const key = props.event.slug || props.event.id
  let hash = 0
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) | 0
  return TINTS[Math.abs(hash) % TINTS.length]
})

const hasGallery = computed(() => !!props.event.album)

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}
</script>

<template>
  <article
    class="meetup-card group relative grid rounded-[14px] overflow-hidden border transition-all duration-200 hover:-translate-y-[3px] bg-white dark:bg-verse-950"
    :class="[
      featured ? 'sm:grid-cols-[1.1fr_1fr] min-h-[280px]' : 'sm:grid-cols-2 min-h-[192px]',
      status === 'live'
        ? 'border-coral shadow-[0_8px_24px_-8px_color-mix(in_oklch,var(--color-coral)_30%,transparent)]'
        : status === 'upcoming'
          ? 'border-verse-200 dark:border-verse-800 hover:border-verse-300 dark:hover:border-verse-700'
          : 'border-gray-200 dark:border-verse-900 hover:border-gray-300 dark:hover:border-verse-800',
    ]"
  >
    <!-- Body (left) -->
    <div
      class="flex flex-col justify-between gap-4 min-w-0"
      :class="featured ? 'p-8 md:p-10' : 'p-5 md:p-6'"
    >
      <div>
        <h3
          :class="
            featured
              ? 'font-display text-[32px] md:text-[40px] leading-[1.05] text-gray-900 dark:text-gray-100'
              : 'font-mono text-[17px] md:text-[19px] font-bold leading-tight tracking-[-0.01em] text-verse-500 dark:text-verse-300 break-words'
          "
        >
          <template v-if="featured">
            <span>{{ event.title }}</span>
          </template>
          <template v-else>
            {{ event.title }}
          </template>
        </h3>

        <p
          v-if="featured && event.description"
          class="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3"
        >
          {{ stripHtml(event.description) }}
        </p>

        <div
          class="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 font-mono text-[12px] text-gray-500 dark:text-gray-400"
        >
          <span class="inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-verse-500/80 dark:text-verse-300/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
            {{ formattedDate.full }}
          </span>
          <span v-if="event.venue" class="inline-flex items-center gap-1.5 truncate max-w-[220px]">
            <svg class="w-3.5 h-3.5 shrink-0 text-verse-500/80 dark:text-verse-300/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span class="truncate">{{ event.venue }}</span>
          </span>
          <span v-if="event.attendeeCount" class="inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-verse-500/80 dark:text-verse-300/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
              <circle cx="10" cy="7" r="4" />
              <path d="M21 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {{ event.attendeeCount }} attending
          </span>
        </div>
      </div>

      <!-- Footer: speakers / attendee badge -->
      <div class="flex items-center justify-between gap-3">
        <div v-if="speakers.length > 0" class="flex items-center gap-3 min-w-0">
          <div class="flex -space-x-2 shrink-0">
            <template v-for="speaker in speakers.slice(0, 4)" :key="speaker?.id">
              <SpeakerAvatar
                size="sm"
                :name="speaker.name"
                :github-username="speaker.githubUsername"
                :avatar-url="speaker.avatarUrl"
                class="border-2 border-white dark:border-verse-950"
              />
            </template>
            <div
              v-if="speakers.length > 4"
              class="w-8 h-8 rounded-lg bg-verse-50 dark:bg-verse-900 border-2 border-white dark:border-verse-950 flex items-center justify-center text-[10px] font-black text-verse-600 dark:text-verse-300"
            >
              +{{ speakers.length - 4 }}
            </div>
          </div>
          <span class="font-mono text-[11px] text-gray-500 dark:text-gray-400 truncate">
            {{ speakers[0].name
            }}<template v-if="speakers.length > 1"> & {{ speakers.length - 1 }} more</template>
          </span>
        </div>
        <div v-else-if="event.attendeeCount" class="font-mono text-[11px] text-gray-400 dark:text-gray-500">
          {{ event.attendeeCount }} attendees
        </div>
        <div v-else />
      </div>
    </div>

    <!-- Image / Placeholder (right) -->
    <div
      class="relative overflow-hidden border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-verse-900 min-h-[180px] sm:min-h-0 order-first sm:order-none"
      :class="[hasGallery ? '' : 'no-gallery-stripes']"
    >
      <!-- Gallery placeholder tint -->
      <div
        v-if="hasGallery"
        class="absolute inset-0"
        :style="{ background: `linear-gradient(135deg, ${tint[0]} 0%, ${tint[1]} 100%)` }"
      >
        <svg class="absolute inset-0 w-full h-full opacity-[0.35]" viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern :id="`pat-${event.id}`" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
              <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.3)" />
            </pattern>
          </defs>
          <rect width="200" height="140" :fill="`url(#pat-${event.id})`" />
          <rect x="20" y="30" width="70" height="50" rx="4" fill="rgba(255,255,255,0.12)" />
          <rect x="110" y="40" width="75" height="60" rx="4" fill="rgba(0,0,0,0.18)" />
          <circle cx="60" cy="110" r="16" fill="rgba(255,255,255,0.15)" />
        </svg>
        <div
          class="absolute inset-0 flex items-center justify-center font-mono text-[10px] tracking-widest uppercase text-white/90"
        >
          <span class="bg-black/25 px-2.5 py-1 rounded">{{ event.album || formattedDate.full }}</span>
        </div>
      </div>

      <!-- No gallery state -->
      <div
        v-else
        class="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-6 text-center"
      >
        <div
          class="w-10 h-10 rounded-[10px] bg-white dark:bg-verse-950 border border-dashed border-gray-300 dark:border-verse-800 grid place-items-center text-gray-400 dark:text-gray-500"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="11" r="1.5" />
            <path d="m21 16-4-4-8 8" />
            <path d="M3 19 21 5" stroke-dasharray="2 2" opacity="0.6" />
          </svg>
        </div>
        <div class="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {{ status === 'upcoming' ? 'Gallery opens after' : 'No photos yet' }}
        </div>
        <div class="font-mono text-[10px] text-gray-400 dark:text-gray-500 max-w-[22ch] leading-snug">
          {{
            status === 'upcoming'
              ? 'Photos will appear here once the event wraps'
              : 'Recap only — no photos were shared'
          }}
        </div>
      </div>

      <!-- Status tag -->
      <span
        class="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest backdrop-blur-md"
        :class="
          status === 'live'
            ? 'bg-coral-strong text-white'
            : status === 'upcoming'
              ? 'bg-white/90 dark:bg-verse-950/90 text-verse-600 dark:text-verse-300 border border-verse-100 dark:border-verse-800'
              : 'bg-white/85 dark:bg-verse-950/85 text-gray-700 dark:text-gray-300'
        "
      >
        <span v-if="status === 'live'" class="w-1.5 h-1.5 rounded-full bg-white" />
        {{ isMeetupToday ? 'Today' : isNextMeetup && status === 'upcoming' ? 'Next up' : statusLabel }}
      </span>

      <!-- Attendee badge bottom-right -->
      <span
        v-if="event.attendeeCount && hasGallery"
        class="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/92 dark:bg-verse-950/92 backdrop-blur-sm font-mono text-[11px] font-bold text-gray-900 dark:text-gray-100 shadow-sm"
      >
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
        </svg>
        {{ event.attendeeCount }}
      </span>
    </div>

    <Link
      :href="`/meetup/${event.slug || event.id}`"
      class="absolute inset-0 z-20"
      aria-label="View event details"
    />
  </article>
</template>

<style scoped>
.meetup-card:hover {
  box-shadow: 0 24px 48px -12px rgba(13, 20, 51, 0.16), 0 8px 16px -4px rgba(13, 20, 51, 0.08);
}
</style>