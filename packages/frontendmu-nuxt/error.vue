<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError,
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <NuxtLayout name="simple">
    <ContentBlock>
      <div class="flex flex-col justify-start items-center gap-10 mx-auto max-w-[60ch] text-center">
        <BaseHeading :level="1" weight="bold">
          Oops!
        </BaseHeading>

        <BaseHeading :level="3" weight="bold">
          {{ error.statusCode }} - The page you are looking for doesn't exist
        </BaseHeading>

        <p>{{ error.message }}</p>

        <button
          class="mx-auto bg-verse-500 hover:bg-verse-600 transition-colors duration-200 text-md block rounded-full px-4 py-4 text-center font-medium text-white md:px-6 md:text-lg cursor-pointer"
          @click="handleError"
        >
          Back to Home
        </button>
      </div>
    </ContentBlock>
  </NuxtLayout>
</template>
