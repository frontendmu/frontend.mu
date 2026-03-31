<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Link } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import { useAuth } from '~/composables/use_auth'

interface Props {
  sponsors: Data.Sponsor[]
}

defineProps<Props>()

const { isAdmin } = useAuth()
</script>

<template>
  <Head title="Sponsors" />
  <main class="relative min-h-screen pt-40 pb-32">
    <div class="contain relative z-10 max-w-5xl">
      <!-- Page Header -->
      <div class="mb-20 space-y-4">
        <div class="flex items-center gap-3">
          <p class="text-sm font-medium text-gray-400 dark:text-gray-500">Supported by</p>
          <Link
            v-if="isAdmin"
            href="/admin/sponsors"
            class="text-sm font-semibold text-gray-400 hover:text-verse-500 transition-colors"
          >
            Manage
          </Link>
        </div>

        <h1 class="text-5xl md:text-6xl font-display tracking-tight dark:text-white leading-none">
          Our Partners
        </h1>

        <p class="text-base text-gray-500 dark:text-gray-400 font-medium max-w-xl leading-relaxed">
          These organizations support the growth of the local developer ecosystem.
        </p>
      </div>

      <!-- Sponsors Grid -->
      <div
        v-if="sponsors.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-32"
      >
        <Link
          v-for="sponsor in sponsors"
          :key="sponsor.id"
          :href="`/sponsor/${sponsor.id}`"
          class="group relative flex flex-col bg-white dark:bg-verse-950/40 border border-gray-100 dark:border-verse-800 rounded-xl transition-all duration-200 hover:border-verse-500 shadow-sm hover:shadow-lg hover:-translate-y-1"
        >
          <!-- Logo Area -->
          <div
            class="flex items-center justify-center p-8 h-44 rounded-t-2xl"
            :class="sponsor.logoBg ? '' : 'bg-white dark:bg-white'"
            :style="sponsor.logoBg ? { backgroundColor: sponsor.logoBg } : {}"
          >
            <img
              v-if="sponsor.logoUrl"
              :src="sponsor.logoUrl"
              :alt="sponsor.name"
              class="max-w-[180px] max-h-[80px] object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span
              v-else
              class="text-2xl font-bold tracking-tight text-center"
              :class="
                sponsor.logoBg && sponsor.logoBg !== '#ffffff' ? 'text-gray-100' : 'text-gray-900'
              "
            >
              {{ sponsor.name }}
            </span>
          </div>

          <!-- Info Area -->
          <div class="flex flex-col gap-3 p-5">
            <h3
              class="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-snug group-hover:text-verse-500 transition-colors"
            >
              {{ sponsor.name }}
            </h3>

            <div v-if="sponsor.sponsorTypes.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="type in sponsor.sponsorTypes"
                :key="type"
                class="px-2 py-0.5 bg-verse-500/10 text-verse-600 dark:text-verse-400 border border-verse-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider"
              >
                {{ type }}
              </span>
            </div>
          </div>

          <!-- Hover Arrow -->
          <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg
              class="w-4 h-4 text-verse-500 dark:text-verse-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>
        </Link>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-32 space-y-6">
        <p class="text-xl font-bold text-gray-400">Our partner roster is being updated.</p>
      </div>

      <!-- Become a Sponsor CTA -->
      <div
        class="relative p-8 md:p-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-2xl overflow-hidden group"
      >
        <!-- Geometric Background -->
        <div
          class="absolute top-0 right-0 w-64 h-64 bg-verse-500/10 rounded-full blur-[80px] transition-transform duration-1000 group-hover:scale-150"
        ></div>

        <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div class="max-w-xl space-y-4 text-center lg:text-left">
            <h2 class="text-3xl md:text-5xl font-display tracking-tight leading-none">
              Empower the next generation.
            </h2>
            <p class="text-base font-medium opacity-70 leading-relaxed">
              Help us organize more high-impact events, workshops, and community projects.
            </p>
          </div>

          <Link
            href="/sponsor-us"
            class="group/btn relative inline-flex items-center gap-4 px-10 py-4 bg-verse-500 text-white rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            <span>Partner with us</span>
            <svg
              class="w-4 h-4 transition-transform group-hover/btn:translate-x-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  </main>
</template>
