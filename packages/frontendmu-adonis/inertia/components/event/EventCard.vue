<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import { formatDate, isDateInFuture } from '~/utils/date'
import type { Meetup } from '~/types'

interface Props {
  event: Meetup
  isNextMeetup?: boolean
  isMeetupToday?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isNextMeetup: false,
  isMeetupToday: false,
})

const isHighlightedEvent = computed(
  () => props.isNextMeetup || props.isMeetupToday
)

function allSpeakersForEvent(event: Meetup) {
  return event.sessions.map((session) => session.Session_id?.speakers).filter(Boolean)
}

const speakers = computed(() => allSpeakersForEvent(props.event))
</script>

<template>
  <div
    class="group group/event in-card bg-white dark:bg-verse-700/30 dark:backdrop-blur-sm border-2 rounded-xl overflow-hidden hover:border-verse-500 transition-all duration-300"
    :class="[
      event?.album ? 'col-span-2 md:col-span-1' : 'md:col-span-1 col-span-2',
      isHighlightedEvent
        ? 'border-green-600 dark:border-green-500'
        : 'border-verse-50 dark:border-white/10',
    ]"
  >
    <div
      class="relative flex overflow-clip h-full flex-col md:flex-row justify-between w-full transition-all duration-300 group-hover[.in-card]:shadow-lg"
    >
      <!-- Background gradient -->
      <div
        class="inset-0 absolute z-0 bg-gradient-to-r from-white via-white dark:from-verse-900 dark:via-verse-900 to-transparent"
      />

      <!-- Link overlay -->
      <Link class="absolute inset-0 z-10" :href="`/meetup/${event.id}`">
        <span class="sr-only">View details for {{ event?.title }}</span>
      </Link>

      <div
        class="relative z-5 flex flex-col p-4 w-full justify-between gap-4"
      >
        <template v-if="event.Date">
          <div
            class="flex flex-col font-mono text-sm font-medium gap-2 w-full justify-between"
            :class="[
              isMeetupToday || isDateInFuture(new Date(event.Date))
                ? 'text-green-600 font-bold'
                : 'text-verse-900 dark:text-verse-300',
            ]"
          >
            <!-- Title -->
            <div class="flex items-center justify-between">
              <h3
                class="leading-2 text-2xl font-semibold text-verse-500 dark:text-white group-hover[.in-card]:text-verse-500 w-[300px] max-w-full md:w-96 focus:outline-none"
                :title="`Meetup ${event?.title}`"
              >
                {{ event?.title }}
              </h3>

              <template v-if="isNextMeetup">
                <span
                  class="bg-green-700 text-sm font-mono justify-end text-white px-3 rounded-md font-bold"
                >
                  NEXT MEETUP
                </span>
              </template>

              <template v-if="isMeetupToday">
                <span
                  aria-label="This meetup is happening today"
                  class="flex flex-row items-center gap-1 text-sm font-mono justify-end text-red-800 dark:text-red-300 ps-2 pe-3 rounded-md font-bold outline outline-1"
                >
                  <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>TODAY</span>
                </span>
              </template>
            </div>

            <div class="flex items-center gap-2">
              <!-- Date -->
              <div class="flex items-center">
                <svg
                  class="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                >
                  <path
                    d="M26 4h-4V2h-2v2h-8V2h-2v2H6c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 22H6V12h20zm0-16H6V6h4v2h2V6h8v2h2V6h4z"
                  />
                </svg>
                <span>{{
                  formatDate(event.Date, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                }}</span>
              </div>

              <div
                v-if="event.Venue"
                class="flex gap-1 md:gap-0 items-center justify-start text-base font-medium leading-3 md:leading-5"
              >
                <svg
                  class="mr-1.5 h-4 w-4 flex-shrink-0 truncate"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                >
                  <path
                    d="M16 2A11.013 11.013 0 0 0 5 13a10.889 10.889 0 0 0 2.216 6.6s.3.395.349.452L16 30l8.439-9.953c.044-.053.345-.447.345-.447l.001-.003A10.885 10.885 0 0 0 27 13A11.013 11.013 0 0 0 16 2m0 15a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4"
                  />
                </svg>
                <div class="pt-[2px] line-clamp-1 md:line-clamp-none">
                  {{ event.Venue }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <div class="flex justify-between items-end">
          <!-- Speakers -->
          <div class="flex -space-x-2">
            <template v-for="speaker in speakers.slice(0, 5)" :key="speaker?.id">
              <img
                v-if="speaker?.github_account"
                :src="`https://avatars.githubusercontent.com/${speaker.github_account}`"
                :alt="speaker.name"
                class="w-8 h-8 rounded-full border-2 border-white dark:border-verse-800 object-cover"
              />
            </template>
            <span
              v-if="speakers.length > 5"
              class="w-8 h-8 rounded-full border-2 border-white dark:border-verse-800 bg-verse-200 dark:bg-verse-700 flex items-center justify-center text-xs font-medium"
            >
              +{{ speakers.length - 5 }}
            </span>
          </div>

          <!-- Attendees -->
          <template v-if="event.Attendees">
            <div
              class="flex items-center border-gray-100 bg-white/70 dark:bg-verse-950/60 rounded-full px-2"
              title="Attendees"
            >
              <svg
                class="mr-1.5 h-4 w-4 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                fill="currentColor"
              >
                <path
                  d="M31 30h-2v-5a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v5h-2v-5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5zM24 12a3 3 0 1 1-3 3a3 3 0 0 1 3-3m0-2a5 5 0 1 0 5 5a5 5 0 0 0-5-5M15 22h-2v-5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v5H1v-5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5zM8 4a3 3 0 1 1-3 3a3 3 0 0 1 3-3m0-2a5 5 0 1 0 5 5a5 5 0 0 0-5-5"
                />
              </svg>
              <div class="pt-[2px] line-clamp-1 md:line-clamp-none">
                {{ event?.Attendees === 0 ? 'No' : event?.Attendees }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
