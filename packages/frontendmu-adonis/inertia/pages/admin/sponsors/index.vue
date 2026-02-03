<script setup lang="ts">
import { ref, computed } from 'vue'
import { Head, Link, router, usePage } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

interface Sponsor {
  id: string
  name: string
  website: string | null
  description: string | null
  logoUrl: string | null
  sponsorTypes: string[]
  darkbg: boolean
  status: 'active' | 'inactive'
}

interface Props {
  sponsors: Sponsor[]
  statusFilter: string
}

const props = defineProps<Props>()
const page = usePage()
const user = computed(() => page.props.auth.user)

// Check if user is superadmin (only superadmins can delete)
const canDelete = computed(() => {
  if (!user.value) return false
  return (user.value as any).role === 'superadmin'
})

// Delete confirmation state
const showDeleteModal = ref(false)
const sponsorToDelete = ref<Sponsor | null>(null)
const isDeleting = ref(false)

// Status badge styles
const getStatusBadge = (status: string) => {
  return status === 'active'
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}

// Filter by status
function filterByStatus(status: string) {
  router.get('/admin/sponsors', { status }, { preserveState: true })
}

// Delete handlers
function confirmDelete(sponsor: Sponsor) {
  sponsorToDelete.value = sponsor
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  sponsorToDelete.value = null
}

function executeDelete() {
  if (!sponsorToDelete.value) return
  
  isDeleting.value = true
  router.delete(`/admin/sponsors/${sponsorToDelete.value.id}`, {
    onFinish: () => {
      isDeleting.value = false
      showDeleteModal.value = false
      sponsorToDelete.value = null
    },
  })
}
</script>

<template>
  <Head title="Manage Sponsors" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <BaseHeading :level="1">Manage Sponsors</BaseHeading>
            <p class="text-verse-600 dark:text-verse-400 mt-2">
              View and manage sponsor profiles.
            </p>
          </div>
          <Link
            href="/admin/sponsors/create"
            class="inline-flex items-center gap-2 px-4 py-2 bg-verse-600 hover:bg-verse-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Sponsor
          </Link>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button
            @click="filterByStatus('all')"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              statusFilter === 'all'
                ? 'bg-verse-600 text-white'
                : 'bg-verse-100 dark:bg-verse-800 text-verse-700 dark:text-verse-300 hover:bg-verse-200 dark:hover:bg-verse-700'
            ]"
          >
            All
          </button>
          <button
            @click="filterByStatus('active')"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              statusFilter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
            ]"
          >
            Active
          </button>
          <button
            @click="filterByStatus('inactive')"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              statusFilter === 'inactive'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            Inactive
          </button>
        </div>

        <!-- Sponsors Table -->
        <div class="bg-white dark:bg-verse-800/50 rounded-xl border border-verse-200 dark:border-verse-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-verse-50 dark:bg-verse-800 border-b border-verse-200 dark:border-verse-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider">
                    Sponsor
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider">
                    Types
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-verse-600 dark:text-verse-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-verse-200 dark:divide-verse-700">
                <tr
                  v-for="sponsor in sponsors"
                  :key="sponsor.id"
                  class="hover:bg-verse-50 dark:hover:bg-verse-800/80 transition-colors"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div
                        v-if="sponsor.logoUrl"
                        :class="['w-10 h-10 rounded-lg flex items-center justify-center p-1', sponsor.darkbg ? 'bg-verse-800' : 'bg-white']"
                      >
                        <img :src="sponsor.logoUrl" :alt="sponsor.name" class="max-w-full max-h-full object-contain" />
                      </div>
                      <div
                        v-else
                        class="w-10 h-10 rounded-lg bg-verse-200 dark:bg-verse-700 flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-verse-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <span class="font-medium text-verse-900 dark:text-verse-100">
                          {{ sponsor.name }}
                        </span>
                        <p v-if="sponsor.website" class="text-xs text-verse-500 dark:text-verse-400 truncate max-w-[200px]">
                          {{ sponsor.website }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="type in sponsor.sponsorTypes"
                        :key="type"
                        class="px-2 py-0.5 text-xs font-medium bg-verse-100 dark:bg-verse-700 text-verse-600 dark:text-verse-300 rounded capitalize"
                      >
                        {{ type }}
                      </span>
                      <span
                        v-if="!sponsor.sponsorTypes?.length"
                        class="text-verse-400 dark:text-verse-500 text-sm"
                      >
                        -
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                        getStatusBadge(sponsor.status)
                      ]"
                    >
                      {{ sponsor.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <Link
                        :href="`/sponsor/${sponsor.id}`"
                        class="p-2 text-verse-500 hover:text-verse-700 dark:text-verse-400 dark:hover:text-verse-200 transition-colors"
                        title="View"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                        </svg>
                      </Link>
                      <Link
                        :href="`/admin/sponsors/${sponsor.id}/edit`"
                        class="p-2 text-verse-500 hover:text-verse-700 dark:text-verse-400 dark:hover:text-verse-200 transition-colors"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </Link>
                      <button
                        v-if="canDelete"
                        @click="confirmDelete(sponsor)"
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
          <div v-if="!sponsors.length" class="px-6 py-12 text-center">
            <p class="text-verse-500 dark:text-verse-400 mb-4">
              No sponsors found<span v-if="statusFilter !== 'all'"> with status "{{ statusFilter }}"</span>.
            </p>
            <Link
              v-if="statusFilter !== 'all'"
              href="/admin/sponsors"
              class="inline-block text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200 underline"
            >
              View all sponsors
            </Link>
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
            Delete Sponsor
          </h3>
          <p class="text-verse-600 dark:text-verse-400 mb-4">
            Are you sure you want to delete "<strong>{{ sponsorToDelete?.name }}</strong>"? This action cannot be undone.
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
