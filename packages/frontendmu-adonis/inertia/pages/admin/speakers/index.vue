<script setup lang="ts">
import { computed, ref } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import AdminShell from '~/components/admin/ui/AdminShell.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminButton from '~/components/admin/ui/AdminButton.vue'
import AdminBadge from '~/components/admin/ui/AdminBadge.vue'
import AdminAvatar from '~/components/admin/ui/AdminAvatar.vue'
import AdminSearchInput from '~/components/admin/ui/AdminSearchInput.vue'
import AdminEmptyState from '~/components/admin/ui/AdminEmptyState.vue'
import AdminConfirmModal from '~/components/admin/ui/AdminConfirmModal.vue'
import { useAuth } from '~/composables/use_auth'
import { useDeleteConfirmation } from '~/composables/use_delete_confirmation'

interface Props {
  speakers: Data.Speaker.Variants['forAdminIndex'][]
}

const props = defineProps<Props>()
const { isSuperadmin: canDelete } = useAuth()
const {
  showModal: showDeleteModal,
  itemToDelete: speakerToDelete,
  isDeleting,
  confirmDelete,
  cancelDelete,
  executeDelete,
} = useDeleteConfirmation<Data.Speaker.Variants['forAdminIndex']>()

const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.speakers
  return props.speakers.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      (s.githubUsername?.toLowerCase().includes(q) ?? false)
  )
})

function doDelete() {
  if (!speakerToDelete.value) return
  executeDelete(`/admin/speakers/${speakerToDelete.value.id}`)
}
</script>

<template>
  <Head title="Speakers · Admin" />
  <AdminShell title="Speakers" description="Curate the people who lead sessions across our meetups.">
    <template #actions>
      <AdminButton href="/admin/speakers/create" variant="primary">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add speaker
      </AdminButton>
    </template>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
      <p class="text-xs font-mono text-verse-500 dark:text-verse-300 tabular-nums">
        {{ filtered.length }} speaker{{ filtered.length === 1 ? '' : 's' }}
      </p>
      <div class="sm:w-72">
        <AdminSearchInput v-model="search" placeholder="Search by name or GitHub" />
      </div>
    </div>

    <div
      v-if="filtered.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
    >
      <AdminCard
        v-for="speaker in filtered"
        :key="speaker.id"
        padded
        interactive
      >
        <div class="flex items-start gap-3">
          <AdminAvatar
            :src="speaker.avatarUrl"
            :name="speaker.name"
            size="lg"
            rounded="xl"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-semibold text-verse-900 dark:text-verse-50 truncate">
                {{ speaker.name }}
              </h3>
              <AdminBadge v-if="speaker.featured" tone="accent">Featured</AdminBadge>
            </div>
            <p
              v-if="speaker.githubUsername"
              class="text-sm text-verse-500 dark:text-verse-300 truncate mt-0.5"
            >
              @{{ speaker.githubUsername }}
            </p>
            <p class="text-xs font-mono text-verse-500 dark:text-verse-300 mt-1.5 uppercase tracking-wide">
              {{ speaker.sessionCount }} session{{ speaker.sessionCount === 1 ? '' : 's' }}
            </p>
          </div>
        </div>

        <template #footer>
          <Link
            :href="`/speaker/${speaker.id}`"
            class="text-sm font-medium text-verse-700 dark:text-verse-200 hover:text-verse-900 dark:hover:text-white"
          >
            View profile
          </Link>
          <div class="flex items-center gap-1">
            <AdminButton
              :href="`/admin/users/${speaker.id}/edit`"
              variant="ghost"
              size="sm"
              icon-only
              title="Edit speaker"
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
              title="Delete speaker"
              aria-label="Delete speaker"
              @click="confirmDelete(speaker)"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </template>
      </AdminCard>
    </div>

    <AdminCard v-else :padded="false">
      <AdminEmptyState
        :title="search ? 'No speakers match your search' : 'No speakers yet'"
        :description="
          search
            ? 'Try a different name or GitHub handle.'
            : 'Add your first speaker to get started.'
        "
        icon="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
      >
        <template #actions>
          <AdminButton v-if="search" variant="secondary" @click="search = ''">
            Clear search
          </AdminButton>
          <AdminButton href="/admin/speakers/create" variant="primary">
            Add speaker
          </AdminButton>
        </template>
      </AdminEmptyState>
    </AdminCard>
  </AdminShell>

  <AdminConfirmModal
    :open="showDeleteModal"
    title="Delete speaker"
    :loading="isDeleting"
    confirm-label="Delete speaker"
    @cancel="cancelDelete"
    @confirm="doDelete"
  >
    Are you sure you want to delete
    <strong class="text-verse-900 dark:text-verse-100">{{ speakerToDelete?.name }}</strong
    >? This will also remove them from all sessions.
  </AdminConfirmModal>
</template>
