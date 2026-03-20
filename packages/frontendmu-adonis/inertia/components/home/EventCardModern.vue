<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import { Data } from '@generated/data'
import SpeakerAvatar from '~/components/shared/SpeakerAvatar.vue'
import { isDateInFuture } from '~/utils/date'

interface Props {
  event: Data.Event
}

const props = defineProps<Props>()

const formattedDate = computed(() => {
  if (!props.event.date) return ''
  const date = new Date(props.event.date)
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return { day, month, year }
})

const isUpcoming = computed(() => {
  return props.event.date ? isDateInFuture(new Date(props.event.date)) : false
})

const speakers = computed(() => {
  return props.event.sessions?.flatMap((session) => session.speakers).filter(Boolean) || []
})
</script>

<template>
  <div class="group relative py-4">
    <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
      <!-- Date Column -->
      <div
        class="flex md:flex-col items-baseline md:items-center justify-start md:min-w-[60px] gap-2 md:gap-0 shrink-0 text-gray-400 dark:text-gray-400 group-hover:text-verse-500 transition-colors"
      >
        <span class="text-3xl font-black leading-none tracking-tighter">
          {{ formattedDate.day }}
        </span>
        <span class="text-sm font-bold uppercase tracking-widest">
          {{ formattedDate.month }} '{{ formattedDate.year?.toString().slice(-2) }}
        </span>
      </div>

      <!-- Content Column -->
      <div class="flex-1 min-w-0 space-y-2">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {{ event.title }}
            </h3>
            <span
              v-if="isUpcoming"
              class="shrink-0 px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-green-500 text-white rounded"
            >
              Upcoming
            </span>
          </div>

          <div
            class="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500 dark:text-gray-400"
          >
            <div v-if="event.venue" class="flex items-center gap-1.5">
              <span class="opacity-50 text-verse-500 dark:text-verse-400">@</span>
              <span class="truncate max-w-[250px]">{{ event.venue }}</span>
            </div>

            <div v-if="event.attendeeCount" class="flex items-center gap-1.5">
              <span class="opacity-50 text-verse-500 dark:text-verse-400">#</span>
              {{ event.attendeeCount }} attended
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
                class="w-7 h-7 border border-white dark:border-verse-950"
              />
            </template>
            <div
              v-if="speakers.length > 4"
              class="w-7 h-7 rounded-full bg-verse-50 dark:bg-verse-900 border border-white dark:border-verse-950 flex items-center justify-center text-[9px] font-black text-verse-600"
            >
              +{{ speakers.length - 4 }}
            </div>
          </div>
          <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 italic">
            Featuring {{ speakers[0].name
            }}<template v-if="speakers.length > 1"> & {{ speakers.length - 1 }} others</template>
          </span>
        </div>
      </div>

      <!-- Action Column -->
      <div class="hidden md:block">
        <div
          class="w-8 h-8 rounded-md border border-gray-200 dark:border-verse-800 flex items-center justify-center"
        >
          <svg
            class="w-4 h-4 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="absolute bottom-0 left-0 w-full h-px bg-gray-100 dark:bg-verse-900"></div>

    <Link
      :href="`/meetup/${event.id}`"
      class="absolute inset-0 z-20"
      aria-label="View event details"
    />
  </div>
</template>
