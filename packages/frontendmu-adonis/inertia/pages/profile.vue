<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

interface Props {
  user: any | null
}

defineProps<Props>()
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
              <div
                v-if="user.avatarUrl"
                class="flex-shrink-0"
              >
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
                <h2 class="text-2xl font-bold text-verse-900 dark:text-verse-100">{{ user.name }}</h2>
                <p class="text-verse-600 dark:text-verse-400 mb-3">{{ user.email }}</p>
                
                <div class="flex flex-wrap gap-2">
                  <span
                    class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium"
                  >
                    {{ user.role.charAt(0).toUpperCase() + user.role.slice(1) }}
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

                <div v-if="user.twitterUrl || user.linkedinUrl || user.websiteUrl || user.githubUsername" class="mt-4 flex flex-wrap gap-3">
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
            <p class="text-sm text-verse-600 dark:text-verse-400 mt-1">Update your personal information</p>
          </div>

          <form method="POST" action="/profile" class="space-y-6">
            <input type="hidden" name="_method" value="PUT" />
            <input type="hidden" name="_csrf" :value="$page.props.auth.csrfToken" />

            <div>
              <label for="name" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                :value="user.name"
                class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>

            <div>
              <label for="bio" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="3"
                :value="user.bio"
                class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              ></textarea>
            </div>

            <div>
              <label for="twitterUrl" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
                Twitter
              </label>
              <input
                id="twitterUrl"
                name="twitterUrl"
                type="url"
                :value="user.twitterUrl"
                placeholder="https://twitter.com/username"
                class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>

            <div>
              <label for="linkedinUrl" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
                LinkedIn
              </label>
              <input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                :value="user.linkedinUrl"
                placeholder="https://linkedin.com/in/username"
                class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>

            <div>
              <label for="websiteUrl" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
                Website
              </label>
              <input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                :value="user.websiteUrl"
                placeholder="https://yourwebsite.com"
                class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              class="px-6 py-3 bg-verse-600 hover:bg-verse-700 text-white font-medium rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </form>

          <div class="mt-8 pt-8 border-t border-verse-200 dark:border-verse-700">
            <h3 class="text-lg font-semibold text-verse-900 dark:text-verse-100 mb-4">Danger Zone</h3>
            <form method="POST" action="/logout">
              <input type="hidden" name="_csrf" :value="$page.props.auth.csrfToken" />
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
            <p class="text-verse-600 dark:text-verse-400 mb-6">Please login to view your profile.</p>
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
