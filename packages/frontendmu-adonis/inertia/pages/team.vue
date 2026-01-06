<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
</script>

<template>
  <Head title="Team" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <BaseHeading :level="1" class="mb-6">Our Team</BaseHeading>
        <p class="text-verse-700 dark:text-verse-300 mb-8">
          Meet the people behind coders.mu who help organize our community
          events.
        </p>

        <!-- Organizers Section -->
        <section class="mb-12">
          <h2
            class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-6"
          >
            Organizers
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="text-center">
              <div
                class="w-20 h-20 mx-auto bg-verse-200 dark:bg-verse-700 rounded-full mb-3"
              />
              <p class="font-medium text-verse-900 dark:text-verse-100">
                Coming soon...
              </p>
            </div>
          </div>
        </section>

        <!-- Speakers Section -->
        <section class="mb-12">
          <h2
            class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-6"
          >
            Speakers
          </h2>
          <p class="text-verse-600 dark:text-verse-400">
            Our amazing speakers will be listed here.
          </p>
        </section>

        <!-- Contributors Section -->
        <section>
          <h2
            class="text-2xl font-bold text-verse-900 dark:text-verse-100 mb-6"
          >
            Contributors
          </h2>
          <p class="text-verse-600 dark:text-verse-400">
            Thank you to all our GitHub contributors!
          </p>
        </section>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
