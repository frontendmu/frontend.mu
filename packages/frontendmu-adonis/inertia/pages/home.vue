<script setup lang="ts">
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import { Head } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Home" />
  <DefaultLayout>
    <main class="pb-20">
      <section class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <h1 class="text-4xl md:text-6xl font-bold text-verse-900 dark:text-verse-100 mb-6">
              Welcome to coders.mu
            </h1>
            <p class="text-xl text-verse-600 dark:text-verse-300 max-w-2xl mx-auto mb-8">
              A community of passionate developers in Mauritius. Join us for regular meetups, workshops, and tech talks.
            </p>
            <a
              href="/meetups"
              class="inline-flex items-center px-6 py-3 bg-verse-600 hover:bg-verse-700 text-white font-medium rounded-lg transition-colors"
            >
              View Meetups
              <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <!-- Stats Section Placeholder -->
      <section class="py-16 bg-verse-50/50 dark:bg-verse-900/30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div class="text-4xl font-bold text-verse-600 dark:text-verse-400">50+</div>
              <div class="text-verse-600 dark:text-verse-300 mt-2">Meetups Held</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-verse-600 dark:text-verse-400">100+</div>
              <div class="text-verse-600 dark:text-verse-300 mt-2">Speakers</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-verse-600 dark:text-verse-400">30+</div>
              <div class="text-verse-600 dark:text-verse-300 mt-2">Contributors</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Section Placeholder -->
      <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-verse-900 dark:text-verse-100 mb-8 text-center">
            Join Our Community
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700">
              <h3 class="text-xl font-semibold text-verse-900 dark:text-verse-100 mb-2">Meetups</h3>
              <p class="text-verse-600 dark:text-verse-300">
                Regular tech meetups featuring talks from local and international speakers.
              </p>
            </div>
            <div class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700">
              <h3 class="text-xl font-semibold text-verse-900 dark:text-verse-100 mb-2">Community</h3>
              <p class="text-verse-600 dark:text-verse-300">
                Connect with fellow developers through Discord, WhatsApp, and GitHub.
              </p>
            </div>
            <div class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700">
              <h3 class="text-xl font-semibold text-verse-900 dark:text-verse-100 mb-2">Open Source</h3>
              <p class="text-verse-600 dark:text-verse-300">
                Contribute to open source projects and learn from the community.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </DefaultLayout>
</template>
