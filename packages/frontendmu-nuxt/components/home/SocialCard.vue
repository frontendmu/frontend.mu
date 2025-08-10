<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  href: String,
})
</script>

<template>
  <a
    class="social-card hover:opacity-90 cursor-pointer transition-all duration-200 py-4" :href="`${props.href}?ref=coders.mu`" target="_blank"
  >
    <div class="flex gap-4 items-center text-white">
      <slot name="icon" />
      <div>
        <div class="text-2xl font-bold">
          <slot name="tagline" />
        </div>
        <slot name="description" />
      </div>
    </div>
  </a>
</template>

<style scoped lang="postcss">
.social-card {
  @apply flex p-4 rounded-xl shadow-xl;
}
</style>
