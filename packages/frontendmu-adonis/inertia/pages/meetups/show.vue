<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { DateTime } from 'luxon'
import { Head, Link, usePage, router } from '@inertiajs/vue3'
import SpeakerAvatar from '~/components/shared/SpeakerAvatar.vue'
import { sanitizeHtml } from '~/composables/useSanitize'
import { useApi } from '~/composables/useApi'
import type { EventDto, RsvpDto, PublicAttendeeDto, SharedProps } from '~/types'

interface Props {
  meetup: EventDto | null
  userRsvp: RsvpDto | null
  rsvpCount: number
  canEdit: boolean
  attendees: PublicAttendeeDto[]
}

const props = defineProps<Props>()

const page = usePage<SharedProps>()
const { apiFetch } = useApi()
const isAuthenticated = computed(() => page.props.auth?.isAuthenticated)
const featureFlags = computed(() => page.props.featureFlags)

// RSVP state
const isRsvpLoading = ref(false)
const rsvpError = ref<string | null>(null)
const rsvpSuccess = ref<string | null>(null)
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
    const closingDate = DateTime.fromISO(props.meetup.rsvpClosingDate)
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

// All speakers deduplicated across sessions
const allSpeakers = computed(() => {
  if (!props.meetup?.sessions) return []
  const seen = new Set<string>()
  return props.meetup.sessions.flatMap((s) => s.speakers).filter((speaker) => {
    if (!speaker || seen.has(speaker.id)) return false
    seen.add(speaker.id)
    return true
  })
})

// RSVP handlers
async function handleRsvp() {
  if (!props.meetup) return

  isRsvpLoading.value = true
  rsvpError.value = null
  rsvpSuccess.value = null

  try {
    const { ok, data } = await apiFetch<{ message: string }>(`/api/events/${props.meetup.id}/rsvp`, {
      method: 'POST',
    })

    if (ok) {
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
    const { ok, data } = await apiFetch<{ message: string }>(`/api/events/${props.meetup.id}/rsvp`, {
      method: 'DELETE',
    })

    if (ok) {
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

// Share event via Web Share API
async function shareEvent() {
  if (!props.meetup) return
  const shareData = {
    title: props.meetup.title,
    text: `Check out ${props.meetup.title} by front-end.mu`,
    url: window.location.href,
  }
  if (navigator.share) {
    await navigator.share(shareData)
  } else {
    await navigator.clipboard.writeText(window.location.href)
    rsvpSuccess.value = 'Link copied to clipboard'
    setTimeout(() => (rsvpSuccess.value = null), 2000)
  }
}

const eventDate = computed(() => {
  if (!props.meetup?.date) return null
  return DateTime.fromISO(props.meetup.date)
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

const eventStatus = computed(() => {
  if (isToday.value) return 'Live'
  if (isUpcoming.value) return 'Scheduled'
  return 'Past Record'
})

const statusLabel = computed(() => {
  if (isToday.value) return 'Happening Today'
  if (isUpcoming.value && daysUntil.value !== null) {
    return daysUntil.value === 1 ? 'In 1 day' : `In ${daysUntil.value} days`
  }
  return 'Past Event'
})

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
  <main class="relative min-h-screen pt-32 pb-32">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <template v-if="meetup">
        <!-- ===== HERO ZONE ===== -->
        <section id="rsvp-section" class="pb-12">
          <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
            <!-- Left: Main hero content -->
            <div class="flex-1 space-y-8 min-w-0">
              <!-- Status Badge -->
              <div class="flex items-center gap-3">
                <span
                  class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.15em] border"
                  :class="isToday
                    ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                    : isUpcoming
                      ? 'bg-verse-500/10 border-verse-500/20 text-verse-600 dark:text-verse-400'
                      : 'bg-gray-100 border-gray-200 text-gray-500 dark:bg-verse-900/40 dark:border-verse-800 dark:text-gray-400'"
                >
                  <span v-if="isToday" class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                  </span>
                  {{ statusLabel }}
                </span>
                <Link v-if="canEdit" :href="`/admin/events/${meetup.id}/edit`"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 dark:border-verse-800 text-gray-500 dark:text-gray-400 hover:border-verse-500 hover:text-verse-500 dark:hover:text-verse-400 transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </Link>
              </div>

              <!-- Title -->
              <h1 class="text-3xl md:text-5xl font-black tracking-tight dark:text-gray-100 leading-tight">
                {{ meetup.title }}
              </h1>

              <!-- Meta Row: Date + Time + Venue -->
              <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-gray-500 dark:text-gray-400 font-medium text-sm">
                <div v-if="eventDate" class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-verse-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {{ formattedDate }}
                </div>
                <div v-if="meetup.startTime" class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-verse-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {{ meetup.startTime }}{{ meetup.endTime ? ` – ${meetup.endTime}` : '' }}
                </div>
                <div v-if="meetup.venue" class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-verse-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {{ meetup.venue }}
                </div>
              </div>

              <!-- CTA + Spots Remaining -->
              <div v-if="(isUpcoming || isToday) && canRsvp" class="flex flex-wrap items-center gap-4">
                <template v-if="!isAuthenticated">
                  <Link href="/login"
                    class="px-8 py-3 text-sm font-bold bg-verse-600 text-white rounded-xl hover:bg-verse-700 transition-all shadow-lg shadow-verse-600/20">
                    Login to RSVP
                  </Link>
                </template>
                <template v-else>
                  <button v-if="hasRsvp" @click="handleCancelRsvp" :disabled="isRsvpLoading"
                    class="px-8 py-3 text-sm font-bold border-2 border-red-500/50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
                    {{ isRsvpLoading ? 'Cancelling...' : 'Cancel RSVP' }}
                  </button>
                  <button v-else @click="handleRsvp" :disabled="isRsvpLoading"
                    class="px-8 py-3 text-sm font-bold bg-verse-600 text-white rounded-xl hover:bg-verse-700 transition-all disabled:opacity-50 shadow-lg shadow-verse-600/20">
                    {{ isRsvpLoading ? 'Submitting...' : (isFull ? 'Join Waitlist' : 'RSVP Now') }}
                  </button>
                </template>
                <span v-if="spotsRemaining !== null" class="text-sm font-semibold" :class="spotsRemaining <= 5 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'">
                  {{ spotsRemaining === 0 ? 'No spots left' : `${spotsRemaining} spot${spotsRemaining !== 1 ? 's' : ''} remaining` }}
                </span>
              </div>

              <!-- RSVP feedback -->
              <p v-if="rsvpError" class="text-sm text-red-500 font-medium">{{ rsvpError }}</p>
              <p v-if="rsvpSuccess" class="text-sm text-green-600 dark:text-green-400 font-medium">{{ rsvpSuccess }}</p>

              <!-- Speaker Preview Strip -->
              <div v-if="allSpeakers.length" class="flex items-center gap-4 pt-2">
                <div class="flex -space-x-3">
                  <template v-for="speaker in allSpeakers.slice(0, 5)" :key="speaker.id">
                    <Link :href="`/speaker/${speaker.id}`" class="relative hover:z-10 transition-transform hover:scale-110">
                      <SpeakerAvatar
                        size="sm"
                        :name="speaker.name"
                        :github-username="speaker.githubUsername"
                        :avatar-url="speaker.avatarUrl"
                        class="border-2 border-white dark:border-verse-950 ring-1 ring-verse-500/20"
                      />
                    </Link>
                  </template>
                  <div v-if="allSpeakers.length > 5" class="w-8 h-8 rounded-full bg-verse-100 dark:bg-verse-900 border-2 border-white dark:border-verse-950 flex items-center justify-center text-[10px] font-bold text-verse-600 dark:text-verse-400 ring-1 ring-verse-500/20">
                    +{{ allSpeakers.length - 5 }}
                  </div>
                </div>
                <p class="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  {{ allSpeakers.length }} speaker{{ allSpeakers.length !== 1 ? 's' : '' }}
                </p>
              </div>
            </div>

            <!-- Right: Sponsors -->
            <div v-if="meetup.sponsors.length" class="lg:w-64 shrink-0 space-y-4 lg:pt-[9.5rem]">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Sponsored by</p>
              <div class="flex flex-wrap lg:flex-col gap-3">
                <Link
                  v-for="sponsor in meetup.sponsors"
                  :key="sponsor.id"
                  :href="`/sponsor/${sponsor.id}`"
                  class="flex items-center justify-center px-4 py-3 rounded-xl border hover:border-verse-500/50 transition-colors group/sponsor"
                  :class="sponsor.logoBg
                    ? 'border-verse-800'
                    : 'border-gray-100 dark:border-verse-800 bg-white dark:bg-white'"
                  :style="sponsor.logoBg ? { backgroundColor: sponsor.logoBg } : {}"
                >
                  <img v-if="sponsor.logoUrl" :src="sponsor.logoUrl" :alt="sponsor.name" class="h-14 w-auto object-contain" />
                  <span v-else class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ sponsor.name }}</span>
                </Link>
              </div>
            </div>
          </div>

          <!-- Cover Image -->
          <div v-if="meetup.coverImageUrl" class="rounded-2xl overflow-hidden mt-8">
            <img :src="meetup.coverImageUrl" :alt="meetup.title" class="w-full h-auto object-cover max-h-[400px]" />
          </div>
        </section>

        <!-- Separator -->
        <div class="border-t border-gray-100 dark:border-verse-800 mb-12"></div>

        <!-- ===== TWO-COLUMN GRID ===== -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <!-- Left Column: Content -->
          <div class="lg:col-span-7 space-y-14">
            <!-- Description -->
            <section v-if="meetup.description" class="space-y-5">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-verse-500 dark:text-verse-400">About</span>
                <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
              </div>
              <div
                class="prose prose-lg dark:prose-invert max-w-none font-medium leading-relaxed text-gray-600 dark:text-gray-400"
                v-html="sanitizeHtml(meetup.description)" />
            </section>

            <!-- Sessions/Agenda -->
            <section v-if="meetup.sessions.length" class="space-y-8">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-verse-500 dark:text-verse-400">Agenda</span>
                <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
              </div>

              <div class="space-y-10">
                <article v-for="(session, index) in meetup.sessions" :key="session.id"
                  class="relative group">
                  <div class="flex gap-6">
                    <!-- Numbering -->
                    <div class="relative shrink-0 flex flex-col items-center">
                      <div class="w-9 h-9 rounded-xl bg-gray-50 dark:bg-verse-900 border border-gray-100 dark:border-verse-800 flex items-center justify-center text-sm font-black text-gray-500 dark:text-verse-400">
                        {{ (index + 1).toString().padStart(2, '0') }}
                      </div>
                      <div v-if="index !== meetup.sessions.length - 1" class="absolute top-9 bottom-[-2.5rem] w-px bg-gray-100 dark:bg-verse-900"></div>
                    </div>

                    <div class="flex-1 space-y-4">
                      <h3 class="text-xl md:text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
                        {{ session.title }}
                      </h3>

                      <div v-if="session.speakers?.length" class="flex flex-wrap gap-4">
                        <Link v-for="speaker in session.speakers" :key="speaker.id" :href="`/speaker/${speaker.id}`"
                          class="flex items-center gap-2.5 group/speaker transition-all">
                          <SpeakerAvatar
                            size="sm"
                            :name="speaker.name"
                            :github-username="speaker.githubUsername"
                            class="ring-2 ring-gray-100 dark:ring-verse-900 group-hover/speaker:ring-verse-500 transition-all"
                          />
                          <div class="leading-tight">
                            <p class="text-sm font-bold text-gray-900 dark:text-gray-200 group-hover/speaker:text-verse-500 transition-colors">
                              {{ speaker.name }}
                            </p>
                            <p v-if="speaker.githubUsername" class="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-0.5">
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

            <!-- Photo Gallery -->
            <section v-if="meetup.photos.length" class="space-y-5">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-verse-500 dark:text-verse-400">Gallery</span>
                <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div v-for="photo in meetup.photos.slice(0, 6)" :key="photo.id" class="relative rounded-xl overflow-hidden aspect-[4/3] group/photo">
                  <img :src="photo.photoUrl" :alt="photo.caption || 'Event photo'" class="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-105" />
                </div>
              </div>
              <a v-if="meetup.album" :href="meetup.album" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-sm font-bold text-verse-500 hover:text-verse-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                View full album
              </a>
            </section>
          </div>

          <!-- Right Column: Sidebar -->
          <aside class="lg:col-span-5">
            <div class="sticky top-24 space-y-8">
              <!-- Event Details Card -->
              <div class="bg-white dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-2xl squircle overflow-hidden shadow-sm">
                <div class="px-6 py-4 bg-gray-50 dark:bg-verse-900/60 border-b border-gray-100 dark:border-verse-800">
                  <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Event Details</h3>
                </div>
                <div class="p-6 space-y-5">
                  <div class="space-y-4">
                    <div class="flex items-baseline justify-between">
                      <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Date</p>
                      <p class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ eventDate?.toFormat('dd MMM yyyy') }}</p>
                    </div>
                    <div class="flex items-baseline justify-between">
                      <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Time</p>
                      <p class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ meetup.startTime || 'TBA' }}</p>
                    </div>
                    <div class="flex items-baseline justify-between">
                      <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Capacity</p>
                      <p class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ rsvpCount }} / {{ meetup.seatsAvailable || '∞' }}</p>
                    </div>
                    <!-- Capacity progress bar -->
                    <div v-if="meetup.seatsAvailable" class="space-y-1">
                      <div class="w-full h-1.5 rounded-full bg-gray-100 dark:bg-verse-800 overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-500"
                          :class="capacityPercent >= 90 ? 'bg-red-500' : capacityPercent >= 70 ? 'bg-amber-500' : 'bg-verse-500'"
                          :style="{ width: `${capacityPercent}%` }"
                        ></div>
                      </div>
                      <p class="text-[10px] text-gray-400 text-right">{{ capacityPercent }}% full</p>
                    </div>
                  </div>

                  <div v-if="meetup.venue" class="pt-4 border-t border-gray-100 dark:border-verse-800/50 space-y-1">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Venue</p>
                    <p class="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">{{ meetup.venue }}</p>
                    <p v-if="meetup.location" class="text-xs text-gray-400 font-medium">{{ meetup.location }}</p>
                    <div class="flex flex-wrap gap-2 pt-2">
                      <a v-if="meetup.mapUrl" :href="meetup.mapUrl" target="_blank" rel="noopener noreferrer"
                        class="inline-flex items-center gap-1.5 text-xs font-semibold text-verse-500 hover:text-verse-600 transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        View map
                      </a>
                      <span v-if="meetup.parkingLocation" class="inline-flex items-center gap-1.5 text-xs text-gray-400">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        {{ meetup.parkingLocation }}
                      </span>
                    </div>
                  </div>

                  <!-- Sidebar RSVP -->
                  <div class="pt-4 border-t border-gray-100 dark:border-verse-800/50 space-y-3">
                    <div v-if="isUpcoming || isToday || (featureFlags.rsvpPastEvents && isPast && meetup.acceptingRsvp)">
                      <template v-if="!isAuthenticated && canRsvp">
                        <Link href="/login"
                          class="block w-full py-3 text-center text-sm font-bold bg-verse-600 text-white rounded-xl hover:bg-verse-700 transition-all shadow-lg shadow-verse-600/20">
                          Login to RSVP
                        </Link>
                      </template>
                      <template v-else-if="isAuthenticated && canRsvp">
                        <button v-if="hasRsvp" @click="handleCancelRsvp" :disabled="isRsvpLoading"
                          class="w-full py-3 text-sm font-bold border-2 border-red-500/50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
                          {{ isRsvpLoading ? 'Cancelling...' : 'Cancel RSVP' }}
                        </button>
                        <button v-else @click="handleRsvp" :disabled="isRsvpLoading"
                          class="w-full py-3 text-sm font-bold bg-verse-600 text-white rounded-xl hover:bg-verse-700 transition-all disabled:opacity-50 shadow-lg shadow-verse-600/20">
                          {{ isRsvpLoading ? 'Submitting...' : (isFull ? 'Join Waitlist' : 'RSVP Now') }}
                        </button>
                      </template>
                      <div v-else class="text-center p-3 bg-gray-50 dark:bg-verse-950/40 rounded-xl text-xs font-bold text-gray-400 uppercase tracking-wide border border-gray-100 dark:border-verse-800">
                        RSVPs Closed
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <a v-if="calendarUrl" :href="calendarUrl" target="_blank"
                        class="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-100 dark:border-verse-800 rounded-xl text-xs font-bold text-gray-400 hover:text-verse-500 dark:hover:text-verse-400 transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Add to Calendar
                      </a>
                      <button @click="shareEvent" class="p-2.5 border border-gray-100 dark:border-verse-800 rounded-xl text-gray-400 hover:text-verse-500 transition-colors" aria-label="Share event">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </aside>
        </div>

        <!-- ===== ATTENDEES (full-width) ===== -->
        <section v-if="attendees.length > 0" class="mt-16 space-y-8">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-verse-500 dark:text-verse-400">Attendees</span>
            <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
            <span class="text-xs font-bold text-gray-400">{{ rsvpCount }} RSVP'd</span>
          </div>

          <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            <div
              v-for="attendee in attendees"
              :key="attendee.id"
              class="flex flex-col items-center gap-2 group"
            >
              <SpeakerAvatar
                size="md"
                :name="attendee.name"
                :github-username="attendee.githubUsername"
                :avatar-url="attendee.avatarUrl"
                class="grayscale group-hover:grayscale-0 transition-all group-hover:scale-110"
              />
              <p class="text-[10px] font-bold text-gray-500 dark:text-gray-400 text-center leading-tight truncate w-full group-hover:text-verse-500 transition-colors">
                {{ attendee.name }}
              </p>
            </div>
          </div>


        </section>
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
            <Link href="/login" class="px-8 py-3 bg-verse-500 text-white font-bold rounded-xl text-sm">
              Login
            </Link>
          </template>
          <template v-else>
            <button v-if="hasRsvp" @click="handleCancelRsvp" :disabled="isRsvpLoading" class="px-8 py-3 bg-red-500 text-white font-bold rounded-xl text-sm">
              Cancel
            </button>
            <button v-else @click="handleRsvp" :disabled="isRsvpLoading" class="px-8 py-3 bg-verse-500 text-white font-bold rounded-xl text-sm">
              RSVP
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}
</style>
