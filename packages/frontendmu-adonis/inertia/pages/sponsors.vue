<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
</script>

<template>
  <Head title="Sponsors" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <BaseHeading :level="1" class="mb-6">Our Sponsors</BaseHeading>
        <p class="text-verse-700 dark:text-verse-300 mb-8">
          We're grateful to our sponsors who help make our meetups possible.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            class="p-6 bg-white dark:bg-verse-800/50 rounded-xl shadow-sm border border-verse-100 dark:border-verse-700 flex items-center justify-center h-32"
          >
            <p class="text-verse-500 dark:text-verse-400">Sponsors coming soon...</p>
          </div>
        </div>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
