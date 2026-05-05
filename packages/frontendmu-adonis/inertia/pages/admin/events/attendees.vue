<script setup lang="ts">
import { computed, ref } from 'vue'
import { Head } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import AdminShell from '~/components/admin/ui/AdminShell.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminButton from '~/components/admin/ui/AdminButton.vue'
import AdminBadge from '~/components/admin/ui/AdminBadge.vue'
import AdminAvatar from '~/components/admin/ui/AdminAvatar.vue'
import AdminTable from '~/components/admin/ui/AdminTable.vue'
import AdminFilterChips from '~/components/admin/ui/AdminFilterChips.vue'
import AdminSearchInput from '~/components/admin/ui/AdminSearchInput.vue'
import AdminStatGrid from '~/components/admin/ui/AdminStatGrid.vue'
import AdminEmptyState from '~/components/admin/ui/AdminEmptyState.vue'
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

const stats = computed(() => [
  { label: 'Total', value: props.counts.total },
  { label: 'Confirmed', value: props.counts.confirmed, tone: 'success' as const },
  { label: 'Waitlist', value: props.counts.waitlist, tone: 'warning' as const },
  { label: 'Cancelled', value: props.counts.cancelled, tone: 'danger' as const },
])

const filterChips = computed(() => [
  { key: 'all', label: 'All', count: props.counts.total },
  { key: 'confirmed', label: 'Confirmed', count: props.counts.confirmed },
  { key: 'waitlist', label: 'Waitlist', count: props.counts.waitlist },
  { key: 'cancelled', label: 'Cancelled', count: props.counts.cancelled },
])

function statusTone(status: RsvpStatus) {
  if (status === 'confirmed') return 'success'
  if (status === 'waitlist') return 'warning'
  return 'danger'
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
  <AdminShell
    :title="event.title"
    description="Who has RSVP'd, when they signed up, and how to reach them."
    :breadcrumbs="[
      { label: 'Admin', href: '/admin' },
      { label: 'Events', href: '/admin/events' },
      { label: event.title, href: `/admin/events/${event.id}/edit` },
      { label: 'Attendees' },
    ]"
  >
    <template #meta>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-verse-600 dark:text-verse-300">
        <span>{{ formatEventDate(event.date) }}</span>
        <span v-if="event.startTime">
          {{ event.startTime
          }}<span v-if="event.endTime"> – {{ event.endTime }}</span>
        </span>
        <span v-if="event.venue">{{ event.venue }}</span>
        <span v-if="event.seatsAvailable !== null" class="text-verse-500 dark:text-verse-400">
          Capacity {{ counts.confirmed }} / {{ event.seatsAvailable }}
        </span>
      </div>
    </template>
    <template #actions>
      <AdminButton :href="`/meetup/${event.slug || event.id}`" variant="secondary">
        View public
      </AdminButton>
      <AdminButton :href="`/admin/events/${event.id}/edit`" variant="secondary">
        Edit event
      </AdminButton>
      <AdminButton
        variant="primary"
        :disabled="!attendees.length"
        @click="exportCsv"
      >
        Export CSV
      </AdminButton>
    </template>

    <section class="mb-6">
      <AdminStatGrid :stats="stats" />
    </section>

    <AdminCard title="RSVP timeline" description="Sign-ups over time, plus event date and capacity." class="mb-6">
      <RsvpTimelineChart
        :rsvped-at-list="activeRsvpedAtList"
        :rsvp-open-at="timeline.rsvpOpenAt"
        :rsvp-close-at="timeline.rsvpCloseAt"
        :event-at="timeline.eventAt"
        :seats-available="event.seatsAvailable"
        bare
      />
    </AdminCard>

    <div class="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
      <AdminFilterChips
        v-model="statusFilter"
        :chips="filterChips"
        aria-label="Filter by RSVP status"
      />
      <div class="lg:w-72">
        <AdminSearchInput
          v-model="search"
          placeholder="Search name, email or GitHub"
          label="Search attendees"
        />
      </div>
    </div>

    <AdminCard :padded="false">
      <AdminTable
        v-if="filtered.length"
        :columns="[
          { label: 'Attendee' },
          { label: 'Email' },
          { label: 'GitHub' },
          { label: 'Status' },
          { label: 'RSVP’ed at' },
          { label: 'Notes' },
        ]"
      >
        <tr
          v-for="attendee in filtered"
          :key="attendee.rsvpId"
          class="hover:bg-verse-50/50 dark:hover:bg-verse-800/40 transition-colors"
        >
          <td class="px-5 py-3">
            <div class="flex items-center gap-3 min-w-0">
              <AdminAvatar
                :src="attendee.user?.avatarUrl"
                :name="attendee.user?.name ?? '?'"
                size="sm"
              />
              <span class="font-medium text-verse-900 dark:text-verse-50 truncate">
                {{ attendee.user?.name ?? 'Deleted user' }}
              </span>
            </div>
          </td>
          <td class="px-5 py-3 text-sm text-verse-700 dark:text-verse-300">
            <a
              v-if="attendee.user?.email"
              :href="`mailto:${attendee.user.email}`"
              class="hover:underline decoration-coral-strong decoration-2 underline-offset-4"
            >{{ attendee.user.email }}</a>
            <span v-else class="text-verse-400 dark:text-verse-500">—</span>
          </td>
          <td class="px-5 py-3 text-sm text-verse-700 dark:text-verse-300">
            <a
              v-if="attendee.user?.githubUsername"
              :href="`https://github.com/${attendee.user.githubUsername}`"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:underline"
            >@{{ attendee.user.githubUsername }}</a>
            <span v-else class="text-verse-400 dark:text-verse-500">—</span>
          </td>
          <td class="px-5 py-3">
            <AdminBadge :tone="statusTone(attendee.status)" dot>{{ attendee.status }}</AdminBadge>
          </td>
          <td class="px-5 py-3 text-sm text-verse-600 dark:text-verse-400 whitespace-nowrap">
            {{ formatRsvpedAt(attendee.rsvpedAt) }}
          </td>
          <td class="px-5 py-3 text-sm text-verse-600 dark:text-verse-400 max-w-xs">
            <span v-if="attendee.notes" class="line-clamp-2">{{ attendee.notes }}</span>
            <span v-else class="text-verse-400 dark:text-verse-500">—</span>
          </td>
        </tr>
      </AdminTable>

      <AdminEmptyState
        v-else
        :title="
          !attendees.length ? 'No RSVPs yet' : 'No attendees match your filters'
        "
        :description="
          !attendees.length
            ? 'Once people RSVP, they will show up here.'
            : 'Try a different filter or clear your search.'
        "
        icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
      >
        <template #actions>
          <AdminButton
            v-if="attendees.length && (search || statusFilter !== 'all')"
            variant="secondary"
            @click="
              () => {
                search = ''
                statusFilter = 'all'
              }
            "
          >
            Clear filters
          </AdminButton>
        </template>
      </AdminEmptyState>
    </AdminCard>
  </AdminShell>
</template>
