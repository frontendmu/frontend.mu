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
    class="group relative flex flex-col justify-between overflow-hidden rounded-xl p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
  >
    <div class="relative z-10 flex justify-between items-start mb-8">
      <div class="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
        <slot name="icon" />
      </div>

      <svg class="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </div>

    <div class="relative z-10 space-y-1 mt-auto">
      <h3 class="font-bold text-lg leading-tight">
        <slot name="tagline" />
      </h3>
      <p class="text-xs text-white/60 line-clamp-2">
        <slot name="description" />
      </p>
    </div>
  </a>
</template>
