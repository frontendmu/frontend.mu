<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Head, router } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import AdminShell from '~/components/admin/ui/AdminShell.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminButton from '~/components/admin/ui/AdminButton.vue'
import AdminBadge from '~/components/admin/ui/AdminBadge.vue'
import AdminAvatar from '~/components/admin/ui/AdminAvatar.vue'
import AdminTable from '~/components/admin/ui/AdminTable.vue'
import AdminFilterChips from '~/components/admin/ui/AdminFilterChips.vue'
import AdminSearchInput from '~/components/admin/ui/AdminSearchInput.vue'
import AdminEmptyState from '~/components/admin/ui/AdminEmptyState.vue'
import AdminConfirmModal from '~/components/admin/ui/AdminConfirmModal.vue'
import { useAuth } from '~/composables/use_auth'
import { useDeleteConfirmation } from '~/composables/use_delete_confirmation'
import { formatEventDate } from '~/utils/date'

interface Props {
  users: Data.AdminUser.Variants['forAdminIndex'][]
  allRoles: Data.Role[]
  roleFilter: string
  search: string
  counts: Record<string, number>
}

const props = defineProps<Props>()
const { user: currentUser } = useAuth()
const {
  showModal: showDeleteModal,
  itemToDelete: userToDelete,
  isDeleting,
  confirmDelete,
  cancelDelete,
  executeDelete,
} = useDeleteConfirmation<Data.AdminUser.Variants['forAdminIndex']>()

const searchInput = ref(props.search)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(searchInput, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    router.get(
      '/admin/users',
      { role: props.roleFilter, search: value },
      { preserveState: true, replace: true }
    )
  }, 300)
})

const currentRole = computed({
  get: () => props.roleFilter,
  set: (value) =>
    router.get(
      '/admin/users',
      { role: value, search: searchInput.value },
      { preserveState: true, replace: true }
    ),
})

const filterChips = computed(() => {
  const all = [{ key: 'all', label: 'All', count: props.counts.all || 0 }]
  for (const role of props.allRoles) {
    all.push({
      key: role.name,
      label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
      count: props.counts[role.name] || 0,
    })
  }
  return all
})

function roleTone(name: string) {
  switch (name) {
    case 'superadmin':
      return 'danger'
    case 'organizer':
      return 'accent'
    case 'member':
      return 'info'
    case 'viewer':
      return 'muted'
    default:
      return 'neutral'
  }
}

function canDeleteUser(user: Data.AdminUser.Variants['forAdminIndex']) {
  return user.id !== currentUser.value?.id
}

function doDelete() {
  if (!userToDelete.value) return
  executeDelete(`/admin/users/${userToDelete.value.id}`)
}
</script>

<template>
  <Head title="Users · Admin" />
  <AdminShell title="Users" description="Manage accounts, roles and permissions for the community.">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5">
      <AdminFilterChips
        v-model="currentRole"
        :chips="filterChips"
        aria-label="Filter by role"
      />
      <div class="lg:w-80">
        <AdminSearchInput v-model="searchInput" placeholder="Name, email or GitHub" />
      </div>
    </div>

    <AdminCard :padded="false">
      <AdminTable
        v-if="users.length"
        :columns="[
          { label: 'User' },
          { label: 'Email' },
          { label: 'Roles' },
          { label: 'Joined' },
          { label: 'Actions', align: 'right' },
        ]"
      >
        <tr
          v-for="user in users"
          :key="user.id"
          class="hover:bg-verse-50/50 dark:hover:bg-verse-800/40 transition-colors"
        >
          <td class="px-5 py-3.5">
            <div class="flex items-center gap-3 min-w-0">
              <AdminAvatar :src="user.avatarUrl" :name="user.name" size="md" />
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-medium text-verse-900 dark:text-verse-50 truncate">
                    {{ user.name }}
                  </span>
                  <AdminBadge v-if="user.id === currentUser?.id" tone="muted">You</AdminBadge>
                </div>
                <p
                  v-if="user.githubUsername"
                  class="text-xs text-verse-500 dark:text-verse-300 truncate"
                >
                  @{{ user.githubUsername }}
                </p>
              </div>
            </div>
          </td>
          <td class="px-5 py-3.5 text-sm text-verse-700 dark:text-verse-300 truncate max-w-[260px]">
            {{ user.email || '—' }}
          </td>
          <td class="px-5 py-3.5">
            <div class="flex flex-wrap gap-1">
              <AdminBadge
                v-for="role in user.roles"
                :key="role.id"
                :tone="roleTone(role.name)"
              >
                {{ role.name }}
              </AdminBadge>
              <span
                v-if="!user.roles?.length"
                class="text-xs text-verse-400 dark:text-verse-500 italic"
              >
                No roles
              </span>
            </div>
          </td>
          <td class="px-5 py-3.5 text-sm text-verse-600 dark:text-verse-300 whitespace-nowrap">
            {{ formatEventDate(user.createdAt) }}
          </td>
          <td class="px-5 py-3.5">
            <div class="flex items-center justify-end gap-1">
              <AdminButton
                :href="`/admin/users/${user.id}/edit`"
                variant="ghost"
                size="sm"
                icon-only
                title="Edit user"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </AdminButton>
              <button
                v-if="canDeleteUser(user)"
                type="button"
                class="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title="Delete user"
                aria-label="Delete user"
                @click="confirmDelete(user)"
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
        title="No users match your filters"
        :description="
          search || roleFilter !== 'all'
            ? 'Try a different role or clear your search.'
            : 'No users found.'
        "
        icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
      >
        <template #actions>
          <AdminButton
            v-if="search || roleFilter !== 'all'"
            variant="secondary"
            @click="
              () => {
                searchInput = ''
                currentRole = 'all'
              }
            "
          >
            Clear filters
          </AdminButton>
        </template>
      </AdminEmptyState>
    </AdminCard>
  </AdminShell>

  <AdminConfirmModal
    :open="showDeleteModal"
    title="Delete user"
    :loading="isDeleting"
    confirm-label="Delete user"
    @cancel="cancelDelete"
    @confirm="doDelete"
  >
    Are you sure you want to delete
    <strong class="text-verse-900 dark:text-verse-100">{{ userToDelete?.name }}</strong
    >? This action cannot be undone.
  </AdminConfirmModal>
</template>
