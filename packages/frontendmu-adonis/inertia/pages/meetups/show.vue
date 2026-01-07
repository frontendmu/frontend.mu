<script setup lang="ts">
import { computed, ref } from 'vue'
import { DateTime } from 'luxon'
import { Head, Link, usePage, router } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
import type Event from '#models/event'
import type Rsvp from '#models/rsvp'

interface PublicAttendee {
  id: string
  name: string
  avatarUrl: string | null
  githubUsername: string | null
}

interface Props {
  meetup: Event | null
  userRsvp: Rsvp | null
  rsvpCount: number
  canEdit: boolean
  attendees: PublicAttendee[]
}

const props = defineProps<Props>()

const page = usePage()
const isAuthenticated = computed(() => page.props.auth?.isAuthenticated)
const featureFlags = computed(() => (page.props as any).featureFlags || {})

// RSVP state
const isRsvpLoading = ref(false)
const rsvpError = ref<string | null>(null)
const rsvpSuccess = ref<string | null>(null)

// Check if user has an active RSVP
const hasRsvp = computed(() => !!props.userRsvp)
const rsvpStatus = computed(() => props.userRsvp?.status)

// Check if event is accepting RSVPs
const canRsvp = computed(() => {
  if (!props.meetup) return false
  if (!props.meetup.acceptingRsvp) return false
  // Check if event is in the past (skip if feature flag is enabled)
  if (!featureFlags.value.rsvpPastEvents && isPast.value) return false
  // Check RSVP closing date
  if (props.meetup.rsvpClosingDate) {
    const closingDate = typeof props.meetup.rsvpClosingDate === 'string'
      ? DateTime.fromISO(props.meetup.rsvpClosingDate)
      : DateTime.fromJSDate(props.meetup.rsvpClosingDate.toJSDate())
    if (closingDate < DateTime.now()) return false
  }
  return true
})

// Check if event is full
const isFull = computed(() => {
  if (!props.meetup?.seatsAvailable) return false
  return props.rsvpCount >= props.meetup.seatsAvailable
})

// RSVP handlers
async function handleRsvp() {
  if (!props.meetup) return

  isRsvpLoading.value = true
  rsvpError.value = null
  rsvpSuccess.value = null

  try {
    const response = await fetch(`/api/events/${props.meetup.id}/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(
          document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] || ''
        ),
      },
    })

    const data = await response.json()

    if (response.ok) {
      rsvpSuccess.value = data.message
      // Reload the page to get fresh data
      router.reload()
    } else {
      rsvpError.value = data.message || 'Failed to RSVP'
    }
  } catch (error) {
    rsvpError.value = 'An error occurred. Please try again.'
  } finally {
    isRsvpLoading.value = false
  }
}

async function handleCancelRsvp() {
  if (!props.meetup) return

  isRsvpLoading.value = true
  rsvpError.value = null
  rsvpSuccess.value = null

  try {
    const response = await fetch(`/api/events/${props.meetup.id}/rsvp`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(
          document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] || ''
        ),
      },
    })

    const data = await response.json()

    if (response.ok) {
      rsvpSuccess.value = data.message
      // Reload the page to get fresh data
      router.reload()
    } else {
      rsvpError.value = data.message || 'Failed to cancel RSVP'
    }
  } catch (error) {
    rsvpError.value = 'An error occurred. Please try again.'
  } finally {
    isRsvpLoading.value = false
  }
}

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

const isPast = computed(() =>
  eventDate.value ? eventDate.value < DateTime.now() && !isToday.value : false
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
          <!-- Breadcrumb & Edit Link -->
          <nav class="mb-6 flex items-center justify-between">
            <Link href="/meetups"
              class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200">
              &larr; All Meetups
            </Link>
            <Link
              v-if="canEdit"
              :href="`/admin/events/${meetup.id}/edit`"
              class="inline-flex items-center gap-2 px-4 py-2 bg-verse-600 hover:bg-verse-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
                <path d="M2 26h28v2H2zM25.4 9c.8-.8.8-2 0-2.8l-3.6-3.6c-.8-.8-2-.8-2.8 0l-15 15V24h6.4l15-15zm-5-5L24 7.6l-3 3L17.4 7l3-3zM6 22v-3.6l10-10 3.6 3.6-10 10H6z"/>
              </svg>
              Edit Event
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

          <!-- RSVP Section -->
          <div v-if="isUpcoming || isToday || (featureFlags.rsvpPastEvents && isPast && meetup.acceptingRsvp)" class="mb-8 p-6 bg-verse-50 dark:bg-verse-800/50 rounded-xl border border-verse-100 dark:border-verse-700">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 class="text-lg font-semibold text-verse-900 dark:text-verse-100 mb-1">
                  <template v-if="canRsvp">
                    <template v-if="hasRsvp">
                      You're registered!
                    </template>
                    <template v-else>
                      Join this meetup
                    </template>
                  </template>
                  <template v-else>
                    RSVPs are closed
                  </template>
                </h3>
                <p class="text-sm text-verse-600 dark:text-verse-400">
                  <template v-if="hasRsvp && rsvpStatus === 'confirmed'">
                    Your spot is confirmed. See you there!
                  </template>
                  <template v-else-if="hasRsvp && rsvpStatus === 'waitlist'">
                    You're on the waitlist. We'll notify you if a spot opens up.
                  </template>
                  <template v-else-if="canRsvp && meetup.seatsAvailable">
                    {{ rsvpCount }} / {{ meetup.seatsAvailable }} spots taken
                    <span v-if="isFull" class="text-amber-600 dark:text-amber-400"> (Waitlist available)</span>
                  </template>
                  <template v-else-if="canRsvp">
                    {{ rsvpCount }} people attending
                  </template>
                  <template v-else>
                    This event is no longer accepting RSVPs.
                  </template>
                </p>
              </div>

              <div class="flex flex-col gap-2">
                <!-- Not authenticated -->
                <template v-if="!isAuthenticated && canRsvp">
                  <Link
                    href="/login"
                    class="inline-flex items-center justify-center px-6 py-2.5 bg-verse-600 hover:bg-verse-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Login to RSVP
                  </Link>
                  <p class="text-xs text-verse-500 dark:text-verse-400 text-center">
                    Don't have an account? <Link href="/register" class="underline">Register</Link>
                  </p>
                </template>

                <!-- Authenticated and can RSVP -->
                <template v-else-if="isAuthenticated && canRsvp">
                  <template v-if="hasRsvp">
                    <button
                      @click="handleCancelRsvp"
                      :disabled="isRsvpLoading"
                      class="inline-flex items-center justify-center px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors"
                    >
                      <span v-if="isRsvpLoading">Cancelling...</span>
                      <span v-else>Cancel RSVP</span>
                    </button>
                  </template>
                  <template v-else>
                    <button
                      @click="handleRsvp"
                      :disabled="isRsvpLoading"
                      class="inline-flex items-center justify-center px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
                    >
                      <span v-if="isRsvpLoading">Processing...</span>
                      <span v-else-if="isFull">Join Waitlist</span>
                      <span v-else>RSVP Now</span>
                    </button>
                  </template>
                </template>
              </div>
            </div>

            <!-- Success/Error messages -->
            <div v-if="rsvpSuccess" class="mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm">
              {{ rsvpSuccess }}
            </div>
            <div v-if="rsvpError" class="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg text-sm">
              {{ rsvpError }}
            </div>
          </div>

          <!-- Attendees Section (only visible to logged in users) -->
          <section v-if="isAuthenticated && attendees.length > 0" class="mb-8">
            <h2 class="text-xl font-bold text-verse-900 dark:text-verse-100 mb-4">
              Who's Coming ({{ attendees.length }})
            </h2>
            <div class="flex flex-wrap gap-3">
              <div
                v-for="attendee in attendees"
                :key="attendee.id"
                class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-verse-800/50 rounded-lg border border-verse-100 dark:border-verse-700"
              >
                <img
                  v-if="attendee.githubUsername"
                  :src="`https://avatars.githubusercontent.com/${attendee.githubUsername}?size=32`"
                  :alt="attendee.name"
                  class="w-8 h-8 rounded-full"
                />
                <div
                  v-else-if="attendee.avatarUrl"
                  class="w-8 h-8 rounded-full bg-cover bg-center"
                  :style="{ backgroundImage: `url(${attendee.avatarUrl})` }"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded-full bg-verse-200 dark:bg-verse-600 flex items-center justify-center text-verse-600 dark:text-verse-300 text-sm font-medium"
                >
                  {{ attendee.name.charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm text-verse-700 dark:text-verse-300">{{ attendee.name }}</span>
              </div>
            </div>
            <p class="mt-3 text-xs text-verse-500 dark:text-verse-400">
              Names are partially hidden for privacy.
            </p>
          </section>

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
                <div v-for="speaker in session.speakers || []" :key="speaker.id">
                  <Link :href="`/speaker/${speaker.id}`" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img v-if="speaker.githubUsername"
                      :src="`https://avatars.githubusercontent.com/${speaker.githubUsername}`" :alt="speaker.name"
                      class="w-10 h-10 rounded-full" />
                    <span class="text-verse-600 dark:text-verse-300">{{ speaker.name }}</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <!-- Sponsors -->
          <section v-if="meetup.sponsors && meetup.sponsors.length" class="mb-12">
            <h2 class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-6">Sponsors</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <a
                v-for="sponsor in meetup.sponsors"
                :key="sponsor.id"
                :href="`/sponsor/${sponsor.id}`"
                class="p-4 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700 text-center hover:shadow-md transition-shadow"
              >
                <p class="font-medium text-verse-900 dark:text-verse-100 mb-2">
                  {{ sponsor.name }}
                </p>
                <div class="flex flex-wrap gap-1 justify-center">
                  <span
                    v-for="type in sponsor.sponsorTypes || []"
                    :key="type"
                    class="px-2 py-0.5 bg-verse-100 dark:bg-verse-700 text-verse-600 dark:text-verse-300 rounded text-xs capitalize"
                  >
                    {{ type }}
                  </span>
                </div>
              </a>
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
