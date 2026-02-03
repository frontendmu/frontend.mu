<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
</script>

<template>
  <Head title="About" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <BaseHeading :level="1" class="mb-6">About coders.mu</BaseHeading>

        <div class="prose dark:prose-invert max-w-none">
          <p class="text-lg text-verse-700 dark:text-verse-300 mb-6">
            coders.mu (formerly known as Front-End Coders Mauritius) is a
            community of passionate developers in Mauritius. We organize regular
            meetups, workshops, and tech talks to help developers learn, share,
            and grow together.
          </p>

          <h2
            class="text-2xl font-bold text-verse-900 dark:text-verse-100 mt-8 mb-4"
          >
            Our Mission
          </h2>
          <p class="text-verse-700 dark:text-verse-300 mb-6">
            To foster a vibrant developer community in Mauritius by providing
            platforms for learning, networking, and collaboration.
          </p>

          <h2
            class="text-2xl font-bold text-verse-900 dark:text-verse-100 mt-8 mb-4"
          >
            What We Do
          </h2>
          <ul class="list-disc pl-6 text-verse-700 dark:text-verse-300 space-y-2">
            <li>Monthly meetups with talks from local and international speakers</li>
            <li>Hands-on workshops on various technologies</li>
            <li>Community discussions on Discord and WhatsApp</li>
            <li>Open source projects and collaborations</li>
          </ul>

          <h2
            class="text-2xl font-bold text-verse-900 dark:text-verse-100 mt-8 mb-4"
          >
            Join Us
          </h2>
          <p class="text-verse-700 dark:text-verse-300">
            Whether you're a beginner or an experienced developer, you're
            welcome to join our community. Attend our meetups, join our Discord
            server, and connect with fellow developers.
          </p>
        </div>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
