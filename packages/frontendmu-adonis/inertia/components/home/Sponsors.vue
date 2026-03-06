<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type { SponsorSummaryDto } from '~/types'

interface Props {
  sponsors: SponsorSummaryDto[]
}

defineProps<Props>()
</script>

<template>
  <section v-if="sponsors.length > 0" class="relative py-12 overflow-hidden">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div class="flex items-center justify-between">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Trusted by</p>
        <Link href="/sponsors" class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 hover:text-verse-500 dark:hover:text-verse-400 transition-colors">
          View all
        </Link>
      </div>
    </div>

    <!-- Marquee with edge fade -->
    <div class="sponsor-marquee relative">
      <!-- Edge fades -->
      <div class="absolute left-0 top-0 bottom-0 w-24 sm:w-40 z-10 pointer-events-none bg-gradient-to-r from-white dark:from-verse-950 to-transparent"></div>
      <div class="absolute right-0 top-0 bottom-0 w-24 sm:w-40 z-10 pointer-events-none bg-gradient-to-l from-white dark:from-verse-950 to-transparent"></div>

      <!-- Scrolling track (duplicated for seamless loop) -->
      <div class="sponsor-track flex items-center gap-12 w-max">
        <Link
          v-for="sponsor in sponsors"
          :key="sponsor.id"
          :href="`/sponsor/${sponsor.id}`"
          class="sponsor-item flex items-center justify-center shrink-0 h-12 px-8 rounded-lg transition-opacity duration-300 hover:opacity-100"
          :class="sponsor.darkbg
            ? 'bg-gray-900 dark:bg-gray-900'
            : ''"
        >
          <img
            v-if="sponsor.logoUrl"
            :src="sponsor.logoUrl"
            :alt="sponsor.name"
            class="max-h-[28px] w-auto object-contain"
            :class="sponsor.darkbg
              ? ''
              : 'dark:invert dark:brightness-200'"
          />
          <span
            v-else
            class="text-sm font-bold tracking-tight whitespace-nowrap"
            :class="sponsor.darkbg ? 'text-white' : 'text-gray-900 dark:text-gray-100'"
          >
            {{ sponsor.name }}
          </span>
        </Link>

        <!-- Duplicate set for seamless loop -->
        <Link
          v-for="sponsor in sponsors"
          :key="'dup-' + sponsor.id"
          :href="`/sponsor/${sponsor.id}`"
          class="sponsor-item flex items-center justify-center shrink-0 h-12 px-8 rounded-lg transition-opacity duration-300 hover:opacity-100"
          :class="sponsor.darkbg
            ? 'bg-gray-900 dark:bg-gray-900'
            : ''"
          aria-hidden="true"
        >
          <img
            v-if="sponsor.logoUrl"
            :src="sponsor.logoUrl"
            :alt="sponsor.name"
            class="max-h-[28px] w-auto object-contain"
            :class="sponsor.darkbg
              ? ''
              : 'dark:invert dark:brightness-200'"
          />
          <span
            v-else
            class="text-sm font-bold tracking-tight whitespace-nowrap"
            :class="sponsor.darkbg ? 'text-white' : 'text-gray-900 dark:text-gray-100'"
          >
            {{ sponsor.name }}
          </span>
        </Link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sponsor-track {
  animation: scroll 30s linear infinite;
}

.sponsor-track:hover {
  animation-play-state: paused;
}

.sponsor-item {
  opacity: 0.5;
}

.sponsor-item:hover {
  opacity: 1;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sponsor-track {
    animation: none;
  }

  .sponsor-item {
    opacity: 0.7;
  }
}
</style>
