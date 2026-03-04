<script setup lang="ts">
import BackgroundShapes from '~/components/shared/BackgroundShapes.vue'
</script>

<template>
  <div class="bg-white dark:bg-verse-950 relative min-h-[100dvh]">
    <div class="relative z-0">
      <BackgroundShapes />
    </div>
    <div class="relative z-10 min-h-[100dvh]">
      <slot />
    </div>
  </div>
</template>
