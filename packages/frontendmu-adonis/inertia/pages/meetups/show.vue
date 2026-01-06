<script setup lang="ts">
import { computed } from 'vue'
import { DateTime } from 'luxon'
import { Head, Link } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
import Event from '#models/event'

interface Props {
  meetup: Event | null
}

const props = defineProps<Props>()

const eventDate = computed(() => {
  if (!props.meetup?.eventDate) return null
  const date = props.meetup.eventDate
  if (typeof date === 'string') return DateTime.fromISO(date)
  if (typeof date === 'object' && 'toJSDate' in date) return DateTime.fromJSDate(date.toJSDate())
  return DateTime.fromISO(date as unknown as string)
})

const isUpcoming = computed(() =>
  eventDate.value ? eventDate.value > DateTime.now() : false
)

const isToday = computed(() =>
  eventDate.value ? eventDate.value.hasSame(DateTime.now(), 'day') : false
)

const formattedDate = computed(() =>
  eventDate.value?.toLocaleString(DateTime.DATE_FULL) ?? ''
)

const speakers = computed(() => {
  if (!props.meetup) return []
  return props.meetup.sessions.flatMap((session) => session.speakers || []).filter(Boolean)
})
</script>

<template>

  <Head :title="meetup?.title || 'Meetup'" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <template v-if="meetup">
          <!-- Breadcrumb -->
          <nav class="mb-6">
            <Link href="/meetups"
              class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200">
              &larr; All Meetups
            </Link>
          </nav>

          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center gap-4 mb-4">
              <span v-if="isToday"
                class="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-sm font-medium">
                TODAY
              </span>
              <span v-else-if="isUpcoming"
                class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                UPCOMING
              </span>
            </div>
            <BaseHeading :level="1" class="mb-4">{{ meetup.title }}</BaseHeading>

            <div class="flex flex-wrap gap-6 text-verse-600 dark:text-verse-400">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
                  <path
                    d="M26 4h-4V2h-2v2h-8V2h-2v2H6c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 22H6V12h20zm0-16H6V6h4v2h2V6h8v2h2V6h4z" />
                </svg>
                <span>{{ formattedDate }}</span>
              </div>
              <div v-if="meetup.startTime" class="flex items-center gap-2">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16 4a12 12 0 1 0 12 12A12 12 0 0 0 16 4m0 22a10 10 0 1 1 10-10a10 10 0 0 1-10 10" />
                  <path d="M17 9h-2v8h7v-2h-5z" />
                </svg>
                <span>{{ meetup.startTime }}</span>
              </div>
              <div v-if="meetup.venue" class="flex items-center gap-2">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
                  <path
                    d="M16 2A11.013 11.013 0 0 0 5 13a10.889 10.889 0 0 0 2.216 6.6s.3.395.349.452L16 30l8.439-9.953c.044-.053.345-.447.345-.447l.001-.003A10.885 10.885 0 0 0 27 13A11.013 11.013 0 0 0 16 2m0 15a4 4 0 1 1 4-4a4.005 4.005 0 0 1-4 4" />
                </svg>
                <span>{{ meetup.venue }}</span>
              </div>
              <div v-if="meetup.attendeeCount" class="flex items-center gap-2">
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
                  <path
                    d="M31 30h-2v-5a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v5h-2v-5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5zM24 12a3 3 0 1 1-3 3a3 3 0 0 1 3-3m0-2a5 5 0 1 0 5 5a5 5 0 0 0-5-5M15 22h-2v-5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v5H1v-5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5zM8 4a3 3 0 1 1-3 3a3 3 0 0 1 3-3m0-2a5 5 0 1 0 5 5a5 5 0 0 0-5-5" />
                </svg>
                <span>{{ meetup.attendeeCount }} attendees</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div v-if="meetup.description" class="prose dark:prose-invert max-w-none mb-12" v-html="meetup.description" />

          <!-- Sessions -->
          <section v-if="meetup.sessions.length" class="mb-12">
            <h2 class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-6">Sessions</h2>
            <div class="space-y-4">
              <div v-for="session in meetup.sessions" :key="session.id"
                class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700">
                <h3 class="text-xl font-semibold text-verse-900 dark:text-verse-100 mb-3">
                  {{ session.title }}
                </h3>
                <div v-for="speaker in session.speakers || []" :key="speaker.id" class="flex items-center gap-3">
                  <img v-if="speaker.githubUsername"
                    :src="`https://avatars.githubusercontent.com/${speaker.githubUsername}`" :alt="speaker.name"
                    class="w-10 h-10 rounded-full" />
                  <span class="text-verse-600 dark:text-verse-300">{{ speaker.name }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Sponsors -->
          <section v-if="meetup.sponsors && meetup.sponsors.id" class="mb-12">
            <h2 class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-6">Sponsors</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div
                class="p-4 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700 text-center">
                <p class="font-medium text-verse-900 dark:text-verse-100">
                  {{ meetup.sponsors.name }}
                </p>
              </div>
            </div>
          </section>
        </template>

        <template v-else>
          <div class="text-center py-16">
            <p class="text-verse-600 dark:text-verse-400">Meetup not found.</p>
            <Link href="/meetups"
              class="inline-block mt-4 text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200 underline">
              View all meetups
            </Link>
          </div>
        </template>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
