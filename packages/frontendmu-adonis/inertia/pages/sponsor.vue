<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import { sanitizeHtml } from '~/composables/useSanitize'
import type { SponsorDto, EventSummaryDto } from '~/types'

interface Props {
  sponsor: SponsorDto | null
  meetups: EventSummaryDto[]
}

defineProps<Props>()

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <Head :title="sponsor?.name || 'Sponsor'" />
    <main class="relative min-h-screen pt-40 pb-32">
      <div class="contain relative z-10 max-w-5xl">
        <nav class="mb-12">
          <Link href="/sponsors"
            class="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-verse-500 transition-colors">
            <svg class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Partners
          </Link>
        </nav>

        <template v-if="sponsor">
          <!-- Partner Hero -->
          <div class="max-w-4xl mb-24 space-y-6 text-center lg:text-left">
            <div class="inline-flex items-center gap-2">
              <span class="text-[10px] font-black uppercase tracking-[0.2em] text-verse-500 dark:text-verse-300 bg-verse-500/10 px-2 py-0.5 rounded">Partner Spotlight</span>
            </div>
            
            <h1 class="text-5xl md:text-7xl font-black tracking-tighter dark:text-gray-100 leading-none">
              {{ sponsor.name }}
            </h1>

            <div class="flex flex-wrap justify-center lg:justify-start gap-2">
              <span
                v-for="type in sponsor.sponsorTypes"
                :key="type"
                class="px-3 py-1 bg-verse-500/10 text-verse-600 dark:text-verse-400 border border-verse-500/20 rounded-full text-[9px] font-black uppercase tracking-widest"
              >
                {{ type }}
              </span>
            </div>

            <div v-if="sponsor.website" class="pt-4">
              <a
                :href="sponsor.website"
                target="_blank"
                class="group inline-flex items-center gap-2 text-lg font-bold text-gray-500 dark:text-gray-400 hover:text-verse-500 transition-colors"
              >
                <svg class="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                {{ sponsor.website.replace('https://', '').replace('http://', '') }}
              </a>
            </div>
          </div>

          <!-- Impact Section -->
          <section v-if="meetups.length" class="space-y-10">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black uppercase tracking-[0.2em] text-verse-500 dark:text-verse-400">Shared Experiences</span>
              <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="meetup in meetups"
                :key="meetup.id"
                class="group relative p-6 bg-white dark:bg-verse-950/40 border border-gray-100 dark:border-verse-800 rounded-2xl transition-all hover:border-verse-500 hover:shadow-md"
              >
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <p class="text-[10px] font-mono uppercase tracking-widest text-verse-500 dark:text-verse-400">{{ formatDate(meetup.date) }}</p>
                    <Link :href="`/meetup/${meetup.id}`" class="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-verse-50 dark:bg-verse-900 text-verse-500 dark:text-verse-400">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                  
                  <div class="space-y-1">
                    <h3 class="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100 leading-tight group-hover:text-verse-500 transition-colors">
                      {{ meetup.title }}
                    </h3>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ meetup.venue }}</p>
                  </div>

                  <div
                    v-if="meetup.description"
                    class="prose prose-sm dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed"
                    v-html="sanitizeHtml(meetup.description)"
                  />
                </div>
              </div>
            </div>
          </section>
        </template>

        <template v-else>
          <div class="text-center py-32 space-y-8">
            <div class="w-24 h-24 bg-verse-50 dark:bg-verse-900/20 rounded-full flex items-center justify-center mx-auto">
              <svg class="w-12 h-12 text-verse-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 class="text-4xl font-black tracking-tight dark:text-white">Partner not found.</h2>
            <Link href="/sponsors" class="inline-flex items-center gap-4 px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">
              Return to Partners
            </Link>
          </div>
        </template>
      </div>
    </main>
</template>
