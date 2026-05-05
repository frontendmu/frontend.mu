<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link, router } from '@inertiajs/vue3'
import AdminShell from '~/components/admin/ui/AdminShell.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminButton from '~/components/admin/ui/AdminButton.vue'
import AdminBadge from '~/components/admin/ui/AdminBadge.vue'
import AdminTable from '~/components/admin/ui/AdminTable.vue'
import AdminFilterChips from '~/components/admin/ui/AdminFilterChips.vue'
import AdminEmptyState from '~/components/admin/ui/AdminEmptyState.vue'
import AdminConfirmModal from '~/components/admin/ui/AdminConfirmModal.vue'
import { useAuth } from '~/composables/use_auth'
import { useDeleteConfirmation } from '~/composables/use_delete_confirmation'

interface Sponsor {
  id: string
  name: string
  website: string | null
  description: string | null
  logoUrl: string | null
  sponsorTypes: string[]
  logoBg: string | null
  status: 'active' | 'inactive'
}

interface Props {
  sponsors: Sponsor[]
  statusFilter: string
}

const props = defineProps<Props>()
const { isSuperadmin: canDelete } = useAuth()
const {
  showModal: showDeleteModal,
  itemToDelete: sponsorToDelete,
  isDeleting,
  confirmDelete,
  cancelDelete,
  executeDelete,
} = useDeleteConfirmation<Sponsor>()

const filterChips = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
]

const currentStatus = computed({
  get: () => props.statusFilter,
  set: (v) => router.get('/admin/sponsors', { status: v }, { preserveState: true }),
})

function doDelete() {
  if (!sponsorToDelete.value) return
  executeDelete(`/admin/sponsors/${sponsorToDelete.value.id}`)
}
</script>

<template>
  <Head title="Sponsors · Admin" />
  <AdminShell title="Sponsors" description="Track sponsors, partnerships and how they show up across events.">
    <template #actions>
      <AdminButton href="/admin/sponsors/create" variant="primary">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add sponsor
      </AdminButton>
    </template>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
      <AdminFilterChips
        v-model="currentStatus"
        :chips="filterChips"
        aria-label="Filter by status"
      />
      <p class="text-xs font-mono text-verse-500 dark:text-verse-300 tabular-nums">
        {{ sponsors.length }} sponsor{{ sponsors.length === 1 ? '' : 's' }}
      </p>
    </div>

    <AdminCard :padded="false">
      <AdminTable
        v-if="sponsors.length"
        :columns="[
          { label: 'Sponsor' },
          { label: 'Types' },
          { label: 'Status' },
          { label: 'Actions', align: 'right' },
        ]"
      >
        <tr
          v-for="sponsor in sponsors"
          :key="sponsor.id"
          class="hover:bg-verse-50/50 dark:hover:bg-verse-800/40 transition-colors"
        >
          <td class="px-5 py-3.5">
            <div class="flex items-center gap-3 min-w-0">
              <div
                v-if="sponsor.logoUrl"
                :class="[
                  'w-10 h-10 rounded-xl flex items-center justify-center p-1 border border-verse-100 dark:border-verse-800 shrink-0',
                  sponsor.logoBg ? '' : 'bg-white dark:bg-white',
                ]"
                :style="sponsor.logoBg ? { backgroundColor: sponsor.logoBg } : {}"
              >
                <img
                  :src="sponsor.logoUrl"
                  :alt="sponsor.name"
                  class="max-w-full max-h-full object-contain"
                />
              </div>
              <div
                v-else
                class="w-10 h-10 rounded-xl bg-verse-100 dark:bg-verse-800 flex items-center justify-center text-verse-500 shrink-0"
                aria-hidden="true"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div class="min-w-0">
                <Link
                  :href="`/admin/sponsors/${sponsor.id}/edit`"
                  class="font-medium text-verse-900 dark:text-verse-50 hover:underline decoration-coral-strong decoration-2 underline-offset-4 truncate block"
                >
                  {{ sponsor.name }}
                </Link>
                <p
                  v-if="sponsor.website"
                  class="text-xs text-verse-500 dark:text-verse-300 truncate max-w-[280px]"
                >
                  {{ sponsor.website }}
                </p>
              </div>
            </div>
          </td>
          <td class="px-5 py-3.5">
            <div class="flex flex-wrap gap-1">
              <AdminBadge
                v-for="type in sponsor.sponsorTypes"
                :key="type"
                tone="muted"
              >
                {{ type }}
              </AdminBadge>
              <span
                v-if="!sponsor.sponsorTypes?.length"
                class="text-verse-400 dark:text-verse-500 text-sm"
              >—</span>
            </div>
          </td>
          <td class="px-5 py-3.5">
            <AdminBadge :tone="sponsor.status === 'active' ? 'success' : 'muted'" dot>
              {{ sponsor.status }}
            </AdminBadge>
          </td>
          <td class="px-5 py-3.5">
            <div class="flex items-center justify-end gap-1">
              <AdminButton
                :href="`/sponsor/${sponsor.id}`"
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
                :href="`/admin/sponsors/${sponsor.id}/edit`"
                variant="ghost"
                size="sm"
                icon-only
                title="Edit sponsor"
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
                title="Delete sponsor"
                aria-label="Delete sponsor"
                @click="confirmDelete(sponsor)"
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
          statusFilter !== 'all' ? `No ${statusFilter} sponsors` : 'No sponsors yet'
        "
        :description="
          statusFilter !== 'all'
            ? 'Try a different filter, or clear filters to see them all.'
            : 'Add your first sponsor to get started.'
        "
        icon="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      >
        <template #actions>
          <AdminButton
            v-if="statusFilter !== 'all'"
            href="/admin/sponsors"
            variant="secondary"
          >
            Clear filters
          </AdminButton>
          <AdminButton href="/admin/sponsors/create" variant="primary">
            Add sponsor
          </AdminButton>
        </template>
      </AdminEmptyState>
    </AdminCard>
  </AdminShell>

  <AdminConfirmModal
    :open="showDeleteModal"
    title="Delete sponsor"
    :loading="isDeleting"
    confirm-label="Delete sponsor"
    @cancel="cancelDelete"
    @confirm="doDelete"
  >
    Are you sure you want to delete
    <strong class="text-verse-900 dark:text-verse-100">{{ sponsorToDelete?.name }}</strong
    >? This action cannot be undone.
  </AdminConfirmModal>
</template>
