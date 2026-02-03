<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
import {
  DISCORD_URL,
  GITHUB_URL,
  WHATSAPP_URL,
  TWITTER_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
} from '~/constants'
</script>

<template>
  <Head title="Community" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <BaseHeading :level="1" class="mb-6">Join Our Community</BaseHeading>
        <p class="text-verse-700 dark:text-verse-300 mb-8">
          Connect with fellow developers in Mauritius through our various
          platforms.
        </p>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Discord -->
          <a
            :href="DISCORD_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700 hover:border-verse-500 transition-colors"
          >
            <h3
              class="text-xl font-semibold text-verse-900 dark:text-verse-100 mb-2"
            >
              Discord
            </h3>
            <p class="text-verse-600 dark:text-verse-300">
              Join our Discord server for real-time discussions
            </p>
          </a>

          <!-- GitHub -->
          <a
            :href="GITHUB_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700 hover:border-verse-500 transition-colors"
          >
            <h3
              class="text-xl font-semibold text-verse-900 dark:text-verse-100 mb-2"
            >
              GitHub
            </h3>
            <p class="text-verse-600 dark:text-verse-300">
              Contribute to our open source projects
            </p>
          </a>

          <!-- WhatsApp -->
          <a
            :href="WHATSAPP_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700 hover:border-verse-500 transition-colors"
          >
            <h3
              class="text-xl font-semibold text-verse-900 dark:text-verse-100 mb-2"
            >
              WhatsApp
            </h3>
            <p class="text-verse-600 dark:text-verse-300">
              Join our WhatsApp community group
            </p>
          </a>

          <!-- Twitter -->
          <a
            :href="TWITTER_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700 hover:border-verse-500 transition-colors"
          >
            <h3
              class="text-xl font-semibold text-verse-900 dark:text-verse-100 mb-2"
            >
              Twitter
            </h3>
            <p class="text-verse-600 dark:text-verse-300">
              Follow us for updates and announcements
            </p>
          </a>

          <!-- Instagram -->
          <a
            :href="INSTAGRAM_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700 hover:border-verse-500 transition-colors"
          >
            <h3
              class="text-xl font-semibold text-verse-900 dark:text-verse-100 mb-2"
            >
              Instagram
            </h3>
            <p class="text-verse-600 dark:text-verse-300">
              See photos from our events
            </p>
          </a>

          <!-- LinkedIn -->
          <a
            :href="LINKEDIN_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700 hover:border-verse-500 transition-colors"
          >
            <h3
              class="text-xl font-semibold text-verse-900 dark:text-verse-100 mb-2"
            >
              LinkedIn
            </h3>
            <p class="text-verse-600 dark:text-verse-300">
              Connect with us professionally
            </p>
          </a>
        </div>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
