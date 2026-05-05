<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link, router } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import AdminShell from '~/components/admin/ui/AdminShell.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminBadge from '~/components/admin/ui/AdminBadge.vue'
import AdminButton from '~/components/admin/ui/AdminButton.vue'
import AdminTable from '~/components/admin/ui/AdminTable.vue'
import AdminFilterChips from '~/components/admin/ui/AdminFilterChips.vue'
import AdminEmptyState from '~/components/admin/ui/AdminEmptyState.vue'
import AdminConfirmModal from '~/components/admin/ui/AdminConfirmModal.vue'
import { useAuth } from '~/composables/use_auth'
import { useDeleteConfirmation } from '~/composables/use_delete_confirmation'
import { formatEventDate } from '~/utils/date'

interface Props {
  events: Data.Event.Variants['forAdminIndex'][]
  statusFilter: string
}

const props = defineProps<Props>()
const { isSuperadmin: canDelete } = useAuth()
const {
  showModal: showDeleteModal,
  itemToDelete: eventToDelete,
  isDeleting,
  confirmDelete,
  cancelDelete,
  executeDelete,
} = useDeleteConfirmation<Data.Event.Variants['forAdminIndex']>()

const filterChips = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Draft' },
  { key: 'cancelled', label: 'Cancelled' },
]

const currentStatus = computed({
  get: () => props.statusFilter,
  set: (value) => router.get('/admin/events', { status: value }, { preserveState: true }),
})

function statusTone(status: string) {
  if (status === 'published') return 'success'
  if (status === 'draft') return 'warning'
  if (status === 'cancelled') return 'danger'
  return 'neutral'
}

function doDelete() {
  if (!eventToDelete.value) return
  executeDelete(`/admin/events/${eventToDelete.value.id}`)
}
</script>

<template>
  <Head title="Events · Admin" />
  <AdminShell title="Events" description="Manage upcoming meetups, drafts and archived events.">
    <template #actions>
      <AdminButton href="/admin/events/create" variant="primary">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New event
      </AdminButton>
    </template>

    <div class="flex flex-col gap-4 mb-5 sm:flex-row sm:items-center sm:justify-between">
      <AdminFilterChips
        v-model="currentStatus"
        :chips="filterChips"
        aria--label="Filter by status"
      />
      <p class="text-xs font-mono text-verse-500 dark:text-verse-400 tabular-nums">
        Showing {{ events.length }} event{{ events.length === 1 ? '' : 's' }}
      </p>
    </div>

    <AdminCard :padded="false">
      <AdminTable
        v-if="events.length"
        :columns="[
          { label: 'Event' },
          { label: 'Date' },
          { label: 'Status' },
          { label: 'RSVP' },
          { label: 'Actions', align: 'right' },
        ]"
      >
        <tr
          v-for="event in events"
          :key="event.id"
          class="hover:bg-verse-50/50 dark:hover:bg-verse-800/40 transition-colors"
        >
          <td class="px-5 py-3.5">
            <div class="flex flex-col">
              <Link
                :href="`/admin/events/${event.id}/edit`"
                class="font-medium text-verse-900 dark:text-verse-50 hover:underline decoration-coral-strong decoration-2 underline-offset-4"
              >
                {{ event.title }}
              </Link>
              <span v-if="event.venue" class="text-xs text-verse-500 dark:text-verse-400 mt-0.5">
                {{ event.venue }}
              </span>
            </div>
          </td>
          <td class="px-5 py-3.5 text-sm text-verse-600 dark:text-verse-300 whitespace-nowrap">
            {{ formatEventDate(event.date) }}
          </td>
          <td class="px-5 py-3.5">
            <AdminBadge :tone="statusTone(event.status)" dot>{{ event.status }}</AdminBadge>
          </td>
          <td class="px-5 py-3.5">
            <AdminBadge :tone="event.acceptingRsvp ? 'info' : 'muted'">
              {{ event.acceptingRsvp ? 'Open' : 'Closed' }}
            </AdminBadge>
          </td>
          <td class="px-5 py-3.5">
            <div class="flex items-center justify-end gap-1">
              <AdminButton
                :href="`/meetup/${event.slug || event.id}`"
                variant="ghost"
                size="sm"
                icon-only
                title="View public page"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </AdminButton>
              <AdminButton
                :href="`/admin/events/${event.slug || event.id}/attendees`"
                variant="ghost"
                size="sm"
                icon-only
                title="View attendees"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </AdminButton>
              <AdminButton
                :href="`/admin/events/${event.id}/edit`"
                variant="ghost"
                size="sm"
                icon-only
                title="Edit event"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </AdminButton>
              <button
                v-if="canDelete"
                type="button"
                class="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title="Delete event"
                aria-label="Delete event"
                @click="confirmDelete(event)"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </AdminTable>

      <AdminEmptyState
        v-else
        :title="
          statusFilter !== 'all'
            ? `No ${statusFilter} events`
            : 'No events yet'
        "
        :description="
          statusFilter !== 'all'
            ? `Try a different filter, or clear filters to see all events.`
            : 'Create your first event to get started.'
        "
        icon="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
      >
        <template #actions>
          <AdminButton
            v-if="statusFilter !== 'all'"
            href="/admin/events"
            variant="secondary"
          >
            Clear filters
          </AdminButton>
          <AdminButton href="/admin/events/create" variant="primary">
            New event
          </AdminButton>
        </template>
      </AdminEmptyState>
    </AdminCard>
  </AdminShell>

  <AdminConfirmModal
    :open="showDeleteModal"
    title="Delete event"
    :loading="isDeleting"
    confirm-label="Delete event"
    @cancel="cancelDelete"
    @confirm="doDelete"
  >
    Are you sure you want to delete
    <strong class="text-verse-900 dark:text-verse-100">{{ eventToDelete?.title }}</strong
    >? This action cannot be undone.
  </AdminConfirmModal>
</template>
