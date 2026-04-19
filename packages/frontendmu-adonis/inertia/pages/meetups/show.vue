<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { DateTime } from 'luxon'
import { Head, usePage, router } from '@inertiajs/vue3'
import { Link } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import SpeakerAvatar from '~/components/shared/SpeakerAvatar.vue'
import { sanitizeHtml } from '~/composables/use_sanitize'
import { useApi } from '~/composables/use_api'

interface Props {
  meetup: Data.Event.Variants['detail'] | null
  userRsvp: Data.Rsvp | null
  rsvpCount: number
  canEdit: boolean
  attendees: Data.PublicAttendee[]
}

const props = defineProps<Props>()

const page = usePage<Data.SharedProps>()
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
  return props.meetup.sessions
    .flatMap((s) => s.speakers)
    .filter((speaker) => {
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
    const { ok, data } = await apiFetch<{ message: string }>(
      `/api/events/${props.meetup.id}/rsvp`,
      {
        method: 'POST',
      }
    )

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
    const { ok, data } = await apiFetch<{ message: string }>(
      `/api/events/${props.meetup.id}/rsvp`,
      {
        method: 'DELETE',
      }
    )

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

const isUpcoming = computed(() => (eventDate.value ? eventDate.value > DateTime.now() : false))

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

const formattedDate = computed(() => eventDate.value?.toFormat('EEEE, MMMM d, yyyy') ?? '')

// Split the title into a "plain" lead and an italicized tail for editorial emphasis.
// Italicizes the last word — unless the title is a single word, in which case it's all italic.
const titleParts = computed(() => {
  const title = props.meetup?.title ?? ''
  const words = title.trim().split(/\s+/)
  if (words.length <= 1) return { plain: '', italic: title }
  return {
    plain: words.slice(0, -1).join(' '),
    italic: words[words.length - 1],
  }
})

// First sentence of the description, with HTML stripped — used as an editorial subtitle
// beneath the hero title.
const heroSubtitle = computed(() => {
  const raw = props.meetup?.description
  if (!raw) return null
  const text = raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return null
  const firstStop = text.search(/[.!?]\s/)
  const sentence = firstStop > 0 ? text.slice(0, firstStop + 1) : text
  return sentence.length > 220 ? sentence.slice(0, 200).trim() + '…' : sentence
})

const formattedDateShort = computed(() => eventDate.value?.toFormat('EEE, MMM d') ?? '')

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

// Lightbox
const lightboxIndex = ref<number | null>(null)
const photos = computed(() => props.meetup?.photos ?? [])
const activePhoto = computed(() =>
  lightboxIndex.value !== null ? photos.value[lightboxIndex.value] : null
)

function openLightbox(index: number) {
  lightboxIndex.value = index
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxIndex.value = null
  document.body.style.overflow = ''
}

function nextPhoto() {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value + 1) % photos.value.length
}

function prevPhoto() {
  if (lightboxIndex.value === null) return
  lightboxIndex.value =
    (lightboxIndex.value - 1 + photos.value.length) % photos.value.length
}

function handleLightboxKey(e: KeyboardEvent) {
  if (lightboxIndex.value === null) return
  if (e.key === 'Escape') closeLightbox()
  else if (e.key === 'ArrowRight') nextPhoto()
  else if (e.key === 'ArrowLeft') prevPhoto()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleLightboxKey)
  highlightChangedSection()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleLightboxKey)
  document.body.style.overflow = ''
})

// Highlight a section when arriving via ?changed=<section> from a notification link.
// Unknown values are ignored. Respects prefers-reduced-motion for the pulse animation.
const CHANGE_TARGETS = new Set(['schedule', 'location', 'rsvp', 'seats'])
const activeChange = ref<string | null>(null)

function highlightChangedSection() {
  const changed = new URLSearchParams(window.location.search).get('changed')
  if (!changed || !CHANGE_TARGETS.has(changed)) return

  activeChange.value = changed
  setTimeout(() => {
    if (activeChange.value === changed) activeChange.value = null
  }, 2000)

  requestAnimationFrame(() => {
    document
      .querySelector<HTMLElement>(`[data-change="${changed}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

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
  <main class="relative min-h-screen pt-36 md:pt-44 pb-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <template v-if="meetup">
        <!-- ===== HERO ZONE ===== -->
        <section id="rsvp-section" class="pb-16 border-b border-gray-200 dark:border-verse-900">
          <!-- Breadcrumb + Edit -->
          <div class="flex items-center justify-between flex-wrap gap-3 mb-7">
            <p class="mono-eyebrow">
              <Link href="/meetups">MEETUPS</Link>
              <span v-if="eventDate" class="sep">/</span>
              <span v-if="eventDate">{{ eventDate.toFormat('yyyy') }}</span>
              <span v-if="eventDate" class="sep">/</span>
              <span v-if="eventDate">{{ eventDate.toFormat('MMMM').toUpperCase() }}</span>
            </p>
            <Link
              v-if="canEdit"
              :href="`/admin/events/${meetup.id}/edit`"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border border-gray-200 dark:border-verse-800 text-gray-500 dark:text-gray-400 hover:border-verse-500 hover:text-verse-500 dark:hover:text-verse-400 transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
          </div>

          <!-- Status pill -->
          <div class="mb-8 flex items-center gap-3 flex-wrap">
            <span
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-widest border"
              :class="
                isToday
                  ? 'border-coral/30 bg-coral-soft text-coral-strong'
                  : isUpcoming
                    ? 'bg-verse-50 dark:bg-verse-900 border-verse-200 dark:border-verse-800 text-verse-600 dark:text-verse-400'
                    : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-verse-900 dark:border-verse-800 dark:text-gray-400'
              "
            >
              <span v-if="isToday" class="w-2 h-2 rounded-full bg-coral coral-pulse" />
              {{ statusLabel }}
            </span>
          </div>

          <!-- Title — editorial serif with italic tail -->
          <h1
            class="font-display text-[clamp(44px,6.5vw,84px)] leading-[0.98] text-gray-900 dark:text-gray-100 text-balance max-w-[16ch] mb-8"
          >
            <template v-if="titleParts.plain">{{ titleParts.plain }}&nbsp;</template><span class="font-display-italic text-verse-500 dark:text-verse-300">{{ titleParts.italic }}</span>
          </h1>

          <!-- Subtitle (first sentence of description, muted) -->
          <p
            v-if="heroSubtitle"
            class="text-[18px] leading-[1.55] text-gray-500 dark:text-gray-400 max-w-[56ch] mb-12"
          >
            {{ heroSubtitle }}
          </p>

          <!-- Meta row: icon-tiled Date / Time / Venue -->
          <div class="flex flex-wrap gap-x-10 gap-y-5 pt-4">
            <div v-if="eventDate" class="flex items-start gap-3">
              <div
                class="w-9 h-9 rounded-[10px] bg-verse-50 dark:bg-verse-900/60 text-verse-600 dark:text-verse-300 grid place-items-center shrink-0"
              >
                <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 10h18M8 3v4M16 3v4" />
                </svg>
              </div>
              <div>
                <div class="font-mono text-[10.5px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-0.5">Date</div>
                <div class="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{{ formattedDate }}</div>
              </div>
            </div>

            <div v-if="meetup.startTime" class="flex items-start gap-3">
              <div
                class="w-9 h-9 rounded-[10px] bg-verse-50 dark:bg-verse-900/60 text-verse-600 dark:text-verse-300 grid place-items-center shrink-0"
              >
                <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <div>
                <div class="font-mono text-[10.5px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-0.5">Time</div>
                <div class="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                  {{ meetup.startTime }}<template v-if="meetup.endTime"> – {{ meetup.endTime }}</template>
                </div>
              </div>
            </div>

            <div v-if="meetup.venue" class="flex items-start gap-3">
              <div
                class="w-9 h-9 rounded-[10px] bg-verse-50 dark:bg-verse-900/60 text-verse-600 dark:text-verse-300 grid place-items-center shrink-0"
              >
                <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <div class="font-mono text-[10.5px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-0.5">Venue</div>
                <div class="text-[15px] font-semibold text-gray-900 dark:text-gray-100">
                  {{ meetup.venue }}<template v-if="meetup.location"> · {{ meetup.location }}</template>
                </div>
              </div>
            </div>
          </div>

          <!-- Cover image (optional) -->
          <div v-if="meetup.coverImageUrl" class="rounded-[var(--r-lg,16px)] overflow-hidden mt-10">
            <img
              :src="meetup.coverImageUrl"
              :alt="meetup.title"
              class="w-full h-auto object-cover max-h-[400px]"
            />
          </div>
        </section>

        <!-- ===== TWO-COLUMN GRID ===== -->
        <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-14 mt-12 items-start">
          <!-- Left Column: Content -->
          <div class="min-w-0">
            <!-- About -->
            <section v-if="meetup.description" class="pb-12 border-b border-gray-200 dark:border-verse-900">
              <span class="section-label">About this meetup</span>
              <h2 class="font-display text-[clamp(28px,3.8vw,36px)] leading-[1.05] text-gray-900 dark:text-gray-100 mt-3">
                What to expect when you <span class="font-display-italic text-verse-500 dark:text-verse-300">join us</span>
              </h2>
              <div
                class="prose prose-lg dark:prose-invert max-w-[68ch] mt-5 leading-[1.7] text-gray-700 dark:text-gray-400"
                v-html="sanitizeHtml(meetup.description)"
              />
            </section>

            <!-- Agenda (timeline) -->
            <section v-if="meetup.sessions.length" class="py-12 border-b border-gray-200 dark:border-verse-900">
              <span class="section-label">Agenda</span>
              <h2 class="font-display text-[clamp(28px,3.8vw,36px)] leading-[1.05] text-gray-900 dark:text-gray-100 mt-3">
                {{ meetup.sessions.length }} session<template v-if="meetup.sessions.length !== 1">s</template>,
                <span class="font-display-italic text-verse-500 dark:text-verse-300">one day</span>
              </h2>

              <div class="mt-8">
                <article
                  v-for="(session, index) in meetup.sessions"
                  :key="session.id"
                  class="agenda-session grid grid-cols-[90px_1fr] md:grid-cols-[110px_1fr] gap-6 md:gap-7 py-6 border-b border-dashed border-gray-200 dark:border-verse-900 last:border-b-0 relative"
                >
                  <div class="font-mono text-[13px] font-semibold text-verse-600 dark:text-verse-300 relative pt-1">
                    <span>{{ session.startTime || '—' }}</span>
                    <!-- timeline dot -->
                    <span
                      class="hidden md:block absolute right-[-20px] top-[8px] w-[9px] h-[9px] rounded-full bg-white dark:bg-verse-950 border-2 border-verse-600 dark:border-verse-300"
                    />
                  </div>
                  <div class="md:pl-5 border-l border-gray-200 dark:border-verse-900">
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                      <span v-if="session.kind" class="font-mono text-[10.5px] uppercase tracking-[0.05em] font-medium px-1.5 py-0.5 rounded bg-verse-50 dark:bg-verse-900 text-verse-600 dark:text-verse-300">
                        {{ session.kind }}
                      </span>
                      <span v-if="session.duration" class="font-mono text-[11.5px] text-gray-400 dark:text-gray-500">
                        {{ session.duration }}
                      </span>
                    </div>
                    <h3 class="font-display text-[20px] md:text-[22px] leading-tight text-gray-900 dark:text-gray-100">
                      {{ session.title }}
                    </h3>
                    <div v-if="session.speakers?.length" class="mt-3 flex flex-wrap gap-4">
                      <Link
                        v-for="speaker in session.speakers"
                        :key="speaker.id"
                        :href="`/speaker/${speaker.id}`"
                        class="flex items-center gap-2.5 group/speaker"
                      >
                        <SpeakerAvatar
                          size="sm"
                          :name="speaker.name"
                          :github-username="speaker.githubUsername"
                          class="ring-2 ring-gray-100 dark:ring-verse-900 group-hover/speaker:ring-verse-500 transition-all"
                        />
                        <div class="leading-tight">
                          <p class="text-sm font-semibold text-gray-900 dark:text-gray-200 group-hover/speaker:text-verse-500 transition-colors">
                            {{ speaker.name }}
                          </p>
                          <p v-if="speaker.githubUsername" class="text-[11px] text-gray-400 mt-0.5 font-mono">
                            @{{ speaker.githubUsername }}
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <!-- Speakers (dedicated card grid when we have them) -->
            <section v-if="allSpeakers.length" class="py-12 border-b border-gray-200 dark:border-verse-900">
              <span class="section-label">Speakers</span>
              <h2 class="font-display text-[clamp(28px,3.8vw,36px)] leading-[1.05] text-gray-900 dark:text-gray-100 mt-3">
                {{ allSpeakers.length }}
                builder<template v-if="allSpeakers.length !== 1">s</template>,
                <span class="font-display-italic text-verse-500 dark:text-verse-300">one lineup</span>
              </h2>
              <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  v-for="sp in allSpeakers"
                  :key="sp.id"
                  :href="`/speaker/${sp.id}`"
                  class="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-verse-900 hover:border-verse-300 dark:hover:border-verse-700 bg-white dark:bg-verse-950 transition-colors"
                >
                  <SpeakerAvatar
                    size="md"
                    :name="sp.name"
                    :github-username="sp.githubUsername"
                    :avatar-url="sp.avatarUrl"
                    class="shrink-0"
                  />
                  <div class="min-w-0">
                    <p class="font-display text-[18px] text-gray-900 dark:text-gray-100 leading-tight">
                      {{ sp.name }}
                    </p>
                    <p v-if="sp.githubUsername" class="font-mono text-[11px] uppercase tracking-[0.08em] text-verse-600 dark:text-verse-400 mt-1.5">
                      @{{ sp.githubUsername }}
                    </p>
                  </div>
                </Link>
              </div>
            </section>

            <!-- Attendees -->
            <section v-if="attendees.length > 0" class="py-12 border-b border-gray-200 dark:border-verse-900">
              <span class="section-label">Who's coming</span>
              <h2 class="font-display text-[clamp(28px,3.8vw,36px)] leading-[1.05] text-gray-900 dark:text-gray-100 mt-3">
                <span class="font-display-italic text-verse-500 dark:text-verse-300">{{ rsvpCount }} builder<template v-if="rsvpCount !== 1">s</template></span>
                <template v-if="isPast"> showed up</template>
                <template v-else> already in</template>
              </h2>
              <div class="mt-6 flex items-center gap-4 flex-wrap">
                <div class="flex -space-x-2.5">
                  <template v-for="attendee in attendees.slice(0, 8)" :key="attendee.id">
                    <SpeakerAvatar
                      size="md"
                      :name="attendee.name"
                      :github-username="attendee.githubUsername"
                      :avatar-url="attendee.avatarUrl"
                      class="border-2 border-white dark:border-verse-950"
                    />
                  </template>
                  <div
                    v-if="attendees.length > 8"
                    class="w-10 h-10 rounded-full bg-gray-100 dark:bg-verse-900 border-2 border-white dark:border-verse-950 flex items-center justify-center text-[11px] font-bold text-gray-600 dark:text-gray-300"
                  >
                    +{{ attendees.length - 8 }}
                  </div>
                </div>
                <p class="font-mono text-[13px] text-gray-500 dark:text-gray-400">
                  <strong class="text-gray-900 dark:text-gray-100 font-bold">{{ rsvpCount }} attending</strong>
                  <template v-if="spotsRemaining !== null && !isPast"> · {{ spotsRemaining }} spots left</template>
                </p>
              </div>
            </section>

            <!-- Photo Gallery (past only) -->
            <section v-if="meetup.photos.length" class="py-12 border-b border-gray-200 dark:border-verse-900">
              <div class="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <span class="section-label">Event Recap</span>
                  <h2 class="font-display text-[clamp(28px,3.8vw,36px)] leading-[1.05] text-gray-900 dark:text-gray-100 mt-3">
                    A look <span class="font-display-italic text-verse-500 dark:text-verse-300">back</span>
                  </h2>
                </div>
                <span class="font-mono text-[11px] uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">
                  {{ meetup.photos.length }} photos · tap to expand
                </span>
              </div>
              <div class="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <button
                  v-for="(photo, index) in meetup.photos"
                  :key="photo.id"
                  type="button"
                  class="relative rounded-md overflow-hidden aspect-square group focus:outline-none focus:ring-2 focus:ring-verse-500"
                  @click="openLightbox(index)"
                >
                  <img
                    :src="photo.thumbnailUrl"
                    :alt="photo.caption || 'Event photo'"
                    loading="lazy"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </button>
              </div>
            </section>

            <!-- Sponsors -->
            <section v-if="meetup.sponsors.length" class="py-12 border-b border-gray-200 dark:border-verse-900">
              <span class="section-label">Sponsors</span>
              <h2 class="font-display text-[clamp(28px,3.8vw,36px)] leading-[1.05] text-gray-900 dark:text-gray-100 mt-3">
                Made possible by <span class="font-display-italic text-verse-500 dark:text-verse-300">local support</span>
              </h2>
              <div
                class="mt-6 flex flex-wrap gap-x-10 gap-y-4 items-center px-7 py-6 rounded-xl border border-dashed border-gray-300 dark:border-verse-800 bg-white dark:bg-verse-950"
              >
                <Link
                  v-for="sponsor in meetup.sponsors"
                  :key="sponsor.id"
                  :href="`/sponsor/${sponsor.id}`"
                  class="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <img
                    v-if="sponsor.logoUrl"
                    :src="sponsor.logoUrl"
                    :alt="sponsor.name"
                    class="h-9 w-auto object-contain"
                  />
                  <span v-else class="font-display text-[17px]">{{ sponsor.name }}</span>
                </Link>
              </div>
            </section>

            <!-- Share bar -->
            <div
              class="flex items-center gap-3 flex-wrap py-6 border-b border-gray-200 dark:border-verse-900"
            >
              <span class="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                Share this meetup
              </span>
              <button
                type="button"
                class="share-btn w-9 h-9 rounded-full border border-gray-200 dark:border-verse-800 grid place-items-center text-gray-500 dark:text-gray-400 hover:border-verse-400 hover:text-verse-500 transition-colors"
                aria-label="Share via Twitter"
                @click="shareEvent"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h3l-7 8 8 12h-6l-5-7-6 7H2l7-9L2 2h6l4 6 6-6z" /></svg>
              </button>
              <button
                type="button"
                class="share-btn w-9 h-9 rounded-full border border-gray-200 dark:border-verse-800 grid place-items-center text-gray-500 dark:text-gray-400 hover:border-verse-400 hover:text-verse-500 transition-colors"
                aria-label="Share via LinkedIn"
                @click="shareEvent"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v4H4zM4 10h4v10H4zM10 10h4v1.5c.8-1.1 2.2-2 4-2 3 0 4 2 4 5V20h-4v-5c0-1.5-.5-2.5-2-2.5s-2 1-2 2.5V20h-4V10z" /></svg>
              </button>
              <button
                type="button"
                class="share-btn w-9 h-9 rounded-full border border-gray-200 dark:border-verse-800 grid place-items-center text-gray-500 dark:text-gray-400 hover:border-verse-400 hover:text-verse-500 transition-colors"
                aria-label="Copy link"
                @click="shareEvent"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1 1" />
                  <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1-1" />
                </svg>
              </button>
              <span class="ml-auto font-mono text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-[260px]">
                coders.mu/meetup/{{ meetup.slug || meetup.id }}
              </span>
            </div>

            <!-- Code of Conduct callout -->
            <div
              class="mt-8 flex items-start gap-4 p-5 rounded-xl border bg-[oklch(95%_0.03_155)] border-[color-mix(in_oklch,oklch(72%_0.10_155)_25%,transparent)] dark:bg-verse-900/40 dark:border-verse-800"
            >
              <div class="w-9 h-9 rounded-[10px] bg-white dark:bg-verse-950 grid place-items-center text-[oklch(45%_0.1_155)] shrink-0">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2 3 6v6c0 5 4 9 9 10 5-1 9-5 9-10V6l-9-4Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <h4 class="font-display text-[17px] text-[oklch(28%_0.08_155)] dark:text-gray-100 mb-0.5">
                  A welcoming space for everyone
                </h4>
                <p class="text-[13.5px] leading-[1.55] text-[oklch(32%_0.05_155)] dark:text-gray-400">
                  Coders.mu meetups follow a simple code of conduct: be kind, be curious, no harassment.
                  First time attending? Come say hi — we'll introduce you around.
                  <Link href="/code-of-conduct" class="underline underline-offset-[3px] font-semibold text-[oklch(38%_0.12_155)] dark:text-verse-300">
                    Read the full code of conduct →
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <!-- Right Column: Sticky RSVP Card -->
          <aside class="lg:row-start-1 lg:col-start-2">
            <div class="sticky top-24">
              <div
                class="bg-white dark:bg-verse-950 border border-gray-200 dark:border-verse-900 rounded-2xl overflow-hidden shadow-[0_4px_16px_-4px_rgba(13,20,51,0.08),0_2px_6px_-2px_rgba(13,20,51,0.05)]"
              >
                <!-- Header -->
                <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-verse-900">
                  <div class="font-display text-[18px] text-gray-900 dark:text-gray-100">
                    <template v-if="isToday">Happening now</template>
                    <template v-else-if="isUpcoming">Reserve your spot</template>
                    <template v-else>Event details</template>
                  </div>
                  <span
                    v-if="isToday"
                    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-coral-strong bg-coral-soft border border-coral/30"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-coral coral-pulse" />
                    Live
                  </span>
                </div>

                <!-- Body -->
                <div class="px-6 pt-5 pb-2">
                  <div
                    data-change="schedule"
                    :data-changed-active="activeChange === 'schedule' ? '' : null"
                    class="space-y-0"
                  >
                    <div class="flex items-baseline justify-between py-2.5">
                      <span class="font-mono text-[11px] uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">Date</span>
                      <span class="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{{ eventDate?.toFormat('dd MMM yyyy') || 'TBA' }}</span>
                    </div>
                    <div class="flex items-baseline justify-between py-2.5 border-t border-dashed border-gray-200 dark:border-verse-800">
                      <span class="font-mono text-[11px] uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">Time</span>
                      <span class="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{{ meetup.startTime || 'TBA' }}</span>
                    </div>
                    <div class="flex items-baseline justify-between py-2.5 border-t border-dashed border-gray-200 dark:border-verse-800">
                      <span class="font-mono text-[11px] uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">Price</span>
                      <span class="text-[15px] font-semibold text-[oklch(45%_0.1_155)] dark:text-emerald-400">Free</span>
                    </div>
                  </div>

                  <!-- Capacity -->
                  <div
                    v-if="meetup.seatsAvailable"
                    data-change="seats"
                    :data-changed-active="activeChange === 'seats' ? '' : null"
                    class="mt-4"
                  >
                    <div class="flex items-baseline justify-between">
                      <span class="font-mono text-[11px] uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">Capacity</span>
                      <span class="text-[14px] font-semibold">
                        <span :class="capacityPercent >= 80 ? 'text-coral-strong' : 'text-gray-900 dark:text-gray-100'">{{ rsvpCount }}</span>
                        <span class="text-gray-400 dark:text-gray-500"> / {{ meetup.seatsAvailable }}</span>
                      </span>
                    </div>
                    <div class="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-verse-900 overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-500"
                        :class="
                          capacityPercent >= 80
                            ? 'bg-gradient-to-r from-coral-strong to-amber-400'
                            : 'bg-gradient-to-r from-verse-500 to-verse-400'
                        "
                        :style="{ width: `${capacityPercent}%` }"
                      />
                    </div>
                    <p v-if="spotsRemaining !== null && spotsRemaining <= 10 && spotsRemaining > 0" class="mt-1.5 font-mono text-[11.5px] text-coral-strong">
                      Only {{ spotsRemaining }} spot<template v-if="spotsRemaining !== 1">s</template> left
                    </p>
                  </div>

                  <!-- Venue block -->
                  <div
                    v-if="meetup.venue"
                    data-change="location"
                    :data-changed-active="activeChange === 'location' ? '' : null"
                    class="mt-5"
                  >
                    <span class="font-mono text-[10.5px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Venue</span>
                    <div class="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mt-1.5 leading-snug">{{ meetup.venue }}</div>
                    <div v-if="meetup.location" class="text-[13.5px] text-gray-500 dark:text-gray-400 leading-snug">{{ meetup.location }}</div>
                    <div v-if="meetup.mapUrl || meetup.parkingLocation" class="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                      <a
                        v-if="meetup.mapUrl"
                        :href="meetup.mapUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-1.5 font-mono text-[11.5px] font-semibold text-verse-600 dark:text-verse-400 hover:text-verse-700"
                      >
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        Directions
                      </a>
                      <span v-if="meetup.parkingLocation" class="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-gray-400 dark:text-gray-500">
                        Parking: {{ meetup.parkingLocation }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Footer CTA -->
                <div
                  data-change="rsvp"
                  :data-changed-active="activeChange === 'rsvp' ? '' : null"
                  class="px-6 py-5 border-t border-gray-100 dark:border-verse-900 flex gap-2.5"
                >
                  <template v-if="isUpcoming || isToday || (featureFlags.rsvpPastEvents && isPast && meetup.acceptingRsvp)">
                    <template v-if="!isAuthenticated && canRsvp">
                      <Link
                        href="/login"
                        class="flex-1 py-3 text-center text-sm font-semibold bg-verse-600 text-white rounded-lg hover:bg-verse-700 transition-colors"
                      >
                        Login to RSVP
                      </Link>
                    </template>
                    <template v-else-if="isAuthenticated && canRsvp">
                      <button
                        v-if="hasRsvp"
                        :disabled="isRsvpLoading"
                        class="flex-1 py-3 text-sm font-semibold border border-gray-200 dark:border-verse-800 bg-[oklch(95%_0.03_155)] text-[oklch(38%_0.08_155)] rounded-lg transition-colors disabled:opacity-50"
                        @click="handleCancelRsvp"
                      >
                        <span v-if="isRsvpLoading">Cancelling…</span>
                        <span v-else>✓ You're in — tap to cancel</span>
                      </button>
                      <button
                        v-else
                        :disabled="isRsvpLoading"
                        class="flex-1 py-3 text-sm font-semibold bg-verse-600 text-white rounded-lg hover:bg-verse-700 transition-colors disabled:opacity-50"
                        @click="handleRsvp"
                      >
                        {{ isRsvpLoading ? 'Submitting…' : isFull ? 'Join waitlist' : 'RSVP — claim your spot' }}
                      </button>
                    </template>
                    <div
                      v-else
                      class="flex-1 py-3 text-center rounded-lg border border-gray-200 dark:border-verse-800 text-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      RSVPs Closed
                    </div>
                  </template>
                  <a
                    v-else-if="calendarUrl"
                    :href="calendarUrl"
                    target="_blank"
                    class="flex-1 py-3 text-center text-sm font-semibold border border-gray-200 dark:border-verse-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-verse-900 transition-colors"
                  >
                    Add to Calendar
                  </a>
                  <button
                    type="button"
                    class="w-11 h-11 rounded-lg border border-gray-200 dark:border-verse-800 grid place-items-center text-gray-500 dark:text-gray-400 hover:text-verse-500 transition-colors"
                    aria-label="Share"
                    @click="shareEvent"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                      <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
                    </svg>
                  </button>
                </div>

                <p v-if="rsvpError" class="px-6 pb-5 text-[13px] text-red-500 font-medium">{{ rsvpError }}</p>
                <p v-if="rsvpSuccess" class="px-6 pb-5 text-[13px] text-emerald-600 dark:text-emerald-400 font-medium">{{ rsvpSuccess }}</p>
              </div>
            </div>
          </aside>
        </div>
      </template>

      <!-- Not Found -->
      <template v-else>
        <div class="text-center py-32 space-y-8">
          <div
            class="w-24 h-24 bg-gray-50 dark:bg-verse-900 rounded-lg flex items-center justify-center mx-auto"
          >
            <svg
              class="w-12 h-12 text-verse-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.172 9.172a4 4 0 0112.728 0M5.657 5.657a8 8 0 0116.97 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 class="text-4xl font-display tracking-tight dark:text-white">Meetup not found.</h2>
          <Link
            href="/meetups"
            class="inline-flex items-center gap-3 px-6 py-2.5 bg-verse-600 text-white rounded-md font-medium text-sm hover:bg-verse-700 transition-colors"
          >
            Return to Archives
          </Link>
        </div>
      </template>
    </div>
  </main>

  <!-- Mobile RSVP Bar -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-transform duration-500 cubic-bezier(0.87, 0, 0.13, 1)"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition-transform duration-300 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="showMobileRsvp && meetup && canRsvp"
        class="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-5 bg-gray-900 text-white border-t border-gray-700 safe-area-bottom"
      >
        <div class="flex items-center justify-between gap-6">
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-medium text-gray-400">{{ eventStatus }}</p>
            <p class="font-bold truncate">{{ meetup.title }}</p>
          </div>

          <template v-if="!isAuthenticated">
            <Link
              href="/login"
              class="px-6 py-2.5 bg-verse-600 text-white font-medium rounded-md text-sm"
            >
              Login
            </Link>
          </template>
          <template v-else>
            <button
              v-if="hasRsvp"
              @click="handleCancelRsvp"
              :disabled="isRsvpLoading"
              class="px-6 py-2.5 bg-red-600 text-white font-medium rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              v-else
              @click="handleRsvp"
              :disabled="isRsvpLoading"
              class="px-6 py-2.5 bg-verse-600 text-white font-medium rounded-md text-sm"
            >
              RSVP
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Photo Lightbox -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="activePhoto && meetup"
        class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label="Photo viewer"
        @click.self="closeLightbox"
      >
        <button
          type="button"
          class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close"
          @click="closeLightbox"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button
          v-if="meetup.photos.length > 1"
          type="button"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white rounded-full bg-black/40 hover:bg-black/60 transition-colors"
          aria-label="Previous photo"
          @click="prevPhoto"
        >
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          v-if="meetup.photos.length > 1"
          type="button"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white rounded-full bg-black/40 hover:bg-black/60 transition-colors"
          aria-label="Next photo"
          @click="nextPhoto"
        >
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <img
          :key="activePhoto.id"
          :src="activePhoto.photoUrl"
          :alt="activePhoto.caption || 'Event photo'"
          class="max-w-[95vw] max-h-[90vh] object-contain select-none"
        />

        <div
          class="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium tabular-nums"
        >
          {{ (lightboxIndex ?? 0) + 1 }} / {{ meetup.photos.length }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}

[data-changed-active] {
  animation: change-highlight 2s ease-out 1;
  border-radius: 0.5rem;
}

@keyframes change-highlight {
  0%, 20% {
    box-shadow: 0 0 0 3px var(--color-verse-400, #a78bfa);
  }
  100% {
    box-shadow: 0 0 0 3px transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-changed-active] {
    animation: none;
  }
}
</style>
