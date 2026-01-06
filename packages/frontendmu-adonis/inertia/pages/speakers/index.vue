<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

interface Speaker {
  id: string
  name: string
  github_account: string
  featured?: boolean
}

interface Props {
  speakers: Speaker[]
}

const props = defineProps<Props>()
</script>

<template>
  <Head title="Speakers" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <BaseHeading :level="1" class="mb-6">Speakers</BaseHeading>
        <p class="text-verse-700 dark:text-verse-300 mb-8">
          Meet the amazing speakers who have shared their knowledge at our
          meetups.
        </p>

        <div
          v-if="speakers.length"
          class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
        >
          <a
            v-for="speaker in speakers"
            :key="speaker.id"
            :href="`/speaker/${speaker.id}`"
            class="group text-center"
          >
            <img
              :src="`https://avatars.githubusercontent.com/${speaker.github_account}`"
              :alt="speaker.name"
              class="w-20 h-20 mx-auto rounded-full border-2 border-verse-200 dark:border-verse-700 group-hover:border-verse-500 transition-colors"
            />
            <p
              class="mt-3 font-medium text-verse-900 dark:text-verse-100 group-hover:text-verse-600 dark:group-hover:text-verse-300"
            >
              {{ speaker.name }}
            </p>
          </a>
        </div>

        <div
          v-else
          class="text-center py-16 text-verse-600 dark:text-verse-400"
        >
          <p>No speakers found.</p>
        </div>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
