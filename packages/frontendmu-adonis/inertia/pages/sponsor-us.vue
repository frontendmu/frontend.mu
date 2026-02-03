<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
</script>

<template>
  <Head title="Sponsor Us" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <BaseHeading :level="1" class="mb-6">Sponsor Us</BaseHeading>
        <p class="text-verse-700 dark:text-verse-300 mb-8">
          Support the developer community in Mauritius by sponsoring our
          meetups.
        </p>

        <div class="prose dark:prose-invert max-w-none">
          <h2 class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-4">
            Why Sponsor?
          </h2>
          <ul class="list-disc pl-6 text-verse-700 dark:text-verse-300 space-y-2">
            <li>Reach talented developers in Mauritius</li>
            <li>Show your support for the tech community</li>
            <li>Gain visibility among local tech professionals</li>
            <li>Network with passionate developers</li>
          </ul>

          <h2
            class="text-2xl font-bold text-verse-900 dark:text-verse-100 mt-8 mb-4"
          >
            Sponsorship Options
          </h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div
              class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700"
            >
              <h3
                class="text-xl font-semibold text-verse-900 dark:text-verse-100 mb-2"
              >
                Venue Sponsor
              </h3>
              <p class="text-verse-600 dark:text-verse-300">
                Provide a space for our meetups
              </p>
            </div>
            <div
              class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700"
            >
              <h3
                class="text-xl font-semibold text-verse-900 dark:text-verse-100 mb-2"
              >
                Food & Drinks
              </h3>
              <p class="text-verse-600 dark:text-verse-300">
                Sponsor refreshments for attendees
              </p>
            </div>
          </div>

          <p class="mt-8 text-verse-700 dark:text-verse-300">
            Interested in sponsoring? Contact us at
            <a
              href="mailto:hello@frontend.mu"
              class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200 underline"
              >hello@frontend.mu</a
            >
          </p>
        </div>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
