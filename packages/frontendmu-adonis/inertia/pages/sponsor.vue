<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

interface Meetup {
  id: number
  title: string
  date: string
  location: string
  venue: string
  description: string | null
}

interface Sponsor {
  id: string
  name: string
  website: string | null
  description: string | null
  sponsorTypes: string[]
  darkbg: boolean
}

interface Props {
  sponsor: Sponsor | null
  meetups: Meetup[]
}

defineProps<Props>()

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <Head :title="sponsor?.name || 'Sponsor'" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <div v-if="!sponsor" class="text-center py-12">
          <p class="text-verse-500 dark:text-verse-400">Sponsor not found</p>
          <a href="/sponsors" class="text-verse-600 hover:text-verse-800 mt-4 inline-block">
            ← Back to Sponsors
          </a>
        </div>

        <div v-else>
          <a
            href="/sponsors"
            class="inline-flex items-center gap-1 text-verse-600 dark:text-verse-400 hover:text-verse-800 dark:hover:text-verse-200 mb-6"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Sponsors
          </a>

          <div class="mb-8">
            <BaseHeading :level="1" class="mb-4">{{ sponsor.name }}</BaseHeading>
            
            <div class="flex flex-wrap gap-3 mb-4">
              <span
                v-for="type in sponsor.sponsorTypes"
                :key="type"
                class="px-3 py-1 bg-verse-100 dark:bg-verse-800 text-verse-700 dark:text-verse-300 rounded-full text-sm capitalize"
              >
                {{ type }}
              </span>
            </div>

            <div v-if="sponsor.website" class="mb-4">
              <a
                :href="sponsor.website"
                target="_blank"
                rel="noopener noreferrer"
                class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200 flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
                {{ sponsor.website }}
              </a>
            </div>
          </div>

          <section v-if="meetups.length">
            <h2 class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-6">
              Meetups Sponsored
            </h2>
            <div class="grid gap-4">
              <div
                v-for="meetup in meetups"
                :key="meetup.id"
                class="p-4 bg-verse-50 dark:bg-verse-800/30 rounded-xl border border-verse-100 dark:border-verse-700"
              >
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                  <h3 class="text-lg font-semibold text-verse-900 dark:text-verse-100">
                    {{ meetup.title }}
                  </h3>
                  <span class="text-sm text-verse-500 dark:text-verse-400">
                    {{ formatDate(meetup.date) }}
                  </span>
                </div>
                <p class="text-verse-600 dark:text-verse-400 text-sm mb-2">
                  {{ meetup.venue }} · {{ meetup.location }}
                </p>
                <div
                  v-if="meetup.description"
                  class="prose prose-sm dark:prose-invert max-w-none text-verse-700 dark:text-verse-300"
                  v-html="meetup.description"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
