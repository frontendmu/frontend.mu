<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { DateTime } from 'luxon'
import { Head, Link, usePage, router } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import { sanitizeHtml } from '~/composables/useSanitize'
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
    <main class="relative min-h-screen pt-40 pb-32">
      <div class="contain relative z-10 max-w-5xl">
        <template v-if="meetup">
          <!-- Header Navigation -->
          <nav class="mb-12 flex items-center justify-between">
            <Link href="/meetups"
              class="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-verse-500 transition-colors">
              <svg class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
              </svg>
              Archives
            </Link>

            <Link v-if="canEdit" :href="`/admin/events/${meetup.id}/edit`"
              class="text-[10px] font-black uppercase tracking-widest text-verse-600 dark:text-verse-400 hover:text-verse-500 transition-colors">
              Edit Event
            </Link>
          </nav>

          <!-- Main Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <!-- Left Column: Content -->
            <div class="lg:col-span-7 space-y-12">
              <header class="space-y-4">
                <h1 class="text-4xl md:text-6xl font-black tracking-tighter dark:text-gray-100 leading-none">
                  {{ meetup.title }}
                </h1>
              </header>

              <!-- Description -->
              <section v-if="meetup.description" class="space-y-4">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black uppercase tracking-[0.2em] text-verse-500 dark:text-verse-400">Context</span>
                  <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
                </div>
                <div
                  class="prose prose-lg dark:prose-invert max-w-none font-medium leading-relaxed text-gray-600 dark:text-gray-400"
                  v-html="sanitizeHtml(meetup.description)" />
              </section>

              <!-- Sessions/Talks -->
              <section v-if="meetup.sessions.length" class="space-y-8">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black uppercase tracking-[0.2em] text-verse-500 dark:text-verse-400">Agenda</span>
                  <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
                </div>

                <div class="divide-y divide-gray-100 dark:divide-verse-900 border-y border-gray-100 dark:border-verse-900">
                  <article v-for="(session, index) in meetup.sessions" :key="session.id"
                    class="py-8 group">
                    <div class="flex gap-6">
                      <span class="text-lg font-black text-gray-200 dark:text-verse-800 tabular-nums">0{{ index + 1 }}</span>
                      <div class="flex-1 space-y-6">
                        <h3 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                          {{ session.title }}
                        </h3>

                        <div v-if="session.speakers?.length" class="flex flex-wrap gap-6">
                          <Link v-for="speaker in session.speakers" :key="speaker.id" :href="`/speaker/${speaker.id}`"
                            class="flex items-center gap-3 group/speaker transition-all">
                            <SpeakerAvatar
                              size="md"
                              :name="speaker.name"
                              :github-username="speaker.githubUsername"
                              class="grayscale group-hover/speaker:grayscale-0 transition-all ring-2 ring-gray-100 dark:ring-verse-900 group-hover/speaker:ring-verse-500"
                            />
                            <div class="leading-tight">
                              <p class="text-sm font-bold text-gray-900 dark:text-gray-200 group-hover/speaker:text-verse-500 transition-colors">
                                {{ speaker.name }}
                              </p>
                              <p v-if="speaker.githubUsername" class="text-[10px] font-mono text-gray-400">
                                @{{ speaker.githubUsername }}
                              </p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </section>
            </div>

            <!-- Right Column: Sidebar -->
            <aside class="lg:col-span-5">
              <div class="sticky top-24 space-y-10">
                <!-- Data Registry Card -->
                <div class="bg-white dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-3xl squircle overflow-hidden shadow-sm">
                  <div class="p-8 space-y-6">
                    <div class="grid grid-cols-1 gap-6">
                      <div class="flex items-baseline justify-between group/item">
                        <p class="text-[10px] font-mono uppercase tracking-widest text-gray-400 group-hover/item:text-verse-500 transition-colors">Date</p>
                        <p class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ eventDate?.toFormat('dd MMM yyyy') }}</p>
                      </div>
                      <div class="flex items-baseline justify-between group/item">
                        <p class="text-[10px] font-mono uppercase tracking-widest text-gray-400 group-hover/item:text-verse-500 transition-colors">Time</p>
                        <p class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ meetup.startTime || 'TBA' }}</p>
                      </div>
                      <div class="flex items-baseline justify-between group/item">
                        <p class="text-[10px] font-mono uppercase tracking-widest text-gray-400 group-hover/item:text-verse-500 transition-colors">Capacity</p>
                        <p class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ rsvpCount }} / {{ meetup.seatsAvailable || '∞' }}</p>
                      </div>
                    </div>

                    <div v-if="meetup.venue" class="pt-6 border-t border-gray-100 dark:border-verse-800/50 space-y-1">
                      <p class="text-[10px] font-mono uppercase tracking-widest text-gray-400">Venue</p>
                      <p class="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug">{{ meetup.venue }}</p>
                      <p v-if="meetup.location" class="text-xs text-gray-400 font-medium italic">{{ meetup.location }}</p>
                    </div>

                    <!-- Action Area -->
                    <div class="pt-4 space-y-3">
                      <div v-if="isUpcoming || isToday || (featureFlags.rsvpPastEvents && isPast && meetup.acceptingRsvp)">
                        <template v-if="!isAuthenticated && canRsvp">
                          <Link href="/login"
                            class="block w-full py-3.5 text-center text-[10px] font-black uppercase tracking-[0.2em] bg-verse-600 text-white rounded-lg hover:bg-verse-700 transition-all">
                            Authenticate to Register
                          </Link>
                        </template>
                        <template v-else-if="isAuthenticated && canRsvp">
                          <button v-if="hasRsvp" @click="handleCancelRsvp" :disabled="isRsvpLoading"
                            class="w-full py-3.5 text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
                            {{ isRsvpLoading ? '...' : 'Revoke Registration' }}
                          </button>
                          <button v-else @click="handleRsvp" :disabled="isRsvpLoading"
                            class="w-full py-3.5 text-[10px] font-black uppercase tracking-[0.2em] bg-verse-600 text-white rounded-lg hover:bg-verse-700 transition-all disabled:opacity-50 shadow-lg shadow-verse-600/20">
                            {{ isRsvpLoading ? '...' : (isFull ? 'Join Queue' : 'Initialize Registration') }}
                          </button>
                        </template>
                        <div v-else class="text-center p-3 bg-gray-50 dark:bg-verse-950/40 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 dark:border-verse-800">
                          Registration Closed
                        </div>
                      </div>
                      
                      <div class="flex gap-2">
                        <a v-if="calendarUrl" :href="calendarUrl" target="_blank"
                          class="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-100 dark:border-verse-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-verse-500 dark:hover:text-verse-400 transition-colors">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Add to Calendar
                        </a>
                        <button class="p-2.5 border border-gray-100 dark:border-verse-800 rounded-lg text-gray-400 hover:text-verse-500 transition-colors" aria-label="Share">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Attendee Record -->
                <div v-if="attendees.length > 0" class="space-y-4">
                  <div class="flex items-center justify-between px-1">
                    <h3 class="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Attendee Record</h3>
                    <span class="text-[9px] font-mono text-verse-500">{{ rsvpCount }} entries</span>
                  </div>

                  <div class="grid grid-cols-6 gap-2">
                    <template v-for="attendee in visibleAttendees" :key="attendee.id">
                      <SpeakerAvatar
                        size="sm"
                        :name="attendee.name"
                        :github-username="attendee.githubUsername"
                        :title="attendee.name"
                        class="grayscale hover:grayscale-0 transition-all hover:scale-110 hover:z-10"
                      />
                    </template>
                    <button v-if="hasMoreAttendees" @click="showAllAttendees = !showAllAttendees"
                      class="aspect-square rounded bg-verse-50 dark:bg-verse-900 border border-verse-100 dark:border-verse-800 flex items-center justify-center text-[9px] font-black text-verse-500 hover:bg-verse-500 hover:text-white transition-colors">
                      {{ showAllAttendees ? '−' : `+${attendees.length - 8}` }}
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </template>

        <!-- Not Found -->
        <template v-else>
          <div class="text-center py-32 space-y-8">
            <div class="w-24 h-24 bg-verse-50 dark:bg-verse-900/20 rounded-full flex items-center justify-center mx-auto">
              <svg class="w-12 h-12 text-verse-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 0112.728 0M5.657 5.657a8 8 0 0116.97 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-4xl font-black tracking-tight dark:text-white">Meetup not found.</h2>
            <Link href="/meetups"
              class="inline-flex items-center gap-4 px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">
              Return to Archives
            </Link>
          </div>
        </template>
      </div>
    </main>

    <!-- Mobile RSVP Bar -->
    <Teleport to="body">
      <Transition enter-active-class="transition-transform duration-500 cubic-bezier(0.87, 0, 0.13, 1)" enter-from-class="translate-y-full"
        enter-to-class="translate-y-0" leave-active-class="transition-transform duration-300 ease-in"
        leave-from-class="translate-y-0" leave-to-class="translate-y-full">
        <div v-if="showMobileRsvp && meetup && (isUpcoming || isToday) && canRsvp"
          class="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-6 bg-gray-900 text-white shadow-2xl border-t border-white/10 safe-area-bottom rounded-t-[2.5rem]">
          <div class="flex items-center justify-between gap-6">
            <div class="flex-1 min-w-0">
              <p class="text-xs font-black uppercase tracking-widest opacity-50">{{ eventStatus }}</p>
              <p class="font-bold truncate">{{ meetup.title }}</p>
            </div>

            <template v-if="!isAuthenticated">
              <Link href="/login" class="px-8 py-3 bg-verse-500 text-white font-black uppercase tracking-widest rounded-xl text-sm">
                Login
              </Link>
            </template>
            <template v-else>
              <button v-if="hasRsvp" @click="handleCancelRsvp" :disabled="isRsvpLoading" class="px-8 py-3 bg-red-500 text-white font-black uppercase tracking-widest rounded-xl text-sm">
                Cancel
              </button>
              <button v-else @click="handleRsvp" :disabled="isRsvpLoading" class="px-8 py-3 bg-verse-500 text-white font-black uppercase tracking-widest rounded-xl text-sm">
                RSVP
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
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}
</style>
