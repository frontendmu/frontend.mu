<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
import type { Speaker } from '~/types'

interface SpeakerSession {
  id: number
  title: string
  eventId: string
  eventTitle: string
  eventDate: string
}

interface Props {
  speaker: Speaker | null
  sessions: SpeakerSession[]
}

const props = defineProps<Props>()
</script>

<template>
  <Head :title="speaker?.name || 'Speaker'" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <template v-if="speaker">
          <div class="flex flex-col md:flex-row gap-8 mb-12">
            <div class="flex-shrink-0">
              <img
                :src="`https://avatars.githubusercontent.com/${speaker.github_account}`"
                :alt="speaker.name"
                class="w-40 h-40 rounded-full border-4 border-verse-200 dark:border-verse-700"
              />
            </div>
            <div>
              <BaseHeading :level="1" class="mb-4">{{
                speaker.name
              }}</BaseHeading>
              <div class="flex gap-4 mb-4">
                <a
                  v-if="speaker.github_account"
                  :href="`https://github.com/${speaker.github_account}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>

          <!-- Sessions -->
          <section v-if="sessions.length">
            <h2
              class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-6"
            >
              Sessions
            </h2>
            <div class="space-y-4">
              <Link
                v-for="session in sessions"
                :key="session.id"
                :href="`/meetup/${session.eventId}`"
                class="block p-4 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700 hover:border-verse-500 transition-colors"
              >
                <h3
                  class="font-semibold text-verse-900 dark:text-verse-100 mb-1"
                >
                  {{ session.title }}
                </h3>
                <p class="text-sm text-verse-600 dark:text-verse-400">
                  {{ session.eventTitle }} - {{ session.eventDate }}
                </p>
              </Link>
            </div>
          </section>
        </template>

        <template v-else>
          <div class="text-center py-16">
            <p class="text-verse-600 dark:text-verse-400">Speaker not found.</p>
            <Link
              href="/speakers"
              class="inline-block mt-4 text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200 underline"
            >
              View all speakers
            </Link>
          </div>
        </template>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
