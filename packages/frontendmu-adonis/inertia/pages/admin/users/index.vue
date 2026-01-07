<script setup lang="ts">
import { ref, computed } from 'vue'
import { Head, Link, router, usePage } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

type AppRole = 'viewer' | 'member' | 'organizer' | 'superadmin'

interface User {
  id: string
  name: string
  email: string | null
  githubUsername: string | null
  role: AppRole
  avatarUrl: string | null
  featured: boolean
  isOrganizer: boolean
  isCommunityMember: boolean
  createdAt: string
}

interface Counts {
  all: number
  viewer: number
  member: number
  organizer: number
  superadmin: number
}

interface Props {
  users: User[]
  roleFilter: string
  search: string
  counts: Counts
}

const props = defineProps<Props>()
const page = usePage()
const currentUser = computed(() => page.props.auth.user as any)

// Search input
const searchInput = ref(props.search)

// Delete confirmation state
const showDeleteModal = ref(false)
const userToDelete = ref<User | null>(null)
const isDeleting = ref(false)

// Role badge styles
const getRoleBadge = (role: string) => {
  switch (role) {
    case 'superadmin':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    case 'organizer':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    case 'member':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}

// Filter by role
function filterByRole(role: string) {
  router.get('/admin/users', { role, search: searchInput.value }, { preserveState: true })
}

// Search
function handleSearch() {
  router.get('/admin/users', { role: props.roleFilter, search: searchInput.value }, { preserveState: true })
}

// Delete handlers
function confirmDelete(user: User) {
  userToDelete.value = user
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  userToDelete.value = null
}

function executeDelete() {
  if (!userToDelete.value) return
  
  isDeleting.value = true
  router.delete(`/admin/users/${userToDelete.value.id}`, {
    onFinish: () => {
      isDeleting.value = false
      showDeleteModal.value = false
      userToDelete.value = null
    },
  })
}

// Check if user can be deleted (not self)
function canDeleteUser(user: User) {
  return user.id !== currentUser.value?.id
}

// Format date
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <Head title="Manage Users" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <BaseHeading :level="1">Manage Users</BaseHeading>
            <p class="text-verse-600 dark:text-verse-400 mt-2">
              View and manage user accounts and roles.
            </p>
          </div>
        </div>

        <!-- Search -->
        <div class="mb-6">
          <form @submit.prevent="handleSearch" class="flex gap-2">
            <input
              v-model="searchInput"
              type="text"
              placeholder="Search by name, email, or GitHub username..."
              class="flex-1 px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
            <button
              type="submit"
              class="px-4 py-2 bg-verse-600 hover:bg-verse-700 text-white font-medium rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button
            @click="filterByRole('all')"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              roleFilter === 'all'
                ? 'bg-verse-600 text-white'
                : 'bg-verse-100 dark:bg-verse-800 text-verse-700 dark:text-verse-300 hover:bg-verse-200 dark:hover:bg-verse-700'
            ]"
          >
            All ({{ counts.all }})
          </button>
          <button
            @click="filterByRole('superadmin')"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              roleFilter === 'superadmin'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
            ]"
          >
            Superadmin ({{ counts.superadmin }})
          </button>
          <button
            @click="filterByRole('organizer')"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              roleFilter === 'organizer'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
            ]"
          >
            Organizer ({{ counts.organizer }})
          </button>
          <button
            @click="filterByRole('member')"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              roleFilter === 'member'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
            ]"
          >
            Member ({{ counts.member }})
          </button>
          <button
            @click="filterByRole('viewer')"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              roleFilter === 'viewer'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            Viewer ({{ counts.viewer }})
          </button>
        </div>

        <!-- Users Table -->
        <div class="bg-white dark:bg-verse-800/50 rounded-xl border border-verse-200 dark:border-verse-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-verse-50 dark:bg-verse-800 border-b border-verse-200 dark:border-verse-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider">
                    User
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-verse-200 dark:divide-verse-700">
                <tr
                  v-for="user in users"
                  :key="user.id"
                  class="hover:bg-verse-50 dark:hover:bg-verse-800/80 transition-colors"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <img
                        v-if="user.avatarUrl"
                        :src="user.avatarUrl"
                        :alt="user.name"
                        class="w-10 h-10 rounded-full object-cover"
                      />
                      <div
                        v-else
                        class="w-10 h-10 rounded-full bg-verse-200 dark:bg-verse-700 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-verse-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <span class="font-medium text-verse-900 dark:text-verse-100">
                          {{ user.name }}
                        </span>
                        <p v-if="user.githubUsername" class="text-xs text-verse-500 dark:text-verse-400">
                          @{{ user.githubUsername }}
                        </p>
                      </div>
                      <span
                        v-if="user.id === currentUser?.id"
                        class="px-2 py-0.5 text-xs font-medium bg-verse-200 dark:bg-verse-700 text-verse-600 dark:text-verse-300 rounded"
                      >
                        You
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-verse-600 dark:text-verse-400">
                    {{ user.email || '-' }}
                  </td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                        getRoleBadge(user.role)
                      ]"
                    >
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-verse-600 dark:text-verse-400">
                    {{ formatDate(user.createdAt) }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <Link
                        :href="`/admin/users/${user.id}/edit`"
                        class="p-2 text-verse-500 hover:text-verse-700 dark:text-verse-400 dark:hover:text-verse-200 transition-colors"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </Link>
                      <button
                        v-if="canDeleteUser(user)"
                        @click="confirmDelete(user)"
                        class="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty state -->
          <div v-if="!users.length" class="px-6 py-12 text-center">
            <p class="text-verse-500 dark:text-verse-400">
              No users found<span v-if="roleFilter !== 'all'"> with role "{{ roleFilter }}"</span><span v-if="search"> matching "{{ search }}"</span>.
            </p>
          </div>
        </div>
      </div>
    </ContentBlock>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/50" @click="cancelDelete" />
        <div class="relative bg-white dark:bg-verse-800 rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold text-verse-900 dark:text-verse-100 mb-2">
            Delete User
          </h3>
          <p class="text-verse-600 dark:text-verse-400 mb-4">
            Are you sure you want to delete "<strong>{{ userToDelete?.name }}</strong>"? This action cannot be undone.
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="cancelDelete"
              :disabled="isDeleting"
              class="px-4 py-2 text-sm font-medium text-verse-700 dark:text-verse-300 bg-verse-100 dark:bg-verse-700 hover:bg-verse-200 dark:hover:bg-verse-600 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="executeDelete"
              :disabled="isDeleting"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <span v-if="isDeleting">Deleting...</span>
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </DefaultLayout>
</template>
