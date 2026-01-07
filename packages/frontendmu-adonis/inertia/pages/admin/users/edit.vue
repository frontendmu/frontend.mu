<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link, useForm, usePage } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

type AppRole = 'viewer' | 'member' | 'organizer' | 'superadmin'

interface User {
  id: string
  name: string
  email: string | null
  role: AppRole
  githubUsername: string | null
  bio: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  websiteUrl: string | null
  featured: boolean
  isOrganizer: boolean
  isCommunityMember: boolean
  avatarUrl: string | null
}

interface Props {
  user: User
}

const props = defineProps<Props>()
const page = usePage()
const currentUser = computed(() => page.props.auth.user as any)
const isEditingSelf = computed(() => props.user.id === currentUser.value?.id)

const form = useForm({
  name: props.user.name,
  email: props.user.email || '',
  role: props.user.role,
  githubUsername: props.user.githubUsername || '',
  bio: props.user.bio || '',
  linkedinUrl: props.user.linkedinUrl || '',
  twitterUrl: props.user.twitterUrl || '',
  websiteUrl: props.user.websiteUrl || '',
  featured: props.user.featured,
  isOrganizer: props.user.isOrganizer,
  isCommunityMember: props.user.isCommunityMember,
})

function handleSubmit() {
  form.put(`/admin/users/${props.user.id}`)
}

const roleOptions: { value: AppRole; label: string; description: string }[] = [
  { value: 'viewer', label: 'Viewer', description: 'Can view public content only' },
  { value: 'member', label: 'Member', description: 'Can RSVP to events' },
  { value: 'organizer', label: 'Organizer', description: 'Can manage events, speakers, and sponsors' },
  { value: 'superadmin', label: 'Superadmin', description: 'Full access to all features including user management' },
]
</script>

<template>
  <Head :title="`Edit User: ${user.name}`" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20 max-w-2xl mx-auto">
        <!-- Breadcrumb -->
        <nav class="mb-6 flex items-center gap-2 text-sm">
          <Link href="/admin" class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200">
            Admin
          </Link>
          <span class="text-verse-400">/</span>
          <Link href="/admin/users" class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200">
            Users
          </Link>
          <span class="text-verse-400">/</span>
          <span class="text-verse-900 dark:text-verse-100">{{ user.name }}</span>
        </nav>

        <!-- Header with Avatar -->
        <div class="flex items-center gap-4 mb-8">
          <img
            v-if="user.avatarUrl"
            :src="user.avatarUrl"
            :alt="user.name"
            class="w-20 h-20 rounded-full object-cover"
          />
          <div
            v-else
            class="w-20 h-20 rounded-full bg-verse-200 dark:bg-verse-700 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-verse-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
          <div>
            <BaseHeading :level="1">Edit User</BaseHeading>
            <p class="text-verse-600 dark:text-verse-400">
              {{ user.name }}
              <span v-if="isEditingSelf" class="text-sm text-verse-500">(Your account)</span>
            </p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              Name <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
            <p v-if="form.errors.name" class="mt-1 text-sm text-red-500">{{ form.errors.name }}</p>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
            <p v-if="form.errors.email" class="mt-1 text-sm text-red-500">{{ form.errors.email }}</p>
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              Role <span class="text-red-500">*</span>
            </label>
            <div class="space-y-2">
              <label
                v-for="option in roleOptions"
                :key="option.value"
                :class="[
                  'flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
                  form.role === option.value
                    ? 'border-verse-500 bg-verse-50 dark:bg-verse-800'
                    : 'border-verse-200 dark:border-verse-700 hover:border-verse-300 dark:hover:border-verse-600',
                  isEditingSelf && option.value !== 'superadmin' ? 'opacity-50 cursor-not-allowed' : ''
                ]"
              >
                <input
                  type="radio"
                  v-model="form.role"
                  :value="option.value"
                  :disabled="isEditingSelf && option.value !== 'superadmin'"
                  class="mt-1 h-4 w-4 text-verse-600 focus:ring-verse-500 border-verse-300"
                />
                <div>
                  <span class="font-medium text-verse-900 dark:text-verse-100">{{ option.label }}</span>
                  <p class="text-sm text-verse-500 dark:text-verse-400">{{ option.description }}</p>
                </div>
              </label>
            </div>
            <p v-if="isEditingSelf" class="mt-2 text-sm text-amber-600 dark:text-amber-400">
              You cannot change your own role.
            </p>
            <p v-if="form.errors.role" class="mt-1 text-sm text-red-500">{{ form.errors.role }}</p>
          </div>

          <!-- GitHub Username -->
          <div>
            <label for="githubUsername" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              GitHub Username
            </label>
            <div class="flex">
              <span class="inline-flex items-center px-3 border border-r-0 border-verse-300 dark:border-verse-600 rounded-l-lg bg-verse-50 dark:bg-verse-700 text-verse-500 dark:text-verse-400">
                @
              </span>
              <input
                id="githubUsername"
                v-model="form.githubUsername"
                type="text"
                class="flex-1 px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-r-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
            <p class="mt-1 text-xs text-verse-500 dark:text-verse-400">Used to fetch avatar from GitHub</p>
          </div>

          <!-- Bio -->
          <div>
            <label for="bio" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              v-model="form.bio"
              rows="4"
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
          </div>

          <!-- Social Links -->
          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <label for="linkedinUrl" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
                LinkedIn URL
              </label>
              <input
                id="linkedinUrl"
                v-model="form.linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/..."
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
            <div>
              <label for="twitterUrl" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
                Twitter URL
              </label>
              <input
                id="twitterUrl"
                v-model="form.twitterUrl"
                type="url"
                placeholder="https://twitter.com/..."
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
            <div>
              <label for="websiteUrl" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
                Website URL
              </label>
              <input
                id="websiteUrl"
                v-model="form.websiteUrl"
                type="url"
                placeholder="https://..."
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Flags -->
          <div class="space-y-3 pt-4 border-t border-verse-200 dark:border-verse-700">
            <h3 class="text-sm font-medium text-verse-700 dark:text-verse-300">Flags</h3>
            <div class="flex items-center gap-3">
              <input
                id="featured"
                v-model="form.featured"
                type="checkbox"
                class="h-4 w-4 text-verse-600 focus:ring-verse-500 border-verse-300 rounded"
              />
              <label for="featured" class="text-sm text-verse-700 dark:text-verse-300">
                Featured user
              </label>
            </div>
            <div class="flex items-center gap-3">
              <input
                id="isOrganizer"
                v-model="form.isOrganizer"
                type="checkbox"
                class="h-4 w-4 text-verse-600 focus:ring-verse-500 border-verse-300 rounded"
              />
              <label for="isOrganizer" class="text-sm text-verse-700 dark:text-verse-300">
                Show as organizer on team page
              </label>
            </div>
            <div class="flex items-center gap-3">
              <input
                id="isCommunityMember"
                v-model="form.isCommunityMember"
                type="checkbox"
                class="h-4 w-4 text-verse-600 focus:ring-verse-500 border-verse-300 rounded"
              />
              <label for="isCommunityMember" class="text-sm text-verse-700 dark:text-verse-300">
                Show as community member
              </label>
            </div>
          </div>

          <!-- Submit -->
          <div class="flex justify-end gap-4 pt-4">
            <Link
              href="/admin/users"
              class="px-6 py-2 text-verse-700 dark:text-verse-300 hover:bg-verse-100 dark:hover:bg-verse-700 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              :disabled="form.processing"
              class="px-6 py-2 bg-verse-600 hover:bg-verse-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <span v-if="form.processing">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
