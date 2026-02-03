<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

const form = useForm({
  name: '',
  email: '',
  githubUsername: '',
  bio: '',
  linkedinUrl: '',
  twitterUrl: '',
  websiteUrl: '',
  featured: false,
})

function handleSubmit() {
  form.post('/admin/speakers')
}
</script>

<template>
  <Head title="Add Speaker" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20 max-w-2xl mx-auto">
        <!-- Breadcrumb -->
        <nav class="mb-6 flex items-center gap-2 text-sm">
          <Link href="/admin" class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200">
            Admin
          </Link>
          <span class="text-verse-400">/</span>
          <Link href="/admin/speakers" class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200">
            Speakers
          </Link>
          <span class="text-verse-400">/</span>
          <span class="text-verse-900 dark:text-verse-100">Add Speaker</span>
        </nav>

        <BaseHeading :level="1" class="mb-8">Add Speaker</BaseHeading>

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
            <p v-if="form.errors.githubUsername" class="mt-1 text-sm text-red-500">{{ form.errors.githubUsername }}</p>
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
            <p v-if="form.errors.bio" class="mt-1 text-sm text-red-500">{{ form.errors.bio }}</p>
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

          <!-- Featured -->
          <div class="flex items-center gap-3">
            <input
              id="featured"
              v-model="form.featured"
              type="checkbox"
              class="h-4 w-4 text-verse-600 focus:ring-verse-500 border-verse-300 rounded"
            />
            <label for="featured" class="text-sm font-medium text-verse-700 dark:text-verse-300">
              Featured speaker
            </label>
          </div>

          <!-- Submit -->
          <div class="flex justify-end gap-4 pt-4">
            <Link
              href="/admin/speakers"
              class="px-6 py-2 text-verse-700 dark:text-verse-300 hover:bg-verse-100 dark:hover:bg-verse-700 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              :disabled="form.processing"
              class="px-6 py-2 bg-verse-600 hover:bg-verse-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <span v-if="form.processing">Creating...</span>
              <span v-else>Create Speaker</span>
            </button>
          </div>
        </form>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
