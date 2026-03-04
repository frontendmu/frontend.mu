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
  <section v-if="speakers.length > 0" class="relative py-32 overflow-hidden bg-white dark:bg-verse-950">
    <!-- Large Background Text -->
    <div class="absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden">
      <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black text-gray-500/[0.03] dark:text-white/[0.02] whitespace-nowrap">
        SPEAKERS • TALKS • EVENTS • KNOWLEDGE
      </span>
    </div>

    <div class="contain relative z-10">
      <!-- Section Header -->
      <div class="relative mb-32 max-w-4xl mx-auto text-center lg:text-left lg:mx-0">
        <div class="inline-flex items-center gap-3 mb-6">
          <span class="h-1 w-12 bg-verse-500 rounded-full"></span>
          <span class="text-sm font-black uppercase tracking-[0.4em] text-verse-500">The Lineup</span>
        </div>
        <h2 class="text-6xl md:text-8xl font-black tracking-tight dark:text-white leading-[0.9]">
          Featured <br />
          <span class="text-verse-600 dark:text-verse-400">Speakers.</span>
        </h2>
        <p class="mt-8 text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl">
          Get to know some of the amazing people who have shared their expertise at our meetups. From local legends to international guests.
        </p>
      </div>

      <!-- Editorial Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-48 gap-x-12 lg:gap-x-24">
        <div 
          v-for="(person, index) in speakers" 
          :key="person.id" 
          class="group relative"
          :class="{ 'lg:translate-y-16': index % 3 === 1, 'lg:translate-y-32': index % 3 === 2 }"
        >
          <!-- Decorative Numbering -->
          <div class="absolute -top-12 -left-6 text-8xl font-black text-gray-100 dark:text-verse-900/50 group-hover:text-verse-500/20 transition-colors z-0 select-none">
            {{ (index + 1).toString().padStart(2, '0') }}
          </div>

          <SpeakerAvatar
            size="full"
            :name="person.name"
            :github-username="person.githubUsername"
            class="relative z-10 aspect-[4/5] shadow-xl grayscale group-hover:grayscale-0 transition-all duration-700 border border-gray-100 dark:border-verse-800 group-hover:border-verse-500 rounded-[2.5rem]"
          />
          
          <!-- Link Overlay -->
          <Link 
            :href="`/speaker/${person.id}`" 
            class="absolute inset-0 z-20 rounded-[2.5rem]"
            aria-label="View speaker profile"
          />

            <!-- Hover Branding -->
            <div class="absolute top-6 right-6 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
               <div class="bg-white/90 dark:bg-verse-950/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/20 dark:border-white/10">
                 <svg class="w-6 h-6 text-verse-500 dark:text-verse-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </div>
            </div>

          <!-- Text Details -->
          <div class="mt-12 space-y-3 relative z-10">
            <h3 class="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white group-hover:text-verse-500 transition-colors duration-300">
              {{ person.name }}
            </h3>
            <div class="flex items-center gap-4">
              <span class="h-0.5 w-6 bg-verse-500 transition-all duration-500 group-hover:w-12"></span>
              <p v-if="person.githubUsername" class="text-sm font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500">
                @{{ person.githubUsername }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- CTA Footer -->
      <div class="mt-64 flex flex-col items-center gap-8">
        <div class="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-verse-800 to-transparent"></div>
        <Link 
          href="/speakers" 
          class="group relative inline-flex items-center gap-6 px-16 py-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-black uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-black/20 dark:shadow-white/10"
        >
          <span class="relative z-10">See all speakers</span>
          <svg class="w-6 h-6 relative z-10 text-white dark:text-gray-900 transition-transform group-hover:translate-x-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div class="absolute inset-0 bg-verse-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-expo"></div>
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
