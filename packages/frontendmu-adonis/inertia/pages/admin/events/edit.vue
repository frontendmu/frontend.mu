<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { Head, useForm, usePage } from '@inertiajs/vue3'
import { Link } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import { DateTime } from 'luxon'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
import { useApi } from '~/composables/use_api'

interface Props {
  event: Data.Event.Variants['detail']
}

interface Speaker {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
  githubUsername: string | null
}

const props = defineProps<Props>()
const page = usePage<Data.SharedProps>()
const { apiFetch } = useApi()

// Flash messages
const successMessage = computed(() => page.props.flash?.success)

// Sessions state
const sessions = ref<Data.Session[]>(props.event.sessions || [])
const availableSpeakers = ref<Speaker[]>([])
const loadingSpeakers = ref(false)

// Dialog ref
const sessionDialog = ref<HTMLDialogElement | null>(null)
const isDialogOpen = ref(false)

// Lock body scroll when dialog is open
watch(isDialogOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
onUnmounted(() => {
  document.body.style.overflow = ''
})

// Session form state
type SessionKind = 'talk' | 'intro' | 'sponsored' | 'break' | 'photo' | 'quiz' | 'other'

const SESSION_KIND_OPTIONS: Array<{ value: SessionKind; label: string; hint: string }> = [
  { value: 'talk', label: 'Talk', hint: 'Speaker-led session' },
  { value: 'intro', label: 'Intro', hint: 'Welcome / MC segment' },
  { value: 'sponsored', label: 'Sponsored', hint: 'Sponsor spotlight' },
  { value: 'break', label: 'Break', hint: 'Lunch, coffee, etc.' },
  { value: 'photo', label: 'Group photo', hint: 'Everyone on stage' },
  { value: 'quiz', label: 'Quiz', hint: 'Hosted quiz segment' },
  { value: 'other', label: 'Other', hint: 'Custom segment' },
]

const KINDS_WITH_SPEAKERS: SessionKind[] = ['talk', 'intro', 'quiz', 'other']
const KINDS_WITH_SPONSOR: SessionKind[] = ['sponsored']

const editingSession = ref<Data.Session | null>(null)
const sessionForm = ref({
  title: '',
  description: '',
  kind: 'talk' as SessionKind,
  sponsorId: null as string | null,
  durationMinutes: null as number | null,
  speakerIds: [] as string[],
})
const sessionFormErrors = ref<Record<string, string>>({})
const sessionFormProcessing = ref(false)
const speakerSearch = ref('')

const showSpeakers = computed(() => KINDS_WITH_SPEAKERS.includes(sessionForm.value.kind))
const showSponsor = computed(() => KINDS_WITH_SPONSOR.includes(sessionForm.value.kind))

// Form state for event
const formEventDate = computed(() => {
  if (!props.event.date) return ''
  return DateTime.fromISO(props.event.date).toISODate()
})

const form = useForm({
  title: props.event.title,
  eventDate: formEventDate.value || '',
  description: props.event.description || '',
  location: props.event.location || '',
  venue: props.event.venue || '',
  startTime: props.event.startTime || '',
  endTime: props.event.endTime || '',
  seatsAvailable: props.event.seatsAvailable || null,
  acceptingRsvp: props.event.acceptingRsvp,
  rsvpClosingDate: props.event.rsvpClosingDate
    ? DateTime.fromISO(props.event.rsvpClosingDate as unknown as string).toISODate()
    : '',
  parkingLocation: props.event.parkingLocation || '',
  mapUrl: props.event.mapUrl || '',
  status: props.event.status,
})

function handleSubmit() {
  form.put(`/admin/events/${props.event.id}`, {
    preserveScroll: true,
  })
}

// Load available speakers
async function loadAvailableSpeakers() {
  if (availableSpeakers.value.length > 0) return

  loadingSpeakers.value = true
  try {
    const { ok, data } = await apiFetch<{ speakers: Speaker[] }>('/admin/speakers/available')
    if (ok) {
      availableSpeakers.value = data.speakers
    }
  } catch (error) {
    console.error('Failed to load speakers:', error)
  } finally {
    loadingSpeakers.value = false
  }
}

// Drag and drop state
const draggedSession = ref<Data.Session | null>(null)
const dragOverIndex = ref<number | null>(null)

// Session management functions
const QUICK_ADD_PRESETS: Record<string, { kind: SessionKind; title: string }> = {
  intro: { kind: 'intro', title: 'Welcome & intro' },
  break: { kind: 'break', title: 'Lunch' },
  photo: { kind: 'photo', title: 'Group photo' },
  quiz: { kind: 'quiz', title: 'Quiz' },
  sponsored: { kind: 'sponsored', title: 'Sponsor spotlight' },
}

function openNewSessionForm(presetKey?: keyof typeof QUICK_ADD_PRESETS) {
  const preset = presetKey ? QUICK_ADD_PRESETS[presetKey] : null
  editingSession.value = null
  sessionForm.value = {
    title: preset?.title ?? '',
    description: '',
    kind: preset?.kind ?? 'talk',
    sponsorId: null,
    durationMinutes: null,
    speakerIds: [],
  }
  sessionFormErrors.value = {}
  speakerSearch.value = ''
  loadAvailableSpeakers()
  sessionDialog.value?.showModal()
  isDialogOpen.value = true
}

function openEditSessionForm(session: Data.Session) {
  editingSession.value = session
  sessionForm.value = {
    title: session.title,
    description: session.description || '',
    kind: (session.kind ?? 'talk') as SessionKind,
    sponsorId: session.sponsorId ?? null,
    durationMinutes: session.durationMinutes ?? null,
    speakerIds: session.speakers?.map((s) => s.id) || [],
  }
  sessionFormErrors.value = {}
  speakerSearch.value = ''
  loadAvailableSpeakers()
  sessionDialog.value?.showModal()
  isDialogOpen.value = true
}

function closeSessionForm() {
  sessionDialog.value?.close()
  isDialogOpen.value = false
  editingSession.value = null
  sessionForm.value = {
    title: '',
    description: '',
    kind: 'talk',
    sponsorId: null,
    durationMinutes: null,
    speakerIds: [],
  }
  sessionFormErrors.value = {}
}

// Drag and drop handlers
function onDragStart(session: Data.Session) {
  draggedSession.value = session
}

function onDragOver(event: DragEvent, index: number) {
  event.preventDefault()
  dragOverIndex.value = index
}

function onDragLeave() {
  dragOverIndex.value = null
}

function onDrop(targetIndex: number) {
  if (!draggedSession.value) return

  const draggedIndex = sessions.value.findIndex((s) => s.id === draggedSession.value!.id)
  if (draggedIndex === -1 || draggedIndex === targetIndex) {
    draggedSession.value = null
    dragOverIndex.value = null
    return
  }

  // Reorder the array
  const newSessions = [...sessions.value]
  const [removed] = newSessions.splice(draggedIndex, 1)
  newSessions.splice(targetIndex, 0, removed)

  // Update order values and save
  sessions.value = newSessions
  saveSessionOrder()

  draggedSession.value = null
  dragOverIndex.value = null
}

function onDragEnd() {
  draggedSession.value = null
  dragOverIndex.value = null
}

async function saveSessionOrder() {
  const updates = sessions.value.map((session, index) => ({
    id: session.id,
    order: index + 1,
  }))

  for (const update of updates) {
    try {
      await apiFetch(`/admin/sessions/${update.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: sessions.value.find((s) => s.id === update.id)?.title,
          order: update.order,
        }),
      })
    } catch (error) {
      console.error('Failed to update session order:', error)
    }
  }
}

async function saveSession() {
  sessionFormProcessing.value = true
  sessionFormErrors.value = {}

  try {
    const url = editingSession.value
      ? `/admin/sessions/${editingSession.value.id}`
      : `/admin/events/${props.event.id}/sessions`

    const method = editingSession.value ? 'PUT' : 'POST'

    const kind = sessionForm.value.kind
    const payload = {
      title: sessionForm.value.title,
      description: sessionForm.value.description,
      kind,
      durationMinutes: sessionForm.value.durationMinutes,
      sponsorId: KINDS_WITH_SPONSOR.includes(kind) ? sessionForm.value.sponsorId : null,
      speakerIds: KINDS_WITH_SPEAKERS.includes(kind) ? sessionForm.value.speakerIds : [],
      order: editingSession.value?.order ?? sessions.value.length + 1,
    }

    const { ok, data } = await apiFetch<{
      session: Data.Session
      errors?: Record<string, string>
    }>(url, {
      method,
      body: JSON.stringify(payload),
    })

    if (ok) {
      if (editingSession.value) {
        const index = sessions.value.findIndex((s) => s.id === editingSession.value!.id)
        if (index !== -1) {
          sessions.value[index] = data.session
        }
      } else {
        sessions.value.push(data.session)
      }
      closeSessionForm()
    } else if (data.errors) {
      sessionFormErrors.value = data.errors
    }
  } catch (error) {
    console.error('Failed to save session:', error)
  } finally {
    sessionFormProcessing.value = false
  }
}

async function deleteSession(session: Data.Session) {
  if (!confirm(`Are you sure you want to delete "${session.title}"?`)) {
    return
  }

  try {
    const { ok } = await apiFetch(`/admin/sessions/${session.id}`, {
      method: 'DELETE',
    })
    if (ok) {
      sessions.value = sessions.value.filter((s) => s.id !== session.id)
    }
  } catch (error) {
    console.error('Failed to delete session:', error)
  }
}

function toggleSpeaker(speakerId: string) {
  const index = sessionForm.value.speakerIds.indexOf(speakerId)
  if (index === -1) {
    sessionForm.value.speakerIds.push(speakerId)
  } else {
    sessionForm.value.speakerIds.splice(index, 1)
  }
}

function isSpeakerSelected(speakerId: string): boolean {
  return sessionForm.value.speakerIds.includes(speakerId)
}

function getSpeakerNames(speakers: Data.Speaker.Variants['summary'][]): string {
  if (!speakers || speakers.length === 0) return 'No speakers assigned'
  return speakers.map((s) => s.name).join(', ')
}

// Filtered speakers based on search
const filteredSpeakers = computed(() => {
  if (!speakerSearch.value.trim()) {
    return availableSpeakers.value
  }
  const search = speakerSearch.value.toLowerCase()
  return availableSpeakers.value.filter(
    (speaker) =>
      speaker.name.toLowerCase().includes(search) ||
      speaker.email?.toLowerCase().includes(search) ||
      speaker.githubUsername?.toLowerCase().includes(search)
  )
})

// Sponsors state
const sponsors = ref<Data.Sponsor.Variants['summary'][]>(props.event.sponsors || [])
const availableSponsors = ref<Data.Sponsor.Variants['summary'][]>([])
const loadingSponsors = ref(false)
const sponsorPickerOpen = ref(false)
const sponsorSearch = ref('')

const filteredAvailableSponsors = computed(() => {
  const attachedIds = new Set(sponsors.value.map((s) => s.id))
  let list = availableSponsors.value.filter((s) => !attachedIds.has(s.id))
  if (sponsorSearch.value.trim()) {
    const search = sponsorSearch.value.toLowerCase()
    list = list.filter((s) => s.name.toLowerCase().includes(search))
  }
  return list
})

async function loadAvailableSponsors() {
  if (availableSponsors.value.length > 0) return
  loadingSponsors.value = true
  try {
    const { ok, data } = await apiFetch<{ sponsors: Data.Sponsor.Variants['summary'][] }>(
      '/admin/sponsors/available'
    )
    if (ok) {
      availableSponsors.value = data.sponsors
    }
  } catch (error) {
    console.error('Failed to load sponsors:', error)
  } finally {
    loadingSponsors.value = false
  }
}

function openSponsorPicker() {
  sponsorSearch.value = ''
  sponsorPickerOpen.value = true
  loadAvailableSponsors()
}

async function attachSponsor(sponsor: Data.Sponsor.Variants['summary']) {
  try {
    const { ok, data } = await apiFetch<{ sponsors: Data.Sponsor.Variants['summary'][] }>(
      `/admin/events/${props.event.id}/sponsors/${sponsor.id}`,
      { method: 'POST' }
    )
    if (ok) {
      sponsors.value = data.sponsors
    }
  } catch (error) {
    console.error('Failed to attach sponsor:', error)
  }
}

async function removeSponsor(sponsorId: string) {
  try {
    const { ok, data } = await apiFetch<{ sponsors: Data.Sponsor.Variants['summary'][] }>(
      `/admin/events/${props.event.id}/sponsors/${sponsorId}`,
      { method: 'DELETE' }
    )
    if (ok) {
      sponsors.value = data.sponsors
    }
  } catch (error) {
    console.error('Failed to remove sponsor:', error)
  }
}
</script>

<template>
  <Head :title="`Edit: ${event.title}`" />
  <main class="relative min-h-screen pt-40 pb-20">
    <ContentBlock>
      <div class="max-w-4xl mx-auto">
        <!-- Breadcrumb -->
        <nav class="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/meetups"
            class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200"
          >
            Meetups
          </Link>
          <span class="text-verse-400">/</span>
          <Link
            :href="`/meetup/${event.slug || event.id}`"
            class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200"
          >
            {{ event.title }}
          </Link>
          <span class="text-verse-400">/</span>
          <span class="text-verse-500 dark:text-verse-400">Edit</span>
        </nav>

        <BaseHeading :level="1" class="mb-8">Edit Event</BaseHeading>

        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 squircle rounded-lg"
        >
          {{ successMessage }}
        </div>

        <!-- Session Form Modal (Native Dialog) -->
        <dialog
          ref="sessionDialog"
          class="w-full max-w-2xl squircle rounded-lg shadow-xl bg-white dark:bg-verse-800 max-h-[85vh] overflow-hidden"
          @close="isDialogOpen = false"
        >
          <div
            class="flex items-center justify-between p-4 border-b border-verse-200 dark:border-verse-700"
          >
            <h3 class="text-lg font-medium text-verse-900 dark:text-verse-100">
              {{ editingSession ? 'Edit Session' : 'New Session' }}
            </h3>
            <button
              type="button"
              @click="closeSessionForm"
              class="p-2 text-verse-500 hover:text-verse-700 dark:text-verse-400 dark:hover:text-verse-200 squircle rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <form
            @submit.prevent="saveSession"
            class="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]"
          >
            <!-- Title -->
            <div>
              <label
                for="sessionTitle"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Title *
              </label>
              <input
                id="sessionTitle"
                v-model="sessionForm.title"
                type="text"
                required
                placeholder="e.g., Introduction to Vue 3"
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-700 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
              <p v-if="sessionFormErrors.title" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ sessionFormErrors.title }}
              </p>
            </div>

            <!-- Description -->
            <div>
              <label
                for="sessionDescription"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Description
              </label>
              <textarea
                id="sessionDescription"
                v-model="sessionForm.description"
                rows="3"
                placeholder="Describe what this session is about..."
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-700 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>

            <!-- Type + Duration -->
            <div class="grid grid-cols-[1fr_140px] gap-3">
              <div>
                <label
                  for="sessionKind"
                  class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
                >
                  Type
                </label>
                <select
                  id="sessionKind"
                  v-model="sessionForm.kind"
                  class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-700 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
                >
                  <option v-for="opt in SESSION_KIND_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ opt.label }} — {{ opt.hint }}
                  </option>
                </select>
              </div>
              <div>
                <label
                  for="sessionDuration"
                  class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
                >
                  Duration (min)
                </label>
                <input
                  id="sessionDuration"
                  v-model.number="sessionForm.durationMinutes"
                  type="number"
                  min="1"
                  max="1440"
                  placeholder="—"
                  class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-700 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Sponsor (sponsored kind only) -->
            <div v-if="showSponsor">
              <label
                for="sessionSponsor"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Sponsor *
              </label>
              <select
                id="sessionSponsor"
                v-model="sessionForm.sponsorId"
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-700 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              >
                <option :value="null">— Pick a sponsor —</option>
                <option v-for="sp in sponsors" :key="sp.id" :value="sp.id">
                  {{ sp.name }}
                </option>
              </select>
              <p
                v-if="sponsors.length === 0"
                class="mt-2 text-xs text-verse-500 dark:text-verse-400"
              >
                Attach sponsors to this event first (below the Sessions section).
              </p>
            </div>

            <!-- Speakers -->
            <div v-if="showSpeakers">
              <label class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
                Speakers
              </label>
              <div v-if="loadingSpeakers" class="text-center py-4">
                <span class="text-verse-500 dark:text-verse-400">Loading speakers...</span>
              </div>
              <div v-else-if="availableSpeakers.length > 0">
                <!-- Search input -->
                <div class="relative mb-2">
                  <input
                    v-model="speakerSearch"
                    type="text"
                    placeholder="Search speakers..."
                    class="w-full px-4 py-2 pl-10 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-700 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent text-sm"
                  />
                  <svg
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-verse-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <!-- Speaker list -->
                <div
                  class="max-h-48 overflow-y-auto border border-verse-300 dark:border-verse-600 squircle rounded-lg"
                >
                  <div
                    v-for="speaker in filteredSpeakers"
                    :key="speaker.id"
                    @click="toggleSpeaker(speaker.id)"
                    class="flex items-center gap-3 p-3 cursor-pointer hover:bg-verse-50 dark:hover:bg-verse-700 transition-colors"
                    :class="{ 'bg-verse-100 dark:bg-verse-600': isSpeakerSelected(speaker.id) }"
                  >
                    <input
                      type="checkbox"
                      :checked="isSpeakerSelected(speaker.id)"
                      class="w-4 h-4 text-verse-600 border-verse-300 rounded focus:ring-verse-500"
                      @click.stop
                      @change="toggleSpeaker(speaker.id)"
                    />
                    <img
                      v-if="speaker.avatarUrl"
                      :src="speaker.avatarUrl"
                      :alt="speaker.name"
                      class="w-8 h-8 rounded-full object-cover"
                    />
                    <div
                      v-else
                      class="w-8 h-8 rounded-full bg-verse-300 dark:bg-verse-600 flex items-center justify-center text-verse-600 dark:text-verse-300 text-sm font-medium"
                    >
                      {{ speaker.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-verse-900 dark:text-verse-100 truncate">
                        {{ speaker.name }}
                      </p>
                      <p
                        v-if="speaker.email"
                        class="text-xs text-verse-500 dark:text-verse-400 truncate"
                      >
                        {{ speaker.email }}
                      </p>
                    </div>
                  </div>
                  <p
                    v-if="filteredSpeakers.length === 0"
                    class="text-sm text-verse-500 dark:text-verse-400 py-4 text-center"
                  >
                    No speakers found matching "{{ speakerSearch }}"
                  </p>
                </div>
              </div>
              <p v-else class="text-sm text-verse-500 dark:text-verse-400 py-4 text-center">
                No speakers available. Users with member role or above can be speakers.
              </p>
              <p
                v-if="sessionForm.speakerIds.length > 0"
                class="mt-2 text-xs text-verse-500 dark:text-verse-400"
              >
                {{ sessionForm.speakerIds.length }} speaker(s) selected
              </p>
            </div>

            <!-- Actions -->
            <div
              class="flex items-center justify-end gap-3 pt-4 border-t border-verse-200 dark:border-verse-700"
            >
              <button
                type="button"
                @click="closeSessionForm"
                class="px-4 py-2 border border-verse-300 dark:border-verse-600 text-verse-700 dark:text-verse-300 hover:bg-verse-50 dark:hover:bg-verse-700 font-medium squircle rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="sessionFormProcessing"
                class="px-4 py-2 bg-verse-600 hover:bg-verse-700 disabled:bg-verse-400 text-white font-medium squircle rounded-lg transition-colors"
              >
                <span v-if="sessionFormProcessing">Saving...</span>
                <span v-else>{{ editingSession ? 'Update Session' : 'Create Session' }}</span>
              </button>
            </div>
          </form>
        </dialog>

        <!-- Edit Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Title -->
          <div>
            <label
              for="title"
              class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
            >
              Title *
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
            <p v-if="form.errors.title" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ form.errors.title }}
            </p>
          </div>

          <!-- Event Date -->
          <div>
            <label
              for="eventDate"
              class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
            >
              Event Date *
            </label>
            <input
              id="eventDate"
              v-model="form.eventDate"
              type="date"
              required
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
            <p v-if="form.errors.eventDate" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ form.errors.eventDate }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <label
              for="description"
              class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
            <p v-if="form.errors.description" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ form.errors.description }}
            </p>
          </div>

          <!-- Location & Venue -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="location"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Location
              </label>
              <input
                id="location"
                v-model="form.location"
                type="text"
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                for="venue"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Venue
              </label>
              <input
                id="venue"
                v-model="form.venue"
                type="text"
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Start Time & End Time -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="startTime"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Start Time
              </label>
              <input
                id="startTime"
                v-model="form.startTime"
                type="time"
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                for="endTime"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                End Time
              </label>
              <input
                id="endTime"
                v-model="form.endTime"
                type="time"
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- RSVP Settings -->
          <div
            class="p-4 bg-verse-50 dark:bg-verse-800/50 squircle rounded-lg border border-verse-200 dark:border-verse-700"
          >
            <h3 class="text-lg font-medium text-verse-900 dark:text-verse-100 mb-4">
              RSVP Settings
            </h3>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <input
                  id="acceptingRsvp"
                  v-model="form.acceptingRsvp"
                  type="checkbox"
                  class="w-4 h-4 text-verse-600 border-verse-300 rounded focus:ring-verse-500"
                />
                <label for="acceptingRsvp" class="text-sm text-verse-700 dark:text-verse-300">
                  Accepting RSVPs
                </label>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    for="seatsAvailable"
                    class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
                  >
                    Seats Available
                  </label>
                  <input
                    id="seatsAvailable"
                    v-model.number="form.seatsAvailable"
                    type="number"
                    min="0"
                    class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    for="rsvpClosingDate"
                    class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
                  >
                    RSVP Closing Date
                  </label>
                  <input
                    id="rsvpClosingDate"
                    v-model="form.rsvpClosingDate"
                    type="date"
                    class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Map & Parking -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="mapUrl"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Map URL
              </label>
              <input
                id="mapUrl"
                v-model="form.mapUrl"
                type="url"
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                for="parkingLocation"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Parking Location URL
              </label>
              <input
                id="parkingLocation"
                v-model="form.parkingLocation"
                type="url"
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Status -->
          <div>
            <label
              for="status"
              class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
            >
              Status
            </label>
            <select
              id="status"
              v-model="form.status"
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-4 pt-4">
            <button
              type="submit"
              :disabled="form.processing"
              class="px-6 py-2.5 bg-verse-600 hover:bg-verse-700 disabled:bg-verse-400 text-white font-medium squircle rounded-lg transition-colors"
            >
              <span v-if="form.processing">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
            <Link
              :href="`/meetup/${event.slug || event.id}`"
              class="px-6 py-2.5 border border-verse-300 dark:border-verse-600 text-verse-700 dark:text-verse-300 hover:bg-verse-50 dark:hover:bg-verse-800 font-medium squircle rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>

        <!-- Sessions Section -->
        <div
          class="mt-12 p-4 bg-verse-50 dark:bg-verse-800/50 squircle rounded-lg border border-verse-200 dark:border-verse-700"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-verse-900 dark:text-verse-100">Sessions</h3>
            <button
              type="button"
              @click="() => openNewSessionForm()"
              class="px-4 py-2 bg-verse-600 hover:bg-verse-700 text-white text-sm font-medium squircle rounded-lg transition-colors"
            >
              Add Session
            </button>
          </div>

          <!-- Quick-add presets -->
          <div class="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-verse-200 dark:border-verse-700">
            <span class="text-xs font-medium text-verse-500 dark:text-verse-400 uppercase tracking-wide">
              Quick add
            </span>
            <button
              v-for="preset in [
                { key: 'intro', label: '+ Intro' },
                { key: 'break', label: '+ Lunch break' },
                { key: 'photo', label: '+ Group photo' },
                { key: 'quiz', label: '+ Quiz' },
                { key: 'sponsored', label: '+ Sponsored' },
              ]"
              :key="preset.key"
              type="button"
              @click="openNewSessionForm(preset.key as 'intro' | 'break' | 'photo' | 'quiz' | 'sponsored')"
              class="px-2.5 py-1 text-xs font-medium text-verse-700 dark:text-verse-300 bg-white dark:bg-verse-700 border border-verse-300 dark:border-verse-600 hover:border-verse-500 hover:text-verse-900 dark:hover:text-verse-100 squircle rounded-md transition-colors"
            >
              {{ preset.label }}
            </button>
          </div>

          <!-- Sessions List -->
          <div v-if="sessions.length > 0" class="space-y-2">
            <p class="text-xs text-verse-500 dark:text-verse-400 mb-2">Drag sessions to reorder</p>
            <div
              v-for="(session, index) in sessions"
              :key="session.id"
              draggable="true"
              class="p-4 bg-white dark:bg-verse-700/50 squircle rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing"
              :class="[
                dragOverIndex === index
                  ? 'border-verse-500 bg-verse-50 dark:bg-verse-600/50'
                  : 'border-verse-200 dark:border-verse-600',
                draggedSession?.id === session.id ? 'opacity-50' : '',
              ]"
              @dragstart="onDragStart(session)"
              @dragover="onDragOver($event, index)"
              @dragleave="onDragLeave"
              @drop="onDrop(index)"
              @dragend="onDragEnd"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-3 flex-1 min-w-0">
                  <!-- Drag handle -->
                  <div class="flex-shrink-0 mt-1 text-verse-400 dark:text-verse-500">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
                      />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        class="px-2 py-0.5 bg-verse-200 dark:bg-verse-600 text-verse-700 dark:text-verse-200 text-xs font-medium rounded"
                      >
                        #{{ index + 1 }}
                      </span>
                      <span
                        v-if="session.kind && session.kind !== 'talk'"
                        class="px-2 py-0.5 bg-coral-soft text-coral-strong text-[10.5px] font-mono font-semibold uppercase tracking-wider rounded"
                      >
                        {{ session.kind }}
                      </span>
                      <h4 class="font-medium text-verse-900 dark:text-verse-100 truncate">
                        {{ session.title }}
                      </h4>
                      <span
                        v-if="session.durationMinutes"
                        class="text-xs font-mono text-verse-500 dark:text-verse-400"
                      >
                        · {{ session.durationMinutes }}m
                      </span>
                    </div>
                    <p
                      v-if="session.description"
                      class="text-sm text-verse-600 dark:text-verse-400 line-clamp-2 mb-2"
                    >
                      {{ session.description }}
                    </p>
                    <div class="flex items-center gap-2 text-sm text-verse-500 dark:text-verse-400">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>{{ getSpeakerNames(session.speakers) }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    @click="openEditSessionForm(session)"
                    class="p-2 text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200 hover:bg-verse-100 dark:hover:bg-verse-600 squircle rounded-lg transition-colors"
                    title="Edit session"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    @click="deleteSession(session)"
                    class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30 squircle rounded-lg transition-colors"
                    title="Delete session"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-center py-8 text-verse-500 dark:text-verse-400">
            No sessions yet. Click "Add Session" to create one.
          </p>
        </div>

        <!-- Sponsors Section -->
        <div
          class="mt-12 p-4 bg-verse-50 dark:bg-verse-800/50 squircle rounded-lg border border-verse-200 dark:border-verse-700"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-verse-900 dark:text-verse-100">Sponsors</h3>
            <button
              type="button"
              @click="openSponsorPicker"
              class="px-4 py-2 bg-verse-600 hover:bg-verse-700 text-white text-sm font-medium squircle rounded-lg transition-colors"
            >
              Add Sponsor
            </button>
          </div>

          <!-- Sponsor Picker -->
          <div
            v-if="sponsorPickerOpen"
            class="mb-4 p-4 bg-white dark:bg-verse-700/50 squircle rounded-lg border border-verse-200 dark:border-verse-600"
          >
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-verse-700 dark:text-verse-300"
                >Select a sponsor</span
              >
              <button
                type="button"
                @click="sponsorPickerOpen = false"
                class="p-1 text-verse-500 hover:text-verse-700 dark:text-verse-400 dark:hover:text-verse-200"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div class="relative mb-2">
              <input
                v-model="sponsorSearch"
                type="text"
                placeholder="Search sponsors..."
                class="w-full px-4 py-2 pl-10 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-700 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent text-sm"
              />
              <svg
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-verse-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div v-if="loadingSponsors" class="text-center py-4">
              <span class="text-verse-500 dark:text-verse-400 text-sm">Loading sponsors...</span>
            </div>
            <div v-else class="max-h-48 overflow-y-auto">
              <div
                v-for="sponsor in filteredAvailableSponsors"
                :key="sponsor.id"
                @click="attachSponsor(sponsor)"
                class="flex items-center gap-3 p-2 cursor-pointer hover:bg-verse-50 dark:hover:bg-verse-600 squircle rounded-lg transition-colors"
              >
                <img
                  v-if="sponsor.logoUrl"
                  :src="sponsor.logoUrl"
                  :alt="sponsor.name"
                  class="w-8 h-8 rounded object-contain bg-white"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded bg-verse-300 dark:bg-verse-600 flex items-center justify-center text-verse-600 dark:text-verse-300 text-sm font-medium"
                >
                  {{ sponsor.name.charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm text-verse-900 dark:text-verse-100">{{ sponsor.name }}</span>
              </div>
              <p
                v-if="filteredAvailableSponsors.length === 0"
                class="text-sm text-verse-500 dark:text-verse-400 py-4 text-center"
              >
                {{
                  sponsorSearch
                    ? `No sponsors found matching "${sponsorSearch}"`
                    : 'All sponsors are already attached'
                }}
              </p>
            </div>
          </div>

          <!-- Attached Sponsors List -->
          <div v-if="sponsors.length > 0" class="space-y-2">
            <div
              v-for="sponsor in sponsors"
              :key="sponsor.id"
              class="flex items-center justify-between p-3 bg-white dark:bg-verse-700/50 squircle rounded-lg border border-verse-200 dark:border-verse-600"
            >
              <div class="flex items-center gap-3 min-w-0">
                <img
                  v-if="sponsor.logoUrl"
                  :src="sponsor.logoUrl"
                  :alt="sponsor.name"
                  class="w-8 h-8 rounded object-contain bg-white"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded bg-verse-300 dark:bg-verse-600 flex items-center justify-center text-verse-600 dark:text-verse-300 text-sm font-medium"
                >
                  {{ sponsor.name.charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-verse-900 dark:text-verse-100 truncate">
                    {{ sponsor.name }}
                  </p>
                  <p
                    v-if="sponsor.sponsorTypes?.length"
                    class="text-xs text-verse-500 dark:text-verse-400"
                  >
                    {{ sponsor.sponsorTypes.join(', ') }}
                  </p>
                </div>
              </div>
              <button
                type="button"
                @click="removeSponsor(sponsor.id)"
                class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30 squircle rounded-lg transition-colors"
                title="Remove sponsor"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          <p v-else class="text-center py-8 text-verse-500 dark:text-verse-400">
            No sponsors attached. Click "Add Sponsor" to add one.
          </p>
        </div>
      </div>
    </ContentBlock>
  </main>
</template>
