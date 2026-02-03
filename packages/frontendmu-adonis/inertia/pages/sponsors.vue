<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

interface Sponsor {
  id: string
  name: string
  website: string | null
  description: string | null
  sponsorTypes: string[]
  darkbg: boolean
}

interface Props {
  sponsors: Sponsor[]
}

defineProps<Props>()
</script>

<template>
  <Head title="Sponsors" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <BaseHeading :level="1" class="mb-6">Our Sponsors</BaseHeading>
        <p class="text-verse-700 dark:text-verse-300 mb-8">
          We're grateful to our sponsors who help make our meetups possible by providing venues and food.
        </p>

        <div v-if="!sponsors.length" class="text-center py-12">
          <p class="text-verse-500 dark:text-verse-400">No sponsors to display</p>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <a
            v-for="sponsor in sponsors"
            :key="sponsor.id"
            :href="`/sponsor/${sponsor.id}`"
            class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700 flex items-center justify-center h-32 hover:shadow-md transition-shadow"
            :class="{ 'bg-verse-900': sponsor.darkbg }"
          >
            <span class="text-xl font-medium text-verse-900 dark:text-verse-100">
              {{ sponsor.name }}
            </span>
          </a>
        </div>

        <div class="mt-16 p-6 bg-verse-50 dark:bg-verse-800/30 rounded-xl text-center">
          <h3 class="text-xl font-bold text-verse-900 dark:text-verse-100 mb-2">
            Want to sponsor our meetups?
          </h3>
          <p class="text-verse-600 dark:text-verse-400 mb-4">
            Help us organize more events by providing a venue or lunch for our community.
          </p>
          <a
            href="/sponsor-us"
            class="inline-block px-6 py-2 bg-verse-600 hover:bg-verse-700 text-white rounded-lg font-medium transition-colors"
          >
            Become a Sponsor
          </a>
        </div>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
