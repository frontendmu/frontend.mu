<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { DateTime } from 'luxon'
import { Head, Link, usePage, router } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
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
const showAllAttendees = ref(false)
const showMobileRsvp = ref(false)

// Check if user has an active RSVP
const hasRsvp = computed(() => !!props.userRsvp)
const rsvpStatus = computed(() => props.userRsvp?.status)

// Check if event is accepting RSVPs
const canRsvp = computed(() => {
  if (!props.meetup) return false
  if (!props.meetup.acceptingRsvp) return false
  if (!featureFlags.value.rsvpPastEvents && isPast.value) return false
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

// Capacity percentage
const capacityPercent = computed(() => {
  if (!props.meetup?.seatsAvailable) return 0
  return Math.min(100, Math.round((props.rsvpCount / props.meetup.seatsAvailable) * 100))
})

// Spots remaining
const spotsRemaining = computed(() => {
  if (!props.meetup?.seatsAvailable) return null
  return Math.max(0, props.meetup.seatsAvailable - props.rsvpCount)
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
  eventDate.value?.toFormat('EEEE, MMMM d, yyyy') ?? ''
)

const formattedDateShort = computed(() =>
  eventDate.value?.toFormat('EEE, MMM d') ?? ''
)

const daysUntil = computed(() => {
  if (!eventDate.value || !isUpcoming.value) return null
  const diff = eventDate.value.diff(DateTime.now(), 'days').days
  return Math.ceil(diff)
})

const visibleAttendees = computed(() => {
  if (showAllAttendees.value) return props.attendees
  return props.attendees.slice(0, 8)
})

const hasMoreAttendees = computed(() => props.attendees.length > 8)

// Handle scroll for mobile sticky bar
function handleScroll() {
  const rsvpSection = document.getElementById('rsvp-section')
  if (rsvpSection) {
    const rect = rsvpSection.getBoundingClientRect()
    showMobileRsvp.value = rect.bottom < 0
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Generate Google Calendar URL
const calendarUrl = computed(() => {
  if (!props.meetup || !eventDate.value) return null
  const title = encodeURIComponent(props.meetup.title)
  const date = eventDate.value.toFormat('yyyyMMdd')
  const location = encodeURIComponent(props.meetup.venue || '')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${date}&location=${location}`
})
</script>

<template>

  <Head :title="meetup?.title || 'Meetup'" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-6 lg:py-10">
        <template v-if="meetup">
          <!-- Breadcrumb -->
          <nav class="mb-6">
            <Link href="/meetups"
              class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                  clip-rule="evenodd" />
              </svg>
              Back to meetups
            </Link>
          </nav>

          <!-- Two Column Layout -->
          <div class="lg:grid lg:grid-cols-3 lg:gap-12">
            <!-- Main Content -->
            <div class="lg:col-span-2">
              <!-- Hero Section -->
              <header class="mb-8">
                <!-- Status Badge & Edit -->
                <div class="flex items-center gap-3 mb-4">
                  <span v-if="isToday"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-500/20">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    Happening Today
                  </span>
                  <span v-else-if="isUpcoming"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Upcoming
                  </span>
                  <span v-else-if="isPast"
                    class="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-500/20">
                    Past Event
                  </span>

                  <Link v-if="canEdit" :href="`/admin/events/${meetup.id}/edit`"
                    class="ml-auto inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded-full transition-colors">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                    </svg>
                    Edit
                  </Link>
                </div>

                <!-- Title -->
                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  {{ meetup.title }}
                </h1>
              </header>

              <!-- RSVP Section (Mobile Only) -->
              <section id="rsvp-section"
                v-if="isUpcoming || isToday || (featureFlags.rsvpPastEvents && isPast && meetup.acceptingRsvp)"
                class="lg:hidden mb-8 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p v-if="hasRsvp && rsvpStatus === 'confirmed'"
                      class="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      You're going
                    </p>
                    <p v-else-if="hasRsvp && rsvpStatus === 'waitlist'"
                      class="text-sm font-medium text-amber-600 dark:text-amber-400">
                      On waitlist
                    </p>
                    <p v-else-if="meetup.seatsAvailable" class="text-sm text-gray-600 dark:text-gray-400">
                      {{ spotsRemaining }} spots left
                    </p>
                    <p v-else class="text-sm text-gray-600 dark:text-gray-400">
                      {{ rsvpCount }} attending
                    </p>
                  </div>

                  <template v-if="!isAuthenticated && canRsvp">
                    <Link href="/login"
                      class="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                      Login to RSVP
                    </Link>
                  </template>
                  <template v-else-if="isAuthenticated && canRsvp">
                    <button v-if="hasRsvp" @click="handleCancelRsvp" :disabled="isRsvpLoading"
                      class="px-5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 transition-colors">
                      {{ isRsvpLoading ? 'Cancelling...' : 'Cancel' }}
                    </button>
                    <button v-else @click="handleRsvp" :disabled="isRsvpLoading"
                      class="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors">
                      {{ isRsvpLoading ? 'Processing...' : (isFull ? 'Join Waitlist' : 'RSVP') }}
                    </button>
                  </template>
                </div>

                <!-- Capacity bar -->
                <div v-if="meetup.seatsAvailable"
                  class="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500"
                    :class="capacityPercent >= 90 ? 'bg-amber-500' : 'bg-emerald-500'"
                    :style="{ width: `${capacityPercent}%` }"></div>
                </div>
              </section>

              <!-- Description -->
              <section v-if="meetup.description" class="mb-10">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">About</h2>
                <div
                  class="prose prose-gray dark:prose-invert prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-headings:text-gray-900 dark:prose-headings:text-gray-100 max-w-none"
                  v-html="meetup.description" />
              </section>

              <!-- Talks - Combined Sessions & Speakers -->
              <section v-if="meetup.sessions.length" class="mb-10">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Talks</h2>

                <div class="space-y-4">
                  <article v-for="session in meetup.sessions" :key="session.id"
                    class="p-5 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      {{ session.title }}
                    </h3>

                    <!-- Speakers for this session -->
                    <div v-if="session.speakers?.length" class="space-y-3">
                      <Link v-for="speaker in session.speakers" :key="speaker.id" :href="`/speaker/${speaker.id}`"
                        class="flex items-center gap-3 group">
                        <img v-if="speaker.githubUsername"
                          :src="`https://avatars.githubusercontent.com/${speaker.githubUsername}?size=80`"
                          :alt="speaker.name"
                          class="w-10 h-10 rounded-full ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-gray-200 dark:group-hover:ring-gray-600 transition-all" />
                        <div v-else
                          class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-sm font-medium">
                          {{ speaker.name?.charAt(0).toUpperCase() }}
                        </div>
                        <div class="flex-1 min-w-0">
                          <p
                            class="font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                            {{ speaker.name }}
                          </p>
                          <p v-if="speaker.githubUsername" class="text-sm text-gray-500 dark:text-gray-400">
                            @{{ speaker.githubUsername }}
                          </p>
                        </div>
                        <svg
                          class="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors flex-shrink-0"
                          viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd"
                            d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                            clip-rule="evenodd" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                </div>
              </section>

              <!-- Sponsors Section (Mobile) -->
              <section v-if="meetup.sponsors && meetup.sponsors.length" class="lg:hidden mb-10">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sponsored by</h2>
                <div class="flex flex-wrap gap-3">
                  <a v-for="sponsor in meetup.sponsors" :key="sponsor.id" :href="`/sponsor/${sponsor.id}`"
                    class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <span class="font-medium text-gray-900 dark:text-gray-100">{{ sponsor.name }}</span>
                  </a>
                </div>
              </section>
            </div>

            <!-- Sidebar (Desktop) -->
            <aside class="hidden lg:block">
              <div class="sticky top-24 space-y-5">
                <!-- RSVP Card -->
                <div v-if="isUpcoming || isToday || (featureFlags.rsvpPastEvents && isPast && meetup.acceptingRsvp)"
                  class="p-6 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <!-- Status -->
                  <div class="mb-5">
                    <div v-if="hasRsvp && rsvpStatus === 'confirmed'"
                      class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clip-rule="evenodd" />
                      </svg>
                      <span class="font-semibold">You're going!</span>
                    </div>
                    <div v-else-if="hasRsvp && rsvpStatus === 'waitlist'"
                      class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                          clip-rule="evenodd" />
                      </svg>
                      <span class="font-semibold">On the waitlist</span>
                    </div>
                    <div v-else>
                      <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        <template v-if="daysUntil && daysUntil > 0">
                          {{ daysUntil }} {{ daysUntil === 1 ? 'day' : 'days' }} to go
                        </template>
                        <template v-else-if="isToday">
                          Today!
                        </template>
                        <template v-else>
                          Free event
                        </template>
                      </p>
                    </div>
                  </div>

                  <!-- Capacity -->
                  <div v-if="meetup.seatsAvailable" class="mb-5">
                    <div class="flex items-baseline justify-between mb-2">
                      <span class="text-sm text-gray-600 dark:text-gray-400">
                        {{ rsvpCount }} / {{ meetup.seatsAvailable }} spots
                      </span>
                      <span v-if="spotsRemaining !== null && spotsRemaining <= 10 && spotsRemaining > 0"
                        class="text-xs font-medium text-amber-600 dark:text-amber-400">
                        {{ spotsRemaining }} left
                      </span>
                    </div>
                    <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500"
                        :class="capacityPercent >= 90 ? 'bg-amber-500' : 'bg-emerald-500'"
                        :style="{ width: `${capacityPercent}%` }"></div>
                    </div>
                  </div>
                  <div v-else class="mb-5">
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      {{ rsvpCount }} {{ rsvpCount === 1 ? 'person' : 'people' }} attending
                    </span>
                  </div>

                  <!-- CTA Button -->
                  <template v-if="!isAuthenticated && canRsvp">
                    <Link href="/login"
                      class="block w-full py-3 px-4 text-center font-semibold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                      Login to RSVP
                    </Link>
                    <p class="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                      Don't have an account?
                      <Link href="/register" class="underline hover:text-gray-900 dark:hover:text-gray-100">Register
                      </Link>
                    </p>
                  </template>

                  <template v-else-if="isAuthenticated && canRsvp">
                    <button v-if="hasRsvp" @click="handleCancelRsvp" :disabled="isRsvpLoading"
                      class="w-full py-3 px-4 font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 transition-colors">
                      {{ isRsvpLoading ? 'Cancelling...' : 'Cancel RSVP' }}
                    </button>
                    <button v-else @click="handleRsvp" :disabled="isRsvpLoading"
                      class="w-full py-3 px-4 font-semibold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors">
                      {{ isRsvpLoading ? 'Processing...' : (isFull ? 'Join Waitlist' : 'RSVP Now') }}
                    </button>
                  </template>

                  <template v-else-if="!canRsvp">
                    <div
                      class="py-3 px-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      RSVPs are closed
                    </div>
                  </template>

                  <!-- Messages -->
                  <div v-if="rsvpSuccess"
                    class="mt-4 p-3 text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    {{ rsvpSuccess }}
                  </div>
                  <div v-if="rsvpError"
                    class="mt-4 p-3 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    {{ rsvpError }}
                  </div>

                  <!-- Event Quick Info -->
                  <div class="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 space-y-3 text-sm">
                    <div class="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <svg class="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                          d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                          clip-rule="evenodd" />
                      </svg>
                      <span>{{ formattedDate }}</span>
                    </div>
                    <div v-if="meetup.startTime" class="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <svg class="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                          clip-rule="evenodd" />
                      </svg>
                      <span>{{ meetup.startTime }}</span>
                    </div>
                    <div v-if="meetup.venue" class="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <svg class="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                          d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                          clip-rule="evenodd" />
                      </svg>
                      <span>{{ meetup.venue }}</span>
                    </div>
                  </div>

                  <!-- Calendar Link -->
                  <a v-if="calendarUrl" :href="calendarUrl" target="_blank" rel="noopener noreferrer"
                    class="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        d="M5.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75V12zM6 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H6zM7.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H8a.75.75 0 01-.75-.75V12zM8 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H8zM9.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V10zM10 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H10zM9.25 14a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V14zM12 9.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V10a.75.75 0 00-.75-.75H12zM11.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V12zM12 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H12zM13.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H14a.75.75 0 01-.75-.75V10zM14 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H14z" />
                      <path fill-rule="evenodd"
                        d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                        clip-rule="evenodd" />
                    </svg>
                    Add to Calendar
                  </a>
                </div>

                <!-- Sponsors Card -->
                <div v-if="meetup.sponsors && meetup.sponsors.length"
                  class="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200/50 dark:border-amber-700/30">
                  <div class="flex items-center gap-2 mb-4">
                    <svg class="w-4 h-4 text-amber-600 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-100">Sponsored by</h3>
                  </div>

                  <div class="space-y-2">
                    <a v-for="sponsor in meetup.sponsors" :key="sponsor.id" :href="`/sponsor/${sponsor.id}`"
                      class="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/40 rounded-xl hover:bg-white dark:hover:bg-gray-800/60 transition-colors group">
                      <span class="font-medium text-gray-900 dark:text-gray-100">{{ sponsor.name }}</span>
                      <svg
                        class="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors"
                        viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                          d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                          clip-rule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>

                <!-- Attendees Preview -->
                <div v-if="isAuthenticated && attendees.length > 0"
                  class="p-5 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Who's coming
                  </h3>

                  <!-- Avatar Stack -->
                  <div class="flex items-center">
                    <div class="flex -space-x-2">
                      <template v-for="(attendee, index) in visibleAttendees.slice(0, 5)" :key="attendee.id">
                        <img v-if="attendee.githubUsername"
                          :src="`https://avatars.githubusercontent.com/${attendee.githubUsername}?size=40`"
                          :alt="attendee.name" class="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800"
                          :style="{ zIndex: 5 - index }" />
                        <div v-else
                          class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-white text-xs font-medium ring-2 ring-white dark:ring-gray-800"
                          :style="{ zIndex: 5 - index }">
                          {{ attendee.name.charAt(0).toUpperCase() }}
                        </div>
                      </template>
                    </div>
                    <span v-if="attendees.length > 5" class="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      +{{ attendees.length - 5 }} more
                    </span>
                  </div>

                  <!-- Full attendee list (expandable) -->
                  <div v-if="hasMoreAttendees" class="mt-4">
                    <button @click="showAllAttendees = !showAllAttendees"
                      class="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      {{ showAllAttendees ? 'Show less' : 'View all attendees' }}
                    </button>
                  </div>

                  <div v-if="showAllAttendees" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      <div v-for="attendee in attendees" :key="attendee.id"
                        class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <img v-if="attendee.githubUsername"
                          :src="`https://avatars.githubusercontent.com/${attendee.githubUsername}?size=24`"
                          :alt="attendee.name" class="w-5 h-5 rounded-full" />
                        <div v-else
                          class="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-medium">
                          {{ attendee.name.charAt(0).toUpperCase() }}
                        </div>
                        <span class="truncate">{{ attendee.name }}</span>
                      </div>
                    </div>
                  </div>

                  <p class="mt-3 text-[10px] text-gray-400 dark:text-gray-500">
                    Names partially hidden for privacy
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </template>

        <!-- Not Found State -->
        <template v-else>
          <div class="text-center py-20">
            <div
              class="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Meetup not found</h2>
            <p class="text-gray-500 dark:text-gray-400 mb-6">The meetup you're looking for doesn't exist or has been
              removed.</p>
            <Link href="/meetups"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                  clip-rule="evenodd" />
              </svg>
              View all meetups
            </Link>
          </div>
        </template>
      </div>
    </ContentBlock>

    <!-- Mobile Sticky RSVP Bar -->
    <Teleport to="body">
      <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-y-full"
        enter-to-class="translate-y-0" leave-active-class="transition-transform duration-200 ease-in"
        leave-from-class="translate-y-0" leave-to-class="translate-y-full">
        <div v-if="showMobileRsvp && meetup && (isUpcoming || isToday) && canRsvp"
          class="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ meetup.title }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ formattedDateShort }}</p>
            </div>

            <template v-if="!isAuthenticated">
              <Link href="/login"
                class="flex-shrink-0 px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg">
                Login
              </Link>
            </template>
            <template v-else>
              <button v-if="hasRsvp" @click="handleCancelRsvp" :disabled="isRsvpLoading"
                class="flex-shrink-0 px-5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg disabled:opacity-50">
                Cancel
              </button>
              <button v-else @click="handleRsvp" :disabled="isRsvpLoading"
                class="flex-shrink-0 px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg disabled:opacity-50">
                {{ isFull ? 'Waitlist' : 'RSVP' }}
              </button>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </DefaultLayout>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
</style>
