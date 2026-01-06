<script setup lang="ts">
import BackgroundShapes from '~/components/shared/BackgroundShapes.vue'
</script>

<template>
  <div
    class="from-verse-100 to-white bg-fixed dark:from-verse-900 dark:to-verse-950 bg-gradient-to-tl relative min-h-[100dvh]"
  >
    <div class="relative z-0">
      <BackgroundShapes />
    </div>
    <div class="relative z-10 min-h-[100dvh]">
      <slot />
    </div>
  </div>
</template>
