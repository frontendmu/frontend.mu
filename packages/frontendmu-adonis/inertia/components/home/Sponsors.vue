<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type { SponsorSummaryDto } from '~/types'

interface Props {
  sponsors: SponsorSummaryDto[]
}

defineProps<Props>()
</script>

<template>
  <section v-if="sponsors.length > 0" class="relative py-24 overflow-hidden">
    <div class="contain relative z-10 max-w-5xl">
      <!-- Section Header -->
      <div class="relative mb-16 space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black uppercase tracking-[0.3em] text-verse-500 dark:text-verse-300 bg-verse-500/10 px-2 py-0.5 rounded">Partners</span>
        </div>
        <h2 class="text-4xl md:text-6xl font-black tracking-tighter dark:text-white leading-none">
          Backed by<br />
          <span class="text-verse-600 dark:text-verse-400">the best.</span>
        </h2>
        <p class="text-base text-gray-500 dark:text-gray-400 font-medium max-w-xl leading-relaxed">
          These organizations support the growth of our developer community.
        </p>
      </div>

      <!-- Sponsor Logos Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <Link
          v-for="sponsor in sponsors"
          :key="sponsor.id"
          :href="`/sponsor/${sponsor.id}`"
          class="group relative flex items-center justify-center h-28 px-6 border border-gray-100 dark:border-verse-800 rounded-2xl transition-all duration-200 hover:border-verse-500 hover:shadow-lg hover:-translate-y-0.5"
          :class="sponsor.darkbg
            ? 'bg-gray-900 dark:bg-black/60'
            : 'bg-white dark:bg-white'"
        >
          <img
            v-if="sponsor.logoUrl"
            :src="sponsor.logoUrl"
            :alt="sponsor.name"
            class="max-w-[140px] max-h-[48px] object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span
            v-else
            class="text-lg font-black tracking-tight text-center group-hover:text-verse-500 transition-colors"
            :class="sponsor.darkbg ? 'text-gray-100' : 'text-gray-900'"
          >
            {{ sponsor.name }}
          </span>
        </Link>
      </div>

      <!-- CTA Footer -->
      <div class="mt-16 flex flex-col items-center gap-8">
        <div class="h-px w-full bg-gray-100 dark:bg-verse-900"></div>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/sponsors"
            class="group inline-flex items-center gap-3 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
          >
            <span>View all partners</span>
            <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/sponsor-us"
            class="group inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-200 dark:border-verse-700 text-gray-700 dark:text-gray-200 rounded-full font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:border-verse-500 hover:text-verse-500 active:scale-95"
          >
            <span>Become a partner</span>
          </Link>
        </div>
      </div>
    </div>
  </section>
</template>
