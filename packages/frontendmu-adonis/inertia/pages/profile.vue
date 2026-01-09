<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

interface Props {
  user: {
    id: string
    name: string
    email: string | null
    role: string
    roles?: { id: number; name: string }[]
    bio: string | null
    githubUsername: string | null
    twitterUrl: string | null
    linkedinUrl: string | null
    websiteUrl: string | null
    avatarUrl: string | null
    isOrganizer: boolean
    isCommunityMember: boolean
  } | null
}

const props = defineProps<Props>()

const form = useForm({
  name: props.user?.name || '',
  bio: props.user?.bio || '',
  twitterUrl: props.user?.twitterUrl || '',
  linkedinUrl: props.user?.linkedinUrl || '',
  websiteUrl: props.user?.websiteUrl || '',
})

function handleSubmit() {
  form.put('/profile')
}

// Get user's roles display
function getUserRoles() {
  if (props.user?.roles && props.user.roles.length > 0) {
    return props.user.roles
  }
  // Fallback to legacy role field
  if (props.user?.role) {
    return [{ id: 0, name: props.user.role }]
  }
  return []
}

function getRoleBadgeClass(roleName: string) {
  switch (roleName) {
    case 'superadmin':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    case 'organizer':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
    case 'member':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
    case 'viewer':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    default:
      return 'bg-verse-100 dark:bg-verse-800 text-verse-800 dark:text-verse-200'
  }
}
</script>

<template>
  <Head title="Profile" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20 max-w-2xl mx-auto">
        <BaseHeading :level="1" class="mb-6">Profile</BaseHeading>

        <template v-if="user">
          <div class="bg-verse-50 dark:bg-verse-900/30 rounded-lg p-6 mb-8">
            <div class="flex items-start gap-6">
              <div v-if="user.avatarUrl" class="flex-shrink-0">
                <img
                  :src="user.avatarUrl"
                  :alt="user.name"
                  class="w-24 h-24 rounded-full border-4 border-white dark:border-verse-800 shadow-lg"
                />
              </div>
              <div
                v-else
                class="flex-shrink-0 w-24 h-24 rounded-full border-4 border-white dark:border-verse-800 shadow-lg bg-verse-200 dark:bg-verse-700 flex items-center justify-center"
              >
                <span class="text-3xl font-bold text-verse-600 dark:text-verse-300">
                  {{ user.name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="flex-1">
                <h2 class="text-2xl font-bold text-verse-900 dark:text-verse-100">
                  {{ user.name }}
                </h2>
                <p class="text-verse-600 dark:text-verse-400 mb-3">{{ user.email }}</p>

                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="role in getUserRoles()"
                    :key="role.id"
                    :class="[
                      'px-3 py-1 rounded-full text-sm font-medium',
                      getRoleBadgeClass(role.name),
                    ]"
                  >
                    {{ role.name.charAt(0).toUpperCase() + role.name.slice(1) }}
                  </span>
                  <span
                    v-if="user.isOrganizer"
                    class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm"
                  >
                    Organizer
                  </span>
                  <span
                    v-if="user.isCommunityMember"
                    class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    Community Member
                  </span>
                </div>

                <div v-if="user.bio" class="mt-4 text-verse-700 dark:text-verse-300">
                  <p>{{ user.bio }}</p>
                </div>

                <div
                  v-if="
                    user.twitterUrl || user.linkedinUrl || user.websiteUrl || user.githubUsername
                  "
                  class="mt-4 flex flex-wrap gap-3"
                >
                  <a
                    v-if="user.githubUsername"
                    :href="`https://github.com/${user.githubUsername}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-verse-600 dark:text-verse-400 hover:text-verse-800 dark:hover:text-verse-200"
                  >
                    GitHub: @{{ user.githubUsername }}
                  </a>
                  <a
                    v-if="user.twitterUrl"
                    :href="user.twitterUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-verse-600 dark:text-verse-400 hover:text-verse-800 dark:hover:text-verse-200"
                  >
                    Twitter
                  </a>
                  <a
                    v-if="user.linkedinUrl"
                    :href="user.linkedinUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-verse-600 dark:text-verse-400 hover:text-verse-800 dark:hover:text-verse-200"
                  >
                    LinkedIn
                  </a>
                  <a
                    v-if="user.websiteUrl"
                    :href="user.websiteUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-verse-600 dark:text-verse-400 hover:text-verse-800 dark:hover:text-verse-200"
                  >
                    Website
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="text-xl font-semibold text-verse-900 dark:text-verse-100">Edit Profile</h3>
            <p class="text-sm text-verse-600 dark:text-verse-400 mt-1">
              Update your personal information
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label
                for="name"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Name
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
              <p v-if="form.errors.name" class="mt-1 text-sm text-red-500">
                {{ form.errors.name }}
              </p>
            </div>

            <div>
              <label
                for="bio"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Bio
              </label>
              <textarea
                id="bio"
                v-model="form.bio"
                rows="3"
                class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              ></textarea>
              <p v-if="form.errors.bio" class="mt-1 text-sm text-red-500">
                {{ form.errors.bio }}
              </p>
            </div>

            <div>
              <label
                for="twitterUrl"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Twitter
              </label>
              <input
                id="twitterUrl"
                v-model="form.twitterUrl"
                type="url"
                placeholder="https://twitter.com/username"
                class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
              <p v-if="form.errors.twitterUrl" class="mt-1 text-sm text-red-500">
                {{ form.errors.twitterUrl }}
              </p>
            </div>

            <div>
              <label
                for="linkedinUrl"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                LinkedIn
              </label>
              <input
                id="linkedinUrl"
                v-model="form.linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/username"
                class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
              <p v-if="form.errors.linkedinUrl" class="mt-1 text-sm text-red-500">
                {{ form.errors.linkedinUrl }}
              </p>
            </div>

            <div>
              <label
                for="websiteUrl"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Website
              </label>
              <input
                id="websiteUrl"
                v-model="form.websiteUrl"
                type="url"
                placeholder="https://yourwebsite.com"
                class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
              <p v-if="form.errors.websiteUrl" class="mt-1 text-sm text-red-500">
                {{ form.errors.websiteUrl }}
              </p>
            </div>

            <button
              type="submit"
              :disabled="form.processing"
              class="px-6 py-3 bg-verse-600 hover:bg-verse-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <span v-if="form.processing">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
          </form>

          <div class="mt-8 pt-8 border-t border-verse-200 dark:border-verse-700">
            <h3 class="text-lg font-semibold text-verse-900 dark:text-verse-100 mb-4">
              Danger Zone
            </h3>
            <form method="POST" action="/logout">
              <button
                type="submit"
                class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </template>

        <template v-else>
          <div class="text-center py-12">
            <p class="text-verse-600 dark:text-verse-400 mb-6">
              Please login to view your profile.
            </p>
            <a
              href="/login"
              class="inline-block px-6 py-3 bg-verse-600 hover:bg-verse-700 text-white font-medium rounded-lg transition-colors"
            >
              Login
            </a>
          </div>
        </template>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
