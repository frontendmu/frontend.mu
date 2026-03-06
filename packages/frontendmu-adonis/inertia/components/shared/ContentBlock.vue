<script setup lang="ts">
interface Props {
  container?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  container: true,
})
</script>

<template>
  <div :class="[container && 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8']">
    <slot />
  </div>
</template>
