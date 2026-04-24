<script setup lang="ts">
import { computed } from 'vue'
import { Head, useForm } from '@inertiajs/vue3'
import { Link } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import { getRoleBadgeClass } from '~/utils/roles'

interface RsvpMeetup {
  id: string
  slug: string
  title: string
  date: string | null
  status: string
}

interface Props {
  user: Data.User | null
  rsvpMeetups: RsvpMeetup[]
}

const props = defineProps<Props>()

function sanitizeExternalUrl(url?: string | null) {
  if (!url) return null

  try {
    const parsed = new URL(url)

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }

    return parsed.href
  } catch {
    return null
  }
}

const safeLinks = computed(() => ({
  github: props.user?.githubUsername
    ? `https://github.com/${encodeURIComponent(props.user.githubUsername)}`
    : null,
  linkedin: sanitizeExternalUrl(props.user?.linkedinUrl),
  twitter: sanitizeExternalUrl(props.user?.twitterUrl),
  website: sanitizeExternalUrl(props.user?.websiteUrl),
}))

const form = useForm({
  name: props.user?.name || '',
  githubUsername: props.user?.githubUsername || '',
  bio: props.user?.bio || '',
  twitterUrl: props.user?.twitterUrl || '',
  linkedinUrl: props.user?.linkedinUrl || '',
  websiteUrl: props.user?.websiteUrl || '',
})

function handleSubmit() {
  form.put('/profile')
}

function getUserRoles() {
  if (props.user?.roles && props.user.roles.length > 0) {
    return props.user.roles
  }
  return []
}
</script>

<template>
  <Head title="Profile" />
  <main class="relative min-h-screen pt-40 pb-32">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <template v-if="user">
        <!-- Profile Header -->
        <header class="flex flex-col sm:flex-row items-start gap-6 mb-12">
          <img
            v-if="user.avatarUrl"
            :src="user.avatarUrl"
            :alt="user.name"
            class="w-20 h-20 rounded-2xl object-cover shadow-lg shrink-0"
          />
          <div
            v-else
            class="w-20 h-20 rounded-2xl bg-verse-500 flex items-center justify-center text-3xl font-black text-white shadow-lg shrink-0"
          >
            {{ user.name.charAt(0) }}
          </div>
          <div class="space-y-3 min-w-0">
            <div>
              <h1
                class="text-3xl md:text-4xl font-display tracking-tight dark:text-gray-100 leading-none"
              >
                {{ user.name }}
              </h1>
              <p class="text-sm font-bold text-gray-400 truncate mt-1">{{ user.email }}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-for="role in getUserRoles()"
                :key="role.id"
                :class="[
                  'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                  getRoleBadgeClass(role.name),
                ]"
              >
                {{ role.name }}
              </span>
              <template v-if="safeLinks.github || safeLinks.linkedin || safeLinks.twitter || safeLinks.website">
                <span class="text-gray-200 dark:text-verse-800">|</span>
                <a
                  v-if="safeLinks.github"
                  :href="safeLinks.github"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-gray-400 hover:text-verse-500 transition-colors"
                  title="GitHub"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                    />
                  </svg>
                </a>
                <a
                  v-if="safeLinks.linkedin"
                  :href="safeLinks.linkedin"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-gray-400 hover:text-verse-500 transition-colors"
                  title="LinkedIn"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                    />
                  </svg>
                </a>
                <a
                  v-if="safeLinks.twitter"
                  :href="safeLinks.twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-gray-400 hover:text-verse-500 transition-colors"
                  title="Twitter"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                    />
                  </svg>
                </a>
                <a
                  v-if="safeLinks.website"
                  :href="safeLinks.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-gray-400 hover:text-verse-500 transition-colors"
                  title="Website"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </a>
              </template>
            </div>
          </div>
        </header>

        <!-- Edit Form -->
        <section class="max-w-2xl space-y-8 mb-16">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-verse-500 dark:text-verse-400"
              >Account Settings</span
            >
            <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="name" class="text-xs font-medium text-gray-400">Full Name</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 bg-white dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-verse-500 transition-colors"
                />
                <p v-if="form.errors.name" class="text-xs text-red-500">{{ form.errors.name }}</p>
              </div>

              <div class="space-y-2">
                <label for="githubUsername" class="text-xs font-medium text-gray-400"
                  >GitHub Username</label
                >
                <div class="flex">
                  <span
                    class="inline-flex items-center px-3 border border-r-0 border-gray-100 dark:border-verse-800 rounded-l-xl bg-gray-50 dark:bg-verse-900/60 text-gray-400 text-sm"
                    >@</span
                  >
                  <input
                    id="githubUsername"
                    v-model="form.githubUsername"
                    type="text"
                    class="flex-1 px-4 py-3 bg-white dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-r-xl text-gray-900 dark:text-white focus:outline-none focus:border-verse-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label for="bio" class="text-xs font-medium text-gray-400">Biography</label>
              <textarea
                id="bio"
                v-model="form.bio"
                rows="3"
                class="w-full px-4 py-3 bg-white dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-verse-500 transition-colors"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="twitterUrl" class="text-xs font-medium text-gray-400">Twitter</label>
                <input
                  id="twitterUrl"
                  v-model="form.twitterUrl"
                  type="url"
                  placeholder="https://twitter.com/..."
                  class="w-full px-4 py-3 bg-white dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-verse-500 transition-colors"
                />
              </div>
              <div class="space-y-2">
                <label for="linkedinUrl" class="text-xs font-medium text-gray-400">LinkedIn</label>
                <input
                  id="linkedinUrl"
                  v-model="form.linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  class="w-full px-4 py-3 bg-white dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-verse-500 transition-colors"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label for="websiteUrl" class="text-xs font-medium text-gray-400"
                >Personal Website</label
              >
              <input
                id="websiteUrl"
                v-model="form.websiteUrl"
                type="url"
                placeholder="https://yoursite.com"
                class="w-full px-4 py-3 bg-white dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-verse-500 transition-colors"
              />
            </div>

            <div class="flex justify-end pt-2">
              <button
                type="submit"
                :disabled="form.processing"
                class="px-8 py-3 bg-verse-500 text-white font-bold rounded-xl hover:bg-verse-600 transition-colors disabled:opacity-50"
              >
                {{ form.processing ? 'Saving...' : 'Update Profile' }}
              </button>
            </div>
          </form>
        </section>

        <!-- My Meetups -->
        <section v-if="rsvpMeetups.length" class="mt-16 space-y-8">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-verse-500 dark:text-verse-400">My Meetups</span>
            <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
            <span class="text-xs font-bold text-gray-400">{{ rsvpMeetups.length }} attended</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              v-for="meetup in rsvpMeetups"
              :key="meetup.id"
              :href="`/meetup/${meetup.slug || meetup.id}`"
              class="group relative bg-white dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-xl p-5 hover:border-verse-500 transition-all hover:shadow-md"
            >
              <div class="space-y-2">
                <p
                  class="font-bold text-gray-900 dark:text-gray-100 group-hover:text-verse-500 transition-colors leading-snug"
                >
                  {{ meetup.title }}
                </p>
                <p
                  v-if="meetup.date"
                  class="text-[10px] font-mono text-gray-400 uppercase tracking-widest"
                >
                  {{ meetup.date }}
                </p>
              </div>
            </Link>
          </div>
        </section>
      </template>

      <template v-else>
        <div class="text-center py-32 space-y-8">
          <div
            class="w-24 h-24 bg-verse-50 dark:bg-verse-900/20 rounded-full flex items-center justify-center mx-auto"
          >
            <svg
              class="w-12 h-12 text-verse-500 dark:text-verse-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 class="text-4xl font-display tracking-tight dark:text-white">
            Authentication required.
          </h2>
          <Link
            href="/login?next=/profile"
            class="inline-flex items-center gap-3 px-8 py-3.5 bg-verse-600 text-white rounded-xl font-bold text-sm hover:bg-verse-700 transition-colors"
          >
            Sign In to View
          </Link>
        </div>
      </template>
    </div>
  </main>
</template>
