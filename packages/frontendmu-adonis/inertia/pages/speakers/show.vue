<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import SpeakerAvatar from '~/components/shared/SpeakerAvatar.vue'
import type { SpeakerDto, SpeakerSessionDto } from '~/types'

interface Props {
  speaker: SpeakerDto | null
  sessions: SpeakerSessionDto[]
  canEdit?: boolean
}

const props = defineProps<Props>()
</script>

<template>
    <main class="relative min-h-screen pt-40 pb-32">
      <div class="contain relative z-10 max-w-5xl">
        <nav class="mb-12">
          <Link href="/speakers"
            class="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-verse-500 transition-colors">
            <svg class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Roster
          </Link>
        </nav>

        <template v-if="speaker">
          <!-- Main Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            
            <!-- Left Column: Profile -->
            <div class="lg:col-span-7 space-y-12">
              <header class="space-y-6">
                <div class="flex items-center gap-4">
                  <SpeakerAvatar
                    size="xl"
                    :name="speaker.name"
                    :github-username="speaker.githubUsername"
                    :avatar-url="speaker.avatarUrl"
                    class="border-4 border-white dark:border-verse-950 shadow-xl rotate-3 hover:rotate-0 transition-transform"
                  />
                  
                  <div class="space-y-2">
                    <div class="flex items-center gap-4">
                      <h1 class="text-4xl md:text-6xl font-black tracking-tighter dark:text-gray-100 leading-none">
                        {{ speaker.name }}
                      </h1>
                      <Link v-if="canEdit" :href="`/admin/speakers/${speaker.id}/edit`"
                        class="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-verse-500/10 text-verse-600 dark:text-verse-400 rounded-lg hover:bg-verse-500/20 transition-colors">
                        Edit
                      </Link>
                    </div>
                    <p v-if="speaker.githubUsername" class="text-sm font-black uppercase tracking-[0.3em] text-verse-500">
                      @{{ speaker.githubUsername }}
                    </p>
                  </div>
                </div>

                <div v-if="speaker.bio" class="prose prose-lg dark:prose-invert max-w-none font-medium leading-relaxed text-gray-600 dark:text-gray-400">
                  {{ speaker.bio }}
                </div>
              </header>

              <!-- Contribution Record -->
              <section v-if="sessions.length" class="space-y-8">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black uppercase tracking-[0.2em] text-verse-500 dark:text-verse-400">Contribution Record</span>
                  <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
                </div>

                <div class="divide-y divide-gray-100 dark:divide-verse-900 border-y border-gray-100 dark:border-verse-900">
                  <Link
                    v-for="session in sessions"
                    :key="session.id"
                    :href="`/meetup/${session.eventId}`"
                    class="group py-6 block hover:bg-verse-50/30 dark:hover:bg-verse-900/20 transition-colors px-4 -mx-4 rounded-xl"
                  >
                    <div class="flex items-center justify-between gap-6">
                      <div class="space-y-1">
                        <p class="text-[10px] font-mono text-gray-400 dark:text-gray-500">{{ session.eventDate }}</p>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-verse-500 transition-colors">
                          {{ session.title }}
                        </h3>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          at {{ session.eventTitle }}
                        </p>
                      </div>
                      <svg class="w-4 h-4 text-gray-300 dark:text-verse-800 transition-colors group-hover:text-verse-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>
              </section>
            </div>

            <!-- Right Column: Sidebar -->
            <aside class="lg:col-span-5">
              <div class="sticky top-24 space-y-8">
                <!-- Connectivity Card -->
                <div class="bg-white dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-xl overflow-hidden shadow-sm">
                  <div class="px-5 py-3 bg-gray-50 dark:bg-verse-900/60 border-b border-gray-100 dark:border-verse-800">
                    <h3 class="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Connectivity</h3>
                  </div>
                  
                  <div class="p-5 space-y-4">
                    <a v-if="speaker.githubUsername" :href="`https://github.com/${speaker.githubUsername}`" target="_blank" class="flex items-center justify-between p-3 bg-white dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-lg hover:border-verse-500 transition-all group">
                      <div class="flex items-center gap-3">
                        <svg class="w-4 h-4 text-gray-400 group-hover:text-verse-500 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        <span class="text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">GitHub</span>
                      </div>
                      <span class="text-[10px] font-mono text-gray-400">@{{ speaker.githubUsername }}</span>
                    </a>

                    <a v-if="speaker.linkedinUrl" :href="speaker.linkedinUrl" target="_blank" class="flex items-center justify-between p-3 bg-white dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-lg hover:border-verse-500 transition-all group">
                      <div class="flex items-center gap-3">
                        <svg class="w-4 h-4 text-gray-400 group-hover:text-verse-500 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        <span class="text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">LinkedIn</span>
                      </div>
                      <svg class="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  </div>
                </div>

                <!-- Stats Profile -->
                <div class="p-6 border border-gray-100 dark:border-verse-800 rounded-xl bg-gray-50 dark:bg-verse-950/20 space-y-4">
                  <div class="flex items-center justify-between">
                    <p class="text-[10px] font-mono uppercase tracking-widest text-gray-400">Total Talks</p>
                    <span class="text-xl font-black text-verse-500">{{ sessions.length }}</span>
                  </div>
                  <div class="h-px w-full bg-gray-100 dark:bg-verse-800"></div>
                  <div class="flex items-center justify-between">
                    <p class="text-[10px] font-mono uppercase tracking-widest text-gray-400">First Entry</p>
                    <span class="text-xs font-bold text-gray-600 dark:text-gray-300">{{ sessions[sessions.length - 1]?.eventDate || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </template>

        <template v-else>
          <div class="text-center py-32 space-y-8">
            <div class="w-24 h-24 bg-verse-50 dark:bg-verse-900/20 rounded-full flex items-center justify-center mx-auto">
              <svg class="w-12 h-12 text-verse-500 dark:text-verse-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 class="text-4xl font-black tracking-tight dark:text-white">Speaker not found.</h2>
            <Link href="/speakers"
              class="inline-flex items-center gap-4 px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">
              Return to Roster
            </Link>
          </div>
        </template>
      </div>
    </main>
</template>
