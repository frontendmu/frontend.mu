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
      <div class="relative mb-16 space-y-4">
        <p class="text-sm font-medium text-gray-400 dark:text-gray-500">
          The people behind the talks
        </p>
        <h2 class="text-4xl md:text-6xl font-display tracking-tight dark:text-white leading-none">
          Featured <span class="font-display-italic text-verse-600 dark:text-verse-400">Speakers</span>
        </h2>
      </div>

      <!-- Speaker Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        <div
          v-for="person in speakers"
          :key="person.id"
          class="group relative"
        >
          <SpeakerAvatar
            size="full"
            :name="person.name"
            :github-username="person.githubUsername"
            class="relative z-10 aspect-[4/5] shadow-md transition-all duration-500 border border-gray-100 dark:border-verse-800 group-hover:border-verse-500/60 rounded-2xl group-hover:shadow-xl group-hover:-translate-y-1"
          />

          <Link
            :href="`/speaker/${person.id}`"
            class="absolute inset-0 z-20 rounded-2xl"
            aria-label="View speaker profile"
          />

          <div class="mt-4 space-y-0.5 relative z-10">
            <h3 class="text-base font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-verse-500 transition-colors">
              {{ person.name }}
            </h3>
            <p v-if="person.githubUsername" class="text-xs text-gray-400 dark:text-gray-500">
              @{{ person.githubUsername }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- CTA Footer -->
      <div class="mt-16 flex justify-center">
        <Link
          href="/speakers"
          class="group inline-flex items-center gap-3 text-sm font-semibold text-verse-500 dark:text-verse-400 hover:text-verse-600 dark:hover:text-verse-300 transition-colors"
        >
          See all speakers
          <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
