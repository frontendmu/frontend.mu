<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'

interface Sponsor {
  id: string
  name: string
  website: string | null
  description: string | null
  sponsorTypes: string[]
  darkbg: boolean
}

interface Props {
  sponsors: Sponsor[]
}

defineProps<Props>()
</script>

<template>
  <Head title="Sponsors" />
  <DefaultLayout>
    <main class="relative min-h-screen pt-40 pb-32">
      <div class="contain relative z-10 max-w-5xl">
        <!-- Page Header -->
        <div class="mb-20 space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black uppercase tracking-[0.3em] text-verse-500 dark:text-verse-300 bg-verse-500/10 px-2 py-0.5 rounded">Partners</span>
          </div>
          
          <h1 class="text-5xl md:text-7xl font-black tracking-tighter dark:text-white leading-none">
            Our Partners<span class="text-verse-600 dark:text-verse-400">.</span>
          </h1>
          
          <p class="text-base text-gray-500 dark:text-gray-400 font-medium max-w-xl leading-relaxed">
            These organizations support the growth of the local developer ecosystem.
          </p>
        </div>

        <!-- Sponsors Grid -->
        <div v-if="sponsors.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-32">
          <Link
            v-for="sponsor in sponsors"
            :key="sponsor.id"
            :href="`/sponsor/${sponsor.id}`"
            class="group relative aspect-video flex items-center justify-center p-6 bg-white dark:bg-verse-950/40 border border-gray-100 dark:border-verse-800 rounded-2xl squircle transition-all hover:border-verse-500 shadow-sm hover:shadow-md"
            :class="{ 'dark:bg-black/40': sponsor.darkbg }"
          >
            <span class="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100 text-center group-hover:text-verse-500 transition-colors">
              {{ sponsor.name }}
            </span>
            
            <!-- Hover Arrow -->
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-4 h-4 text-verse-500 dark:text-verse-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        </div>

        <div v-else class="text-center py-32 space-y-6">
          <p class="text-xl font-bold text-gray-400">Our partner roster is being updated.</p>
        </div>

        <!-- Become a Sponsor CTA -->
        <div class="relative p-10 md:p-16 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-3xl shadow-2xl overflow-hidden group">
          <!-- Geometric Background -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-verse-500/10 rounded-full blur-[80px] transition-transform duration-1000 group-hover:scale-150"></div>
          
          <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div class="max-w-xl space-y-4 text-center lg:text-left">
              <h2 class="text-3xl md:text-5xl font-black tracking-tight leading-none">Empower the next generation.</h2>
              <p class="text-base font-medium opacity-70 leading-relaxed">
                Help us organize more high-impact events, workshops, and community projects.
              </p>
            </div>
            
            <Link
              href="/sponsor-us"
              class="group/btn relative inline-flex items-center gap-4 px-10 py-4 bg-verse-500 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              <span>Partner with us</span>
              <svg class="w-4 h-4 transition-transform group-hover/btn:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  </DefaultLayout>
</template>
