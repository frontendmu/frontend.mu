<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import SpeakerAvatar from '~/components/shared/SpeakerAvatar.vue'

interface Organizer {
  name: string
  role: string
  imageUrl: string
  id?: string
  linkedin?: string
}

interface CommunityMember {
  name: string
  role: string
  imageUrl: string
  id?: string
}

interface Speaker {
  id: string
  name: string
  github_account: string | null
  avatar_url: string | null
}

interface Contributor {
  username: string
  contributions: number
}

interface Props {
  organizers: Organizer[]
  communityMembers: CommunityMember[]
  speakers: Speaker[]
  contributors: Contributor[]
}

defineProps<Props>()

function getGithubUrl(username: string) {
  return `https://avatars.githubusercontent.com/${username}`
}
</script>

<template>
  <Head title="Team" />
  <DefaultLayout>
    <main class="relative min-h-screen pt-40 pb-32">
      <div class="contain relative z-10 max-w-5xl">
        <!-- Page Header -->
        <div class="mb-20 space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black uppercase tracking-[0.3em] text-verse-500 dark:text-verse-300 bg-verse-500/10 px-2 py-0.5 rounded">The Core</span>
          </div>
          
          <h1 class="text-5xl md:text-7xl font-black tracking-tighter dark:text-white leading-none">
            The People<span class="text-verse-600 dark:text-verse-400">.</span>
          </h1>
          
          <p class="text-base text-gray-500 dark:text-gray-400 font-medium max-w-xl leading-relaxed">
            The dedicated individuals managing and contributing to the Frontend Coders Mauritius ecosystem.
          </p>
        </div>

        <!-- Organizers Section -->
        <section class="mb-24 space-y-10">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-verse-500 dark:text-verse-400">Organizers</span>
            <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div
              v-for="person in organizers"
              :key="person.name"
              class="group"
            >
              <Link :href="person.id ? `/speaker/${person.id}` : '#'" class="block space-y-4">
                <div class="relative aspect-square overflow-hidden rounded-[2.5rem] squircle bg-gray-50 dark:bg-verse-900 border border-gray-100 dark:border-verse-800 transition-all duration-300 group-hover:border-verse-500 shadow-sm">
                  <img
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    :src="person.imageUrl"
                    :alt="person.name"
                  />
                </div>
                <div class="space-y-1">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-verse-500 transition-colors">
                    {{ person.name }}
                  </h3>
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-[10px] font-bold text-verse-500 dark:text-verse-400 uppercase tracking-widest">{{ person.role }}</p>
                    <a v-if="person.linkedin" :href="person.linkedin" target="_blank" class="text-gray-300 dark:text-gray-600 hover:text-verse-500 transition-colors">
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <!-- Community & Contributors -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <!-- Speakers Grid -->
          <section class="lg:col-span-8 space-y-10">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black uppercase tracking-[0.2em] text-verse-500 dark:text-verse-400">Speaker History</span>
              <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
            </div>
            
            <div v-if="speakers.length" class="grid grid-cols-4 md:grid-cols-6 gap-x-4 gap-y-8">
              <Link
                v-for="speaker in speakers"
                :key="speaker.id"
                :href="`/speaker/${speaker.id}`"
                class="group block space-y-2"
              >
                <SpeakerAvatar
                  size="full"
                  :name="speaker.name"
                  :github-username="speaker.github_account"
                  :avatar-url="speaker.avatar_url"
                  class="w-full aspect-square grayscale group-hover:grayscale-0"
                />
                <p class="text-[9px] font-bold text-center text-gray-400 group-hover:text-verse-500 transition-colors truncate">
                  {{ speaker.name.split(' ')[0] }}
                </p>
              </Link>
            </div>
            <div v-else class="py-12 border border-dashed border-gray-100 dark:border-verse-900 rounded-2xl text-center">
              <p class="text-xs font-bold text-gray-400">The speaker registry is currently being indexed.</p>
            </div>
          </section>

          <!-- Contributors Sidebar -->
          <section v-if="contributors.length" class="lg:col-span-4 space-y-10">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Builders</span>
              <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
            </div>

            <div class="space-y-3">
              <a
                v-for="contributor in contributors"
                :key="contributor.username"
                :href="`https://github.com/frontendmu/frontend.mu/commits/?author=${contributor.username}`"
                target="_blank"
                class="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 hover:border-verse-500 transition-all group"
              >
                <div class="flex items-center gap-3">
                  <img
                    :src="getGithubUrl(contributor.username)"
                    class="w-8 h-8 rounded-lg shadow-sm"
                  />
                  <div>
                    <p class="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-verse-500 transition-colors">
                      {{ contributor.username }}
                    </p>
                    <p class="text-[9px] font-mono text-gray-400 uppercase tracking-widest">
                      {{ contributor.contributions }} commits
                    </p>
                  </div>
                </div>
                <svg class="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-verse-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  </DefaultLayout>
</template>
