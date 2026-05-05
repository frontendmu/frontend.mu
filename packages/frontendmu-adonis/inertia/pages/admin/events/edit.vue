<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { Head, useForm, usePage } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import { DateTime } from 'luxon'
import AdminShell from '~/components/admin/ui/AdminShell.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminButton from '~/components/admin/ui/AdminButton.vue'
import AdminInput from '~/components/admin/ui/AdminInput.vue'
import AdminTextarea from '~/components/admin/ui/AdminTextarea.vue'
import AdminSelect from '~/components/admin/ui/AdminSelect.vue'
import AdminCheckbox from '~/components/admin/ui/AdminCheckbox.vue'
import AdminBadge from '~/components/admin/ui/AdminBadge.vue'
import AdminAvatar from '~/components/admin/ui/AdminAvatar.vue'
import AdminSearchInput from '~/components/admin/ui/AdminSearchInput.vue'
import AdminConfirmModal from '~/components/admin/ui/AdminConfirmModal.vue'
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

const successMessage = computed(() => page.props.flash?.success)

// ─── Sessions ──────────────────────────────────────────────────────────
const sessions = ref<Data.Session[]>(props.event.sessions || [])
const availableSpeakers = ref<Speaker[]>([])
const loadingSpeakers = ref(false)

const sessionDialog = ref<HTMLDialogElement | null>(null)
const isDialogOpen = ref(false)

watch(isDialogOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
onUnmounted(() => {
  document.body.style.overflow = ''
})

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
const sessionToDelete = ref<Data.Session | null>(null)
const isDeletingSession = ref(false)

const showSpeakers = computed(() => KINDS_WITH_SPEAKERS.includes(sessionForm.value.kind))
const showSponsor = computed(() => KINDS_WITH_SPONSOR.includes(sessionForm.value.kind))

// ─── Event form ────────────────────────────────────────────────────────
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
  form.put(`/admin/events/${props.event.id}`, { preserveScroll: true })
}

async function loadAvailableSpeakers() {
  if (availableSpeakers.value.length > 0) return
  loadingSpeakers.value = true
  try {
    const { ok, data } = await apiFetch<{ speakers: Speaker[] }>('/admin/speakers/available')
    if (ok) availableSpeakers.value = data.speakers
  } catch (error) {
    console.error('Failed to load speakers:', error)
  } finally {
    loadingSpeakers.value = false
  }
}

// ─── Drag and drop ─────────────────────────────────────────────────────
const draggedSession = ref<Data.Session | null>(null)
const dragOverIndex = ref<number | null>(null)

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
  sessionFormErrors.value = {}
}

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
  const newSessions = [...sessions.value]
  const [removed] = newSessions.splice(draggedIndex, 1)
  newSessions.splice(targetIndex, 0, removed)
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
  const updates = sessions.value.map((session, index) => ({ id: session.id, order: index + 1 }))
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
    const { ok, data } = await apiFetch<{ session: Data.Session; errors?: Record<string, string> }>(
      url,
      { method, body: JSON.stringify(payload) }
    )
    if (ok) {
      if (editingSession.value) {
        const index = sessions.value.findIndex((s) => s.id === editingSession.value!.id)
        if (index !== -1) sessions.value[index] = data.session
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

function confirmDeleteSession(session: Data.Session) {
  sessionToDelete.value = session
}

async function deleteSession() {
  const session = sessionToDelete.value
  if (!session?.id) return
  isDeletingSession.value = true
  try {
    const { ok } = await apiFetch<{ message?: string }>(`/admin/sessions/${session.id}`, {
      method: 'DELETE',
    })
    if (ok) {
      sessions.value = sessions.value.filter((s) => s.id !== session.id)
      sessionToDelete.value = null
    }
  } catch (error) {
    console.error('Failed to delete session:', error)
  } finally {
    isDeletingSession.value = false
  }
}

function toggleSpeaker(speakerId: string) {
  const index = sessionForm.value.speakerIds.indexOf(speakerId)
  if (index === -1) sessionForm.value.speakerIds.push(speakerId)
  else sessionForm.value.speakerIds.splice(index, 1)
}

function isSpeakerSelected(speakerId: string): boolean {
  return sessionForm.value.speakerIds.includes(speakerId)
}

function getSpeakerNames(speakers: Data.Speaker.Variants['summary'][]): string {
  if (!speakers || speakers.length === 0) return 'No speakers assigned'
  return speakers.map((s) => s.name).join(', ')
}

const filteredSpeakers = computed(() => {
  if (!speakerSearch.value.trim()) return availableSpeakers.value
  const search = speakerSearch.value.toLowerCase()
  return availableSpeakers.value.filter(
    (speaker) =>
      speaker.name.toLowerCase().includes(search) ||
      speaker.email?.toLowerCase().includes(search) ||
      speaker.githubUsername?.toLowerCase().includes(search)
  )
})

// ─── Sponsors ──────────────────────────────────────────────────────────
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
    if (ok) availableSponsors.value = data.sponsors
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
    if (ok) sponsors.value = data.sponsors
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
    if (ok) sponsors.value = data.sponsors
  } catch (error) {
    console.error('Failed to remove sponsor:', error)
  }
}
</script>

<template>
  <Head :title="`${event.title} · Admin`" />
  <AdminShell
    :title="event.title"
    description="Edit details, schedule sessions and attach sponsors."
    :breadcrumbs="[
      { label: 'Admin', href: '/admin' },
      { label: 'Events', href: '/admin/events' },
      { label: event.title },
    ]"
  >
    <template #actions>
      <AdminButton :href="`/meetup/${event.slug || event.id}`" variant="secondary">
        View public page
      </AdminButton>
      <AdminButton :href="`/admin/events/${event.slug || event.id}/attendees`" variant="secondary">
        Attendees
      </AdminButton>
    </template>

    <!-- Flash -->
    <div
      v-if="successMessage"
      class="mb-6 px-4 py-3 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 text-sm text-emerald-800 dark:text-emerald-200"
      role="status"
    >
      {{ successMessage }}
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
      <form class="space-y-6 min-w-0" @submit.prevent="handleSubmit">
        <AdminCard title="Basics">
          <div class="space-y-5">
            <AdminInput v-model="form.title" label="Title" required :error="form.errors.title" />
            <AdminInput
              v-model="form.eventDate"
              label="Event date"
              type="date"
              required
              :error="form.errors.eventDate"
            />
            <AdminTextarea
              v-model="form.description"
              label="Description"
              :error="form.errors.description"
            />
          </div>
        </AdminCard>

        <AdminCard title="Where & when">
          <div class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput v-model="form.location" label="Location" />
              <AdminInput v-model="form.venue" label="Venue" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput v-model="form.startTime" label="Start time" type="time" />
              <AdminInput v-model="form.endTime" label="End time" type="time" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput v-model="form.mapUrl" label="Map URL" type="url" />
              <AdminInput v-model="form.parkingLocation" label="Parking URL" type="url" />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="RSVPs">
          <div class="space-y-5">
            <AdminCheckbox
              v-model="form.acceptingRsvp"
              label="Accept RSVPs"
              description="Members can sign up for this event."
            />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AdminInput
                v-model="form.seatsAvailable"
                label="Seats available"
                type="number"
                min="0"
                hint="Leave empty for unlimited"
              />
              <AdminInput
                v-model="form.rsvpClosingDate"
                label="RSVP closing date"
                type="date"
              />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Visibility">
          <AdminSelect v-model="form.status" label="Status">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
          </AdminSelect>
        </AdminCard>

        <div
          class="sticky bottom-3 z-10 flex justify-end gap-2 bg-white/85 dark:bg-verse-950/85 backdrop-blur-md p-3 rounded-xl border border-verse-200 dark:border-verse-800"
        >
          <AdminButton :href="`/meetup/${event.slug || event.id}`" variant="secondary">
            Cancel
          </AdminButton>
          <AdminButton type="submit" variant="primary" :loading="form.processing">
            {{ form.processing ? 'Saving…' : 'Save changes' }}
          </AdminButton>
        </div>
      </form>

      <!-- Side rail: sessions & sponsors -->
      <aside class="space-y-6 min-w-0">
        <AdminCard title="Schedule" :description="`${sessions.length} session${sessions.length === 1 ? '' : 's'}`">
          <template #headerActions>
            <AdminButton size="sm" variant="primary" @click="openNewSessionForm()">
              + Session
            </AdminButton>
          </template>

          <div
            v-if="sessions.length"
            class="space-y-2"
            aria-label="Sessions list"
          >
            <p class="text-[11px] font-mono text-verse-500 dark:text-verse-300 mb-2 uppercase tracking-wide">
              Drag to reorder
            </p>
            <div
              v-for="(session, index) in sessions"
              :key="session.id"
              draggable="true"
              :class="[
                'group p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing',
                dragOverIndex === index
                  ? 'border-coral-strong bg-coral-soft/40 dark:bg-coral-strong/10'
                  : 'border-verse-200 dark:border-verse-800 bg-white dark:bg-verse-900/40',
                draggedSession?.id === session.id ? 'opacity-50' : '',
              ]"
              @dragstart="onDragStart(session)"
              @dragover="onDragOver($event, index)"
              @dragleave="onDragLeave"
              @drop="onDrop(index)"
              @dragend="onDragEnd"
            >
              <div class="flex items-start gap-2">
                <div class="mt-0.5 text-verse-400 dark:text-verse-500 cursor-grab" aria-hidden="true">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="5" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="9" cy="19" r="1.5" />
                    <circle cx="15" cy="5" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="15" cy="19" r="1.5" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap mb-1">
                    <span class="text-[10px] font-mono text-verse-500 dark:text-verse-300 tabular-nums">
                      #{{ index + 1 }}
                    </span>
                    <AdminBadge v-if="session.kind && session.kind !== 'talk'" tone="accent">
                      {{ session.kind }}
                    </AdminBadge>
                    <span
                      v-if="session.durationMinutes"
                      class="text-[10px] font-mono text-verse-500 dark:text-verse-300"
                    >
                      {{ session.durationMinutes }}m
                    </span>
                  </div>
                  <p class="text-sm font-medium text-verse-900 dark:text-verse-100 truncate">
                    {{ session.title }}
                  </p>
                  <p
                    v-if="session.speakers?.length"
                    class="text-xs text-verse-500 dark:text-verse-300 truncate mt-0.5"
                  >
                    {{ getSpeakerNames(session.speakers) }}
                  </p>
                </div>
                <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    class="p-1.5 rounded-md text-verse-500 hover:text-verse-900 dark:hover:text-verse-100 hover:bg-verse-100 dark:hover:bg-verse-800"
                    title="Edit"
                    aria-label="Edit session"
                    @click="openEditSessionForm(session)"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete"
                    aria-label="Delete session"
                    @click="confirmDeleteSession(session)"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-verse-500 dark:text-verse-300 py-3 text-center">
            No sessions yet.
          </p>

          <template #footer>
            <div class="flex flex-wrap gap-1.5 text-[11px] font-mono text-verse-500 dark:text-verse-300 uppercase tracking-wide">
              <span class="self-center mr-1">Quick add</span>
              <button
                v-for="preset in [
                  { key: 'intro' as const, label: 'Intro' },
                  { key: 'break' as const, label: 'Lunch' },
                  { key: 'photo' as const, label: 'Photo' },
                  { key: 'quiz' as const, label: 'Quiz' },
                  { key: 'sponsored' as const, label: 'Sponsored' },
                ]"
                :key="preset.key"
                type="button"
                class="px-2 py-1 rounded-md border border-verse-200 dark:border-verse-700 hover:border-verse-400 dark:hover:border-verse-500 transition-colors text-verse-600 dark:text-verse-300 normal-case font-sans tracking-normal"
                @click="openNewSessionForm(preset.key)"
              >
                + {{ preset.label }}
              </button>
            </div>
          </template>
        </AdminCard>

        <AdminCard title="Sponsors" :description="`${sponsors.length} attached`">
          <template #headerActions>
            <AdminButton size="sm" variant="primary" @click="openSponsorPicker">+ Sponsor</AdminButton>
          </template>

          <div
            v-if="sponsorPickerOpen"
            class="mb-3 p-3 rounded-xl bg-verse-50 dark:bg-verse-900/40 border border-verse-200 dark:border-verse-800"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-verse-700 dark:text-verse-300">Attach sponsor</span>
              <button
                type="button"
                class="p-1 rounded text-verse-500 hover:text-verse-700 dark:hover:text-verse-300"
                aria-label="Close"
                @click="sponsorPickerOpen = false"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <AdminSearchInput v-model="sponsorSearch" placeholder="Search sponsors…" />
            <div v-if="loadingSponsors" class="text-center py-3 text-sm text-verse-500">
              Loading…
            </div>
            <div v-else class="mt-2 max-h-48 overflow-y-auto space-y-1">
              <button
                v-for="sponsor in filteredAvailableSponsors"
                :key="sponsor.id"
                type="button"
                class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-verse-100 dark:hover:bg-verse-800 transition-colors text-left"
                @click="attachSponsor(sponsor)"
              >
                <AdminAvatar
                  :src="sponsor.logoUrl"
                  :name="sponsor.name"
                  size="sm"
                  rounded="lg"
                />
                <span class="text-sm text-verse-900 dark:text-verse-100 truncate">{{ sponsor.name }}</span>
              </button>
              <p
                v-if="filteredAvailableSponsors.length === 0"
                class="text-xs text-verse-500 dark:text-verse-300 py-2 text-center"
              >
                {{ sponsorSearch ? `No matches for "${sponsorSearch}"` : 'All sponsors attached' }}
              </p>
            </div>
          </div>

          <div v-if="sponsors.length" class="space-y-2">
            <div
              v-for="sponsor in sponsors"
              :key="sponsor.id"
              class="flex items-center gap-3 p-2.5 rounded-lg border border-verse-200 dark:border-verse-800"
            >
              <AdminAvatar
                :src="sponsor.logoUrl"
                :name="sponsor.name"
                size="sm"
                rounded="lg"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-verse-900 dark:text-verse-100 truncate">
                  {{ sponsor.name }}
                </p>
                <p
                  v-if="sponsor.sponsorTypes?.length"
                  class="text-xs text-verse-500 dark:text-verse-300 truncate"
                >
                  {{ sponsor.sponsorTypes.join(', ') }}
                </p>
              </div>
              <button
                type="button"
                class="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Remove sponsor"
                aria-label="Remove sponsor"
                @click="removeSponsor(sponsor.id)"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          <p v-else class="text-sm text-verse-500 dark:text-verse-300 py-3 text-center">
            No sponsors attached.
          </p>
        </AdminCard>
      </aside>
    </div>

    <!-- Session form dialog (native) -->
    <dialog
      ref="sessionDialog"
      class="w-full max-w-2xl rounded-2xl shadow-xl bg-white dark:bg-verse-900 max-h-[85vh] overflow-hidden border border-verse-200 dark:border-verse-800"
      @close="
        () => {
          isDialogOpen = false
          editingSession = null
          sessionFormErrors = {}
        }
      "
    >
      <div
        class="flex items-center justify-between px-5 py-4 border-b border-verse-200 dark:border-verse-800"
      >
        <h3 class="text-base font-semibold text-verse-900 dark:text-verse-50">
          {{ editingSession ? 'Edit session' : 'New session' }}
        </h3>
        <button
          type="button"
          class="p-1.5 text-verse-500 hover:text-verse-900 dark:hover:text-verse-100 rounded-lg transition-colors"
          aria-label="Close"
          @click="closeSessionForm"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <form
        class="p-5 space-y-4 overflow-y-auto max-h-[calc(85vh-130px)]"
        @submit.prevent="saveSession"
      >
        <AdminInput
          v-model="sessionForm.title"
          label="Title"
          required
          placeholder="e.g. Introduction to Vue 3"
          :error="sessionFormErrors.title"
        />
        <AdminTextarea
          v-model="sessionForm.description"
          label="Description"
          :rows="3"
          placeholder="What is this session about?"
        />
        <div class="grid grid-cols-[1fr_140px] gap-3">
          <AdminSelect v-model="sessionForm.kind" label="Type">
            <option v-for="opt in SESSION_KIND_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }} — {{ opt.hint }}
            </option>
          </AdminSelect>
          <AdminInput
            v-model="sessionForm.durationMinutes"
            label="Duration (min)"
            type="number"
            min="1"
            max="1440"
            placeholder="—"
          />
        </div>

        <AdminSelect v-if="showSponsor" v-model="sessionForm.sponsorId" label="Sponsor" required>
          <option :value="null">— Pick a sponsor —</option>
          <option v-for="sp in sponsors" :key="sp.id" :value="sp.id">{{ sp.name }}</option>
        </AdminSelect>
        <p
          v-if="showSponsor && sponsors.length === 0"
          class="text-xs text-amber-600 dark:text-amber-400"
        >
          Attach sponsors to this event first (Sponsors panel).
        </p>

        <div v-if="showSpeakers">
          <label class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-1.5">
            Speakers
          </label>
          <div v-if="loadingSpeakers" class="text-center py-3 text-sm text-verse-500">
            Loading speakers…
          </div>
          <div v-else-if="availableSpeakers.length > 0">
            <AdminSearchInput v-model="speakerSearch" placeholder="Search speakers…" class="mb-2" />
            <div
              class="max-h-48 overflow-y-auto rounded-lg border border-verse-200 dark:border-verse-800"
            >
              <button
                v-for="speaker in filteredSpeakers"
                :key="speaker.id"
                type="button"
                :class="[
                  'w-full flex items-center gap-3 p-2.5 text-left transition-colors',
                  isSpeakerSelected(speaker.id)
                    ? 'bg-verse-100 dark:bg-verse-800'
                    : 'hover:bg-verse-50 dark:hover:bg-verse-800/50',
                ]"
                @click="toggleSpeaker(speaker.id)"
              >
                <input
                  type="checkbox"
                  :checked="isSpeakerSelected(speaker.id)"
                  class="w-4 h-4 text-verse-600 border-verse-300 rounded focus:ring-verse-500 pointer-events-none"
                  tabindex="-1"
                />
                <AdminAvatar :src="speaker.avatarUrl" :name="speaker.name" size="sm" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-verse-900 dark:text-verse-100 truncate">
                    {{ speaker.name }}
                  </p>
                  <p
                    v-if="speaker.email"
                    class="text-xs text-verse-500 dark:text-verse-300 truncate"
                  >
                    {{ speaker.email }}
                  </p>
                </div>
              </button>
              <p
                v-if="filteredSpeakers.length === 0"
                class="text-sm text-verse-500 dark:text-verse-300 py-3 text-center"
              >
                No speakers found.
              </p>
            </div>
            <p
              v-if="sessionForm.speakerIds.length > 0"
              class="mt-2 text-xs text-verse-500 dark:text-verse-300"
            >
              {{ sessionForm.speakerIds.length }} speaker(s) selected
            </p>
          </div>
          <p v-else class="text-sm text-verse-500 dark:text-verse-300 py-3 text-center">
            No speakers available. Members can be assigned as speakers.
          </p>
        </div>
      </form>

      <div
        class="flex items-center justify-end gap-2 px-5 py-3 border-t border-verse-200 dark:border-verse-800"
      >
        <AdminButton variant="secondary" @click="closeSessionForm">Cancel</AdminButton>
        <AdminButton
          type="submit"
          variant="primary"
          :loading="sessionFormProcessing"
          @click="saveSession"
        >
          {{ editingSession ? 'Update session' : 'Create session' }}
        </AdminButton>
      </div>
    </dialog>
  </AdminShell>

  <AdminConfirmModal
    :open="!!sessionToDelete"
    title="Delete session"
    :loading="isDeletingSession"
    confirm-label="Delete session"
    @cancel="sessionToDelete = null"
    @confirm="deleteSession"
  >
    Are you sure you want to delete
    <strong class="text-verse-900 dark:text-verse-100">{{ sessionToDelete?.title }}</strong
    >?
  </AdminConfirmModal>
</template>
