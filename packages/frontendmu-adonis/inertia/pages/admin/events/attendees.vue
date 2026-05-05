<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import { computed, ref } from 'vue'
import type { Data } from '@generated/data'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
import RsvpTimelineChart from '~/components/admin/RsvpTimelineChart.vue'
import { formatEventDate } from '~/utils/date'

type RsvpStatus = 'confirmed' | 'waitlist' | 'cancelled'
type StatusFilter = 'all' | RsvpStatus

interface Attendee {
  rsvpId: string
  status: RsvpStatus
  notes: string | null
  rsvpedAt: string | null
  user: {
    id: string
    name: string
    email: string
    githubUsername: string | null
    avatarUrl: string | null
  } | null
}

interface Timeline {
  rsvpOpenAt: string | null
  rsvpCloseAt: string | null
  eventAt: string | null
}

interface Props {
  event: Data.Event.Variants['detail']
  attendees: Attendee[]
  counts: {
    total: number
    confirmed: number
    waitlist: number
    cancelled: number
  }
  timeline: Timeline
}

const props = defineProps<Props>()

const search = ref('')
const statusFilter = ref<StatusFilter>('all')

const activeRsvpedAtList = computed(() =>
  props.attendees
    .filter((a) => a.status !== 'cancelled' && a.rsvpedAt)
    .map((a) => a.rsvpedAt as string)
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return props.attendees.filter((a) => {
    if (statusFilter.value !== 'all' && a.status !== statusFilter.value) return false
    if (!q) return true
    if (!a.user) return false
    return (
      a.user.name.toLowerCase().includes(q) ||
      a.user.email.toLowerCase().includes(q) ||
      (a.user.githubUsername?.toLowerCase().includes(q) ?? false)
    )
  })
})

const filterButtons = computed<
  { key: StatusFilter; label: string; count: number; activeClass: string }[]
>(() => [
  { key: 'all', label: 'All', count: props.counts.total, activeClass: 'bg-verse-600 text-white' },
  {
    key: 'confirmed',
    label: 'Confirmed',
    count: props.counts.confirmed,
    activeClass: 'bg-green-600 text-white',
  },
  {
    key: 'waitlist',
    label: 'Waitlist',
    count: props.counts.waitlist,
    activeClass: 'bg-yellow-600 text-white',
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    count: props.counts.cancelled,
    activeClass: 'bg-red-600 text-white',
  },
])

function statusBadge(status: RsvpStatus) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'waitlist':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  }
}

function formatRsvpedAt(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function exportCsv() {
  const rows = [
    ['Name', 'Email', 'GitHub', 'Status', 'RSVP’ed at', 'Notes'],
    ...props.attendees.map((a) => [
      a.user?.name ?? '',
      a.user?.email ?? '',
      a.user?.githubUsername ?? '',
      a.status,
      a.rsvpedAt ?? '',
      (a.notes ?? '').replace(/\r?\n/g, ' '),
    ]),
  ]
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? '')
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
        })
        .join(',')
    )
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `attendees-${props.event.slug || props.event.id}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <Head :title="`Attendees · ${event.title}`" />
  <main class="relative min-h-screen pt-40 pb-20">
    <ContentBlock>
      <!-- Breadcrumb -->
      <div class="mb-4 text-sm text-verse-500 dark:text-verse-400">
        <Link href="/admin" class="hover:text-verse-700 dark:hover:text-verse-200">Admin</Link>
        <span class="mx-1.5">/</span>
        <Link
          href="/admin/events"
          class="hover:text-verse-700 dark:hover:text-verse-200"
        >Events</Link>
        <span class="mx-1.5">/</span>
        <span class="text-verse-700 dark:text-verse-300">Attendees</span>
      </div>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div class="min-w-0">
          <BaseHeading :level="1">{{ event.title }}</BaseHeading>
          <div
            class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-verse-600 dark:text-verse-400"
          >
            <span>{{ formatEventDate(event.date) }}</span>
            <span v-if="event.startTime">{{ event.startTime }}<span v-if="event.endTime"> – {{ event.endTime }}</span></span>
            <span v-if="event.venue">{{ event.venue }}</span>
            <span
              v-if="event.seatsAvailable !== null"
              class="text-verse-500 dark:text-verse-400"
            >Capacity: {{ counts.confirmed }} / {{ event.seatsAvailable }}</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 shrink-0">
          <Link
            :href="`/meetup/${event.slug || event.id}`"
            class="inline-flex items-center gap-2 px-4 py-2 bg-verse-100 dark:bg-verse-800 hover:bg-verse-200 dark:hover:bg-verse-700 text-verse-700 dark:text-verse-200 text-sm font-medium squircle rounded-lg transition-colors"
          >
            View public page
          </Link>
          <Link
            :href="`/admin/events/${event.id}/edit`"
            class="inline-flex items-center gap-2 px-4 py-2 bg-verse-100 dark:bg-verse-800 hover:bg-verse-200 dark:hover:bg-verse-700 text-verse-700 dark:text-verse-200 text-sm font-medium squircle rounded-lg transition-colors"
          >
            Edit event
          </Link>
          <button
            type="button"
            :disabled="!attendees.length"
            @click="exportCsv"
            class="inline-flex items-center gap-2 px-4 py-2 bg-verse-600 hover:bg-verse-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium squircle rounded-lg transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          class="bg-white dark:bg-verse-800/50 squircle rounded-xl border border-verse-200 dark:border-verse-700 p-4"
        >
          <div class="text-2xl font-bold text-verse-900 dark:text-verse-100">{{ counts.total }}</div>
          <div class="text-sm text-verse-600 dark:text-verse-400">Total RSVPs</div>
        </div>
        <div
          class="bg-white dark:bg-verse-800/50 squircle rounded-xl border border-verse-200 dark:border-verse-700 p-4"
        >
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ counts.confirmed }}</div>
          <div class="text-sm text-verse-600 dark:text-verse-400">Confirmed</div>
        </div>
        <div
          class="bg-white dark:bg-verse-800/50 squircle rounded-xl border border-verse-200 dark:border-verse-700 p-4"
        >
          <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ counts.waitlist }}</div>
          <div class="text-sm text-verse-600 dark:text-verse-400">Waitlist</div>
        </div>
        <div
          class="bg-white dark:bg-verse-800/50 squircle rounded-xl border border-verse-200 dark:border-verse-700 p-4"
        >
          <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ counts.cancelled }}</div>
          <div class="text-sm text-verse-600 dark:text-verse-400">Cancelled</div>
        </div>
      </div>

      <!-- Timeline chart -->
      <RsvpTimelineChart
        :rsvped-at-list="activeRsvpedAtList"
        :rsvp-open-at="timeline.rsvpOpenAt"
        :rsvp-close-at="timeline.rsvpCloseAt"
        :event-at="timeline.eventAt"
        :seats-available="event.seatsAvailable"
      />

      <!-- Filters + search -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="btn in filterButtons"
            :key="btn.key"
            type="button"
            @click="statusFilter = btn.key"
            :class="[
              'px-3 py-1.5 squircle rounded-lg text-sm font-medium transition-colors',
              statusFilter === btn.key
                ? btn.activeClass
                : 'bg-verse-100 dark:bg-verse-800 text-verse-700 dark:text-verse-300 hover:bg-verse-200 dark:hover:bg-verse-700',
            ]"
          >
            {{ btn.label }}
            <span class="ml-1 opacity-70">{{ btn.count }}</span>
          </button>
        </div>

        <label class="relative w-full sm:w-72">
          <span class="sr-only">Search attendees</span>
          <input
            v-model="search"
            type="search"
            placeholder="Search name, email or GitHub"
            class="w-full px-3 py-2 bg-white dark:bg-verse-900 border border-verse-200 dark:border-verse-800 rounded-lg text-sm text-verse-900 dark:text-verse-100 placeholder-verse-400 focus:outline-none focus:ring-2 focus:ring-verse-500/40 focus:border-verse-500 transition-colors"
          />
        </label>
      </div>

      <!-- Table -->
      <div
        class="bg-white dark:bg-verse-800/50 squircle rounded-xl border border-verse-200 dark:border-verse-700 overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-verse-50 dark:bg-verse-800 border-b border-verse-200 dark:border-verse-700">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider"
                >
                  Attendee
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider"
                >
                  GitHub
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider"
                >
                  RSVP&rsquo;ed at
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider"
                >
                  Notes
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-verse-200 dark:divide-verse-700">
              <tr
                v-for="attendee in filtered"
                :key="attendee.rsvpId"
                class="hover:bg-verse-50 dark:hover:bg-verse-800/80 transition-colors"
              >
                <td class="px-6 py-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <img
                      v-if="attendee.user?.avatarUrl"
                      :src="attendee.user.avatarUrl"
                      :alt="attendee.user.name"
                      loading="lazy"
                      class="w-8 h-8 rounded-full object-cover bg-verse-100 dark:bg-verse-700 shrink-0"
                    />
                    <div
                      v-else
                      class="w-8 h-8 rounded-full bg-verse-100 dark:bg-verse-700 flex items-center justify-center text-xs font-semibold text-verse-600 dark:text-verse-300 shrink-0"
                    >
                      {{ (attendee.user?.name ?? '?').charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-medium text-verse-900 dark:text-verse-100 truncate">
                      {{ attendee.user?.name ?? 'Deleted user' }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-3 text-sm text-verse-700 dark:text-verse-300">
                  <a
                    v-if="attendee.user?.email"
                    :href="`mailto:${attendee.user.email}`"
                    class="hover:underline"
                  >{{ attendee.user.email }}</a>
                  <span v-else>—</span>
                </td>
                <td class="px-6 py-3 text-sm text-verse-700 dark:text-verse-300">
                  <a
                    v-if="attendee.user?.githubUsername"
                    :href="`https://github.com/${attendee.user.githubUsername}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:underline"
                  >@{{ attendee.user.githubUsername }}</a>
                  <span v-else class="text-verse-400 dark:text-verse-500">—</span>
                </td>
                <td class="px-6 py-3">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                      statusBadge(attendee.status),
                    ]"
                  >
                    {{ attendee.status }}
                  </span>
                </td>
                <td class="px-6 py-3 text-sm text-verse-600 dark:text-verse-400 whitespace-nowrap">
                  {{ formatRsvpedAt(attendee.rsvpedAt) }}
                </td>
                <td class="px-6 py-3 text-sm text-verse-600 dark:text-verse-400 max-w-xs">
                  <span v-if="attendee.notes" class="line-clamp-2">{{ attendee.notes }}</span>
                  <span v-else class="text-verse-400 dark:text-verse-500">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-if="!filtered.length" class="px-6 py-12 text-center">
          <p class="text-verse-500 dark:text-verse-400">
            <span v-if="!attendees.length">No RSVPs yet for this event.</span>
            <span v-else-if="search || statusFilter !== 'all'"
              >No attendees match the current filters.</span
            >
          </p>
          <button
            v-if="attendees.length && (search || statusFilter !== 'all')"
            type="button"
            @click="search = ''; statusFilter = 'all'"
            class="inline-block mt-2 text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200 underline"
          >
            Clear filters
          </button>
        </div>
      </div>
    </ContentBlock>
  </main>
</template>
