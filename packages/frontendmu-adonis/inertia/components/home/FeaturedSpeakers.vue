<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import SpeakerAvatar from '~/components/shared/SpeakerAvatar.vue'
import type { SpeakerDto } from '~/types'

interface Props {
  speakers: SpeakerDto[]
}

defineProps<Props>()
</script>

<template>
  <section v-if="speakers.length > 0" class="relative py-24 overflow-hidden bg-white dark:bg-verse-950">
    <!-- Large Background Text -->
    <div class="absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden">
      <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black text-gray-500/[0.03] dark:text-white/[0.02] whitespace-nowrap">
        ROSTER • CONTRIBUTORS
      </span>
    </div>

    <div class="contain relative z-10 max-w-5xl">
      <!-- Section Header -->
      <div class="relative mb-20 space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black uppercase tracking-[0.3em] text-verse-500 dark:text-verse-300 bg-verse-500/10 px-2 py-0.5 rounded">The Lineup</span>
        </div>
        <h2 class="text-4xl md:text-6xl font-black tracking-tighter dark:text-white leading-none">
          Featured <br />
          <span class="text-verse-600 dark:text-verse-400">Speakers.</span>
        </h2>
        <p class="text-base text-gray-500 dark:text-gray-400 font-medium max-w-xl leading-relaxed">
          Get to know the experts who have shared their knowledge at our meetups.
        </p>
      </div>

      <!-- Editorial Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
        <div 
          v-for="(person, index) in speakers" 
          :key="person.id" 
          class="group relative"
        >
          <!-- Decorative Numbering -->
          <div class="absolute -top-6 -left-4 text-5xl font-black text-gray-100 dark:text-verse-900/50 group-hover:text-verse-500/20 transition-colors z-0 select-none">
            {{ (index + 1).toString().padStart(2, '0') }}
          </div>

          <SpeakerAvatar
            size="full"
            :name="person.name"
            :github-username="person.githubUsername"
            class="relative z-10 aspect-[4/5] shadow-lg grayscale group-hover:grayscale-0 transition-all duration-700 border border-gray-100 dark:border-verse-800 group-hover:border-verse-500 rounded-[2rem]"
          />
          
          <!-- Link Overlay -->
          <Link 
            :href="`/speaker/${person.id}`" 
            class="absolute inset-0 z-20 rounded-[2rem]"
            aria-label="View speaker profile"
          />

          <!-- Text Details -->
          <div class="mt-6 space-y-1 relative z-10">
            <h3 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-verse-500 transition-colors duration-300">
              {{ person.name }}
            </h3>
            <p v-if="person.githubUsername" class="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500">
              @{{ person.githubUsername }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- CTA Footer -->
      <div class="mt-24 flex flex-col items-center gap-8">
        <div class="h-px w-full bg-gray-100 dark:bg-verse-900"></div>
        <Link 
          href="/speakers" 
          class="group relative inline-flex items-center gap-4 px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
        >
          <span class="relative z-10">See all speakers</span>
          <svg class="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.ease-expo {
  transition-timing-function: cubic-bezier(0.87, 0, 0.13, 1);
}
</style>
