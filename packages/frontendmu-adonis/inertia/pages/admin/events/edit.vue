<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Head, Link, useForm, usePage, router } from '@inertiajs/vue3'
import { DateTime } from 'luxon'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
import type Event from '#models/event'
import type Session from '#models/session'
import type User from '#models/user'

interface SessionWithSpeakers extends Session {
  speakers: User[]
}

interface EventWithSessions extends Event {
  sessions: SessionWithSpeakers[]
}

interface Props {
  event: EventWithSessions
}

interface Speaker {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
  githubUsername: string | null
}

const props = defineProps<Props>()
const page = usePage()

// Flash messages
const successMessage = computed(() => (page.props as any).flash?.success)

// Sessions state
const sessions = ref<SessionWithSpeakers[]>(props.event.sessions || [])
const availableSpeakers = ref<Speaker[]>([])
const loadingSpeakers = ref(false)

// Dialog ref
const sessionDialog = ref<HTMLDialogElement | null>(null)
const isDialogOpen = ref(false)

// Lock body scroll when dialog is open
watch(isDialogOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

// Session form state
const editingSession = ref<SessionWithSpeakers | null>(null)
const sessionForm = ref({
  title: '',
  description: '',
  speakerIds: [] as string[],
})
const sessionFormErrors = ref<Record<string, string>>({})
const sessionFormProcessing = ref(false)
const speakerSearch = ref('')

// Form state for event
const form = useForm({
  title: props.event.title,
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

const eventDate = computed(() => {
  if (!props.event.eventDate) return ''
  const date = props.event.eventDate
  if (typeof date === 'string') return DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL)
  return DateTime.fromJSDate(date.toJSDate()).toLocaleString(DateTime.DATE_FULL)
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
    const response = await fetch('/admin/speakers/available')
    if (response.ok) {
      const data = await response.json()
      availableSpeakers.value = data.speakers
    }
  } catch (error) {
    console.error('Failed to load speakers:', error)
  } finally {
    loadingSpeakers.value = false
  }
}

// Drag and drop state
const draggedSession = ref<SessionWithSpeakers | null>(null)
const dragOverIndex = ref<number | null>(null)

// Session management functions
function openNewSessionForm() {
  editingSession.value = null
  sessionForm.value = {
    title: '',
    description: '',
    speakerIds: [],
  }
  sessionFormErrors.value = {}
  speakerSearch.value = ''
  loadAvailableSpeakers()
  sessionDialog.value?.showModal()
  isDialogOpen.value = true
}

function openEditSessionForm(session: SessionWithSpeakers) {
  editingSession.value = session
  sessionForm.value = {
    title: session.title,
    description: session.description || '',
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
    speakerIds: [],
  }
  sessionFormErrors.value = {}
}

// Drag and drop handlers
function onDragStart(session: SessionWithSpeakers) {
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
  // Update order for each session
  const updates = sessions.value.map((session, index) => ({
    id: session.id,
    order: index + 1,
  }))

  // Save each session's new order
  for (const update of updates) {
    try {
      await fetch(`/admin/sessions/${update.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({
          title: sessions.value.find((s) => s.id === update.id)?.title,
          order: update.order,
        }),
        credentials: 'same-origin',
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

    // For new sessions, set order to be at the end
    const payload = {
      ...sessionForm.value,
      order: editingSession.value?.order ?? sessions.value.length + 1,
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': getCsrfToken(),
      },
      body: JSON.stringify(payload),
      credentials: 'same-origin',
    })

    if (response.ok) {
      const data = await response.json()

      if (editingSession.value) {
        // Update existing session in list
        const index = sessions.value.findIndex((s) => s.id === editingSession.value!.id)
        if (index !== -1) {
          sessions.value[index] = data.session
        }
      } else {
        // Add new session to list
        sessions.value.push(data.session)
      }

      closeSessionForm()
    } else {
      const errorData = await response.json()
      if (errorData.errors) {
        sessionFormErrors.value = errorData.errors
      }
    }
  } catch (error) {
    console.error('Failed to save session:', error)
  } finally {
    sessionFormProcessing.value = false
  }
}

async function deleteSession(session: SessionWithSpeakers) {
  if (!confirm(`Are you sure you want to delete "${session.title}"?`)) {
    return
  }

  try {
    const response = await fetch(`/admin/sessions/${session.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'X-XSRF-TOKEN': getCsrfToken(),
      },
      credentials: 'same-origin',
    })

    if (response.ok) {
      sessions.value = sessions.value.filter((s) => s.id !== session.id)
    }
  } catch (error) {
    console.error('Failed to delete session:', error)
  }
}

function getCsrfToken(): string {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value)
    }
  }
  return ''
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

function getSpeakerNames(speakers: User[]): string {
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
</script>

<template>
  <Head :title="`Edit: ${event.title}`" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20 max-w-4xl mx-auto">
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
            :href="`/meetup/${event.id}`"
            class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200"
          >
            {{ event.title }}
          </Link>
          <span class="text-verse-400">/</span>
          <span class="text-verse-500 dark:text-verse-400">Edit</span>
        </nav>

        <BaseHeading :level="1" class="mb-2">Edit Event</BaseHeading>
        <p class="text-verse-600 dark:text-verse-400 mb-8">Event Date: {{ eventDate }}</p>

        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg"
        >
          {{ successMessage }}
        </div>

        <!-- Session Form Modal (Native Dialog) -->
        <dialog
          ref="sessionDialog"
          class="w-full max-w-2xl rounded-lg shadow-xl bg-white dark:bg-verse-800 max-h-[85vh] overflow-hidden"
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
              class="p-2 text-verse-500 hover:text-verse-700 dark:text-verse-400 dark:hover:text-verse-200 rounded-lg transition-colors"
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
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-700 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
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
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-700 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>

            <!-- Speakers -->
            <div>
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
                    class="w-full px-4 py-2 pl-10 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-700 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent text-sm"
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
                  class="max-h-48 overflow-y-auto border border-verse-300 dark:border-verse-600 rounded-lg"
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
                class="px-4 py-2 border border-verse-300 dark:border-verse-600 text-verse-700 dark:text-verse-300 hover:bg-verse-50 dark:hover:bg-verse-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="sessionFormProcessing"
                class="px-4 py-2 bg-verse-600 hover:bg-verse-700 disabled:bg-verse-400 text-white font-medium rounded-lg transition-colors"
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
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
            <p v-if="form.errors.title" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ form.errors.title }}
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
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
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
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
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
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
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
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
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
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- RSVP Settings -->
          <div
            class="p-4 bg-verse-50 dark:bg-verse-800/50 rounded-lg border border-verse-200 dark:border-verse-700"
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
                    class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
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
                    class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
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
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
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
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
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
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
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
              class="px-6 py-2.5 bg-verse-600 hover:bg-verse-700 disabled:bg-verse-400 text-white font-medium rounded-lg transition-colors"
            >
              <span v-if="form.processing">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
            <Link
              :href="`/meetup/${event.id}`"
              class="px-6 py-2.5 border border-verse-300 dark:border-verse-600 text-verse-700 dark:text-verse-300 hover:bg-verse-50 dark:hover:bg-verse-800 font-medium rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>

        <!-- Sessions Section -->
        <div
          class="mt-12 p-4 bg-verse-50 dark:bg-verse-800/50 rounded-lg border border-verse-200 dark:border-verse-700"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-verse-900 dark:text-verse-100">Sessions</h3>
            <button
              type="button"
              @click="openNewSessionForm"
              class="px-4 py-2 bg-verse-600 hover:bg-verse-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add Session
            </button>
          </div>

          <!-- Sessions List -->
          <div v-if="sessions.length > 0" class="space-y-2">
            <p class="text-xs text-verse-500 dark:text-verse-400 mb-2">Drag sessions to reorder</p>
            <div
              v-for="(session, index) in sessions"
              :key="session.id"
              draggable="true"
              class="p-4 bg-white dark:bg-verse-700/50 rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing"
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
                    <div class="flex items-center gap-2 mb-1">
                      <span
                        class="px-2 py-0.5 bg-verse-200 dark:bg-verse-600 text-verse-700 dark:text-verse-200 text-xs font-medium rounded"
                      >
                        #{{ index + 1 }}
                      </span>
                      <h4 class="font-medium text-verse-900 dark:text-verse-100 truncate">
                        {{ session.title }}
                      </h4>
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
                    class="p-2 text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200 hover:bg-verse-100 dark:hover:bg-verse-600 rounded-lg transition-colors"
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
                    class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
