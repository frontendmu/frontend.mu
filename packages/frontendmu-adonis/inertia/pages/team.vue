<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

interface Organizer {
  name: string
  role: string
  imageUrl: string
  id?: string
  linkedin?: string
}

interface CommunityMember {
  name: string
  role: string
  imageUrl: string
  id?: string
}

interface Speaker {
  id: string
  name: string
  github_account: string | null
  avatar_url: string | null
}

interface Contributor {
  username: string
  contributions: number
}

interface Props {
  organizers: Organizer[]
  communityMembers: CommunityMember[]
  speakers: Speaker[]
  contributors: Contributor[]
}

defineProps<Props>()

function getGithubUrl(username: string): string {
  return `https://github.com/${username}.png`
}
</script>

<template>
  <Head title="Team" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <BaseHeading :level="1" class="mb-6">Our Team</BaseHeading>
        <p class="text-verse-700 dark:text-verse-300 mb-12 max-w-3xl">
          There are many people who contribute to making front-end coders an
          active community. This is a growing list of people who help either with
          meetup organisation, our website, or simply being active in the community.
        </p>

        <!-- Organizers Section -->
        <section class="mb-16">
          <h2
            class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-6"
          >
            Organizers
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              v-for="person in organizers"
              :key="person.name"
              class="text-center"
            >
              <Link :href="person.id ? `/speaker/${person.id}` : '#'">
                <img
                  :src="person.imageUrl"
                  :alt="person.name"
                  class="w-24 h-24 mx-auto rounded-lg border-2 border-verse-200 dark:border-verse-700 shadow-lg mb-3 object-cover"
                />
                <p class="font-medium text-verse-900 dark:text-verse-100">
                  {{ person.name }}
                </p>
                <p class="text-sm text-verse-600 dark:text-verse-400">
                  {{ person.role }}
                </p>
              </Link>
              <a
                v-if="person.linkedin"
                :href="person.linkedin"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 mt-2 text-sm text-verse-600 dark:text-verse-400 hover:text-verse-800 dark:hover:text-verse-200"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </section>

        <!-- Community Members Section -->
        <section v-if="communityMembers.length" class="mb-16">
          <h2
            class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-6"
          >
            Community Members
          </h2>
          <p class="text-verse-600 dark:text-verse-400 mb-6">
            People who have been active in the community.
          </p>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              v-for="person in communityMembers"
              :key="person.name"
              class="text-center"
            >
              <Link :href="person.id ? `/speaker/${person.id}` : '#'">
                <img
                  :src="person.imageUrl"
                  :alt="person.name"
                  class="w-24 h-24 mx-auto rounded-lg border-2 border-verse-200 dark:border-verse-700 shadow-lg mb-3 object-cover"
                />
                <p class="font-medium text-verse-900 dark:text-verse-100">
                  {{ person.name }}
                </p>
                <p class="text-sm text-verse-600 dark:text-verse-400">
                  {{ person.role }}
                </p>
              </Link>
            </div>
          </div>
        </section>

        <!-- Speakers Section -->
        <section class="mb-16">
          <h2
            class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-6"
          >
            Speakers
          </h2>
          <p class="text-verse-600 dark:text-verse-400 mb-6 max-w-3xl">
            People who shared their knowledge with the community during
            frontend-coders meetups since 2016.
          </p>
          <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link
              v-for="speaker in speakers"
              :key="speaker.id"
              :href="`/speaker/${speaker.id}`"
              class="text-center group"
            >
              <img
                :src="speaker.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(speaker.name)}`"
                :alt="speaker.name"
                class="w-20 h-20 mx-auto rounded-full border-2 border-verse-200 dark:border-verse-700 shadow-md mb-2 object-cover group-hover:border-verse-500 transition-colors"
              />
              <p class="text-sm font-medium text-verse-900 dark:text-verse-100 group-hover:text-verse-600 dark:group-hover:text-verse-300 transition-colors">
                {{ speaker.name }}
              </p>
            </Link>
          </div>
        </section>

        <!-- Contributors Section -->
        <section v-if="contributors.length">
          <h2
            class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-6"
          >
            Contributors
          </h2>
          <p class="text-verse-600 dark:text-verse-400 mb-6 max-w-3xl">
            People who contributed code to our website based on the data directly
            from GitHub.
          </p>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <a
              v-for="contributor in contributors"
              :key="contributor.username"
              :href="`https://github.com/frontendmu/frontend.mu/commits/?author=${contributor.username}`"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 p-3 rounded-lg bg-verse-50 dark:bg-verse-800/50 hover:bg-verse-100 dark:hover:bg-verse-800 transition-colors"
            >
              <img
                :src="getGithubUrl(contributor.username)"
                :alt="contributor.username"
                class="w-12 h-12 rounded-full"
              />
              <div>
                <p class="font-medium text-verse-900 dark:text-verse-100">
                  {{ contributor.username }}
                </p>
                <p class="text-xs text-verse-600 dark:text-verse-400">
                  {{ contributor.contributions }} contributions
                </p>
              </div>
            </a>
          </div>
        </section>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
