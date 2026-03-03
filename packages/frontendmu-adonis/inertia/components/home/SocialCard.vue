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
    class="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-8 text-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl active:scale-95"
  >
    <!-- Glow Effect -->
    <div class="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/20 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:bg-white/30"></div>
    
    <div class="relative z-10 flex justify-between items-start mb-12">
      <div class="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-500">
        <slot name="icon" />
      </div>
      
      <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </div>

    <div class="relative z-10 space-y-2 mt-auto">
      <h3 class="font-black text-2xl uppercase tracking-tighter leading-none">
        <slot name="tagline" />
      </h3>
      <p class="text-sm font-bold text-white/70 line-clamp-2">
        <slot name="description" />
      </p>
    </div>
  </a>
</template>
