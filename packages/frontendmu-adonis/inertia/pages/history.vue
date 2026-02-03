<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
</script>

<template>
  <Head title="History" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20 prose dark:prose-invert max-w-none">
        <BaseHeading :level="1" class="mb-6">History of Frontend Coders Mauritius</BaseHeading>

        <p class="lead">
          We're now in the 3rd iteration of the leadership of this community.
        </p>

        <ul>
          <li><strong>Phase one</strong> - Founded by David Dias in 2016</li>
          <li><strong>Phase two</strong> - Cedric, Sandeep</li>
          <li><strong>Phase three</strong> - Sandeep, Kushul, Cedric</li>
        </ul>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
