<script setup lang="ts">
interface Props {
  href: string
}

defineProps<Props>()
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="flex flex-row items-center justify-between gap-4 p-6 rounded-xl text-white transition-transform hover:scale-105"
  >
    <div class="flex flex-col gap-2">
      <div class="font-bold text-xl">
        <slot name="tagline" />
      </div>
      <div class="text-white/80">
        <slot name="description" />
      </div>
    </div>
    <div class="flex-shrink-0">
      <slot name="icon" />
    </div>
  </a>
</template>
