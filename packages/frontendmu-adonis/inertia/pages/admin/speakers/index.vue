<script setup lang="ts">
import { ref, computed } from 'vue'
import { Head, Link, router, usePage } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

interface Speaker {
  id: string
  name: string
  email: string | null
  githubUsername: string | null
  bio: string | null
  featured: boolean
  avatarUrl: string | null
  sessionCount: number
}

interface Props {
  speakers: Speaker[]
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
const speakerToDelete = ref<Speaker | null>(null)
const isDeleting = ref(false)

// Delete handlers
function confirmDelete(speaker: Speaker) {
  speakerToDelete.value = speaker
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  speakerToDelete.value = null
}

function executeDelete() {
  if (!speakerToDelete.value) return
  
  isDeleting.value = true
  router.delete(`/admin/speakers/${speakerToDelete.value.id}`, {
    onFinish: () => {
      isDeleting.value = false
      showDeleteModal.value = false
      speakerToDelete.value = null
    },
  })
}
</script>

<template>
  <Head title="Manage Speakers" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <BaseHeading :level="1">Manage Speakers</BaseHeading>
            <p class="text-verse-600 dark:text-verse-400 mt-2">
              View and manage speaker profiles.
            </p>
          </div>
          <Link
            href="/admin/speakers/create"
            class="inline-flex items-center gap-2 px-4 py-2 bg-verse-600 hover:bg-verse-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add Speaker
          </Link>
        </div>

        <!-- Speakers Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="speaker in speakers"
            :key="speaker.id"
            class="bg-white dark:bg-verse-800/50 rounded-xl border border-verse-200 dark:border-verse-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-start gap-4">
              <!-- Avatar -->
              <img
                v-if="speaker.avatarUrl"
                :src="speaker.avatarUrl"
                :alt="speaker.name"
                class="w-16 h-16 rounded-full object-cover"
              />
              <div
                v-else
                class="w-16 h-16 rounded-full bg-verse-200 dark:bg-verse-700 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-verse-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-verse-900 dark:text-verse-100 truncate">
                    {{ speaker.name }}
                  </h3>
                  <span
                    v-if="speaker.featured"
                    class="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded"
                  >
                    Featured
                  </span>
                </div>
                <p v-if="speaker.githubUsername" class="text-sm text-verse-500 dark:text-verse-400">
                  @{{ speaker.githubUsername }}
                </p>
                <p class="text-sm text-verse-600 dark:text-verse-400 mt-1">
                  {{ speaker.sessionCount }} session{{ speaker.sessionCount !== 1 ? 's' : '' }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-verse-100 dark:border-verse-700">
              <Link
                :href="`/speaker/${speaker.id}`"
                class="p-2 text-verse-500 hover:text-verse-700 dark:text-verse-400 dark:hover:text-verse-200 transition-colors"
                title="View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
              </Link>
              <Link
                :href="`/admin/speakers/${speaker.id}/edit`"
                class="p-2 text-verse-500 hover:text-verse-700 dark:text-verse-400 dark:hover:text-verse-200 transition-colors"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </Link>
              <button
                v-if="canDelete"
                @click="confirmDelete(speaker)"
                class="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="!speakers.length" class="text-center py-16">
          <p class="text-verse-500 dark:text-verse-400 mb-4">
            No speakers found.
          </p>
          <Link
            href="/admin/speakers/create"
            class="inline-flex items-center gap-2 px-4 py-2 bg-verse-600 hover:bg-verse-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Add your first speaker
          </Link>
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
            Delete Speaker
          </h3>
          <p class="text-verse-600 dark:text-verse-400 mb-4">
            Are you sure you want to delete "<strong>{{ speakerToDelete?.name }}</strong>"? This will also remove them from all sessions. This action cannot be undone.
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
