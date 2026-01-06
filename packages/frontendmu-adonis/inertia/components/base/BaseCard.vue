<script setup lang="ts">
// BaseCard component - a simple card wrapper with glass-morphism styling
</script>

<template>
  <div
    class="bg-verse-200/10 overflow-hidden dark:bg-verse-500/20 dark:backdrop-blur-sm px-6 py-12 shadow-lg sm:rounded-lg sm:px-12"
  >
    <slot />
  </div>
</template>
