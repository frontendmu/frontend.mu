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
    <div class="contain max-w-5xl">
      <div class="mb-12">
        <h2 class="text-3xl md:text-4xl font-display tracking-tight text-gray-900 dark:text-white">
          Featured Speakers
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
            class="relative z-10 aspect-[4/5] shadow-sm border border-gray-200 dark:border-verse-900 rounded-lg transition-colors group-hover:border-verse-500/50"
          />

          <Link
            :href="`/speaker/${person.id}`"
            class="absolute inset-0 z-20 rounded-lg"
            :aria-label="`View ${person.name}'s profile`"
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
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  </section>
</template>
