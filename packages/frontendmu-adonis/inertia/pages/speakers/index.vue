<script setup lang="ts">
import { computed } from 'vue'
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

interface Speaker {
  id: string
  name: string
  github_account: string | null
  featured: boolean
  bio: string | null
  avatar_url: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  websiteUrl: string | null
}

interface Props {
  speakers: Speaker[]
}

const props = defineProps<Props>()

const featuredSpeakers = computed(() => props.speakers.filter((s) => s.featured))
const regularSpeakers = computed(() => props.speakers.filter((s) => !s.featured))
</script>

<template>
  <Head title="Speakers" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <div class="mb-12">
          <BaseHeading :level="1" class="mb-4">Speakers</BaseHeading>
          <p class="text-verse-600 dark:text-verse-400 max-w-2xl">
            Meet the amazing speakers who have shared their knowledge at our meetups.
            From local experts to international speakers, our community benefits from their expertise.
          </p>
        </div>

        <template v-if="speakers.length">
          <template v-if="featuredSpeakers.length">
            <section class="mb-12">
              <h2
                class="text-xl font-bold text-verse-900 dark:text-verse-100 mb-6 flex items-center gap-2"
              >
                <span class="text-yellow-500">★</span>
                Featured Speakers
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  v-for="speaker in featuredSpeakers"
                  :key="speaker.id"
                  class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700 text-center"
                >
                  <img
                    :src="speaker.avatar_url || `https://ui-avatars.com/api/?name=${speaker.name}`"
                    :alt="speaker.name"
                    class="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 class="text-lg font-semibold text-verse-900 dark:text-verse-100 mb-2">
                    {{ speaker.name }}
                  </h3>
                  <div v-if="speaker.github_account" class="flex justify-center gap-3">
                    <a
                      v-if="speaker.github_account"
                      :href="`https://github.com/${speaker.github_account}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                        />
                      </svg>
                    </a>
                    <a
                      v-if="speaker.twitterUrl"
                      :href="speaker.twitterUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                        />
                      </svg>
                    </a>
                    <a
                      v-if="speaker.linkedinUrl"
                      :href="speaker.linkedinUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                        />
                      </svg>
                    </a>
                    <a
                      v-if="speaker.websiteUrl"
                      :href="speaker.websiteUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </template>

          <section>
            <h2 class="text-xl font-bold text-verse-900 dark:text-verse-100 mb-6">All Speakers</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <a
                v-for="speaker in regularSpeakers"
                :key="speaker.id"
                :href="`/speaker/${speaker.id}`"
                class="flex items-center gap-3 p-3 bg-white dark:bg-verse-800/50 rounded-lg hover:bg-verse-50 dark:hover:bg-verse-700/50 transition-colors"
              >
                <img
                  :src="speaker.avatar_url || `https://ui-avatars.com/api/?name=${speaker.name}`"
                  :alt="speaker.name"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <span class="text-verse-900 dark:text-verse-100 font-medium">{{ speaker.name }}</span>
              </a>
            </div>
          </section>
        </template>

        <div v-else class="text-center py-16 text-verse-600 dark:text-verse-400">
          <p>No speakers found.</p>
        </div>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
