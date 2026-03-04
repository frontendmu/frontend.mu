<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import SpeakerAvatar from '~/components/shared/SpeakerAvatar.vue'

interface Speaker {
  id: string
  name: string
  github_account: string | null
  featured: boolean
  bio: string | null
  avatar_url: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  websiteUrl: string | null
}

interface Props {
  speakers: Speaker[]
}

const props = defineProps<Props>()

const featuredSpeakers = computed(() => props.speakers.filter((s) => s.featured))
const regularSpeakers = computed(() => props.speakers.filter((s) => !s.featured))
</script>

<template>
  <Head title="Speakers" />
  <DefaultLayout>
    <main class="relative min-h-screen pt-40 pb-24">
      <div class="contain relative z-10">
        <!-- Page Header -->
        <div class="max-w-4xl mb-24 space-y-6">
          <div class="inline-flex items-center gap-3">
            <span class="h-1 w-12 bg-verse-500 rounded-full"></span>
            <span class="text-sm font-black uppercase tracking-[0.4em] text-verse-500">The Roster</span>
          </div>
          
          <h1 class="text-6xl md:text-8xl font-black tracking-tighter dark:text-white leading-[0.9]">
            The <br />
            <span class="text-verse-600 dark:text-verse-400">Speakers.</span>
          </h1>
          
          <p class="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
            Meet the people who have shared their knowledge and experience with our community.
          </p>
        </div>

        <!-- Featured Speakers Grid -->
        <section v-if="featuredSpeakers.length" class="mb-32 space-y-12">
          <div class="flex items-center gap-4">
            <h2 class="text-2xl font-black uppercase tracking-[0.2em] text-verse-500">Curated Talents</h2>
            <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-32 gap-x-12 lg:gap-x-24">
            <div 
              v-for="speaker in featuredSpeakers" 
              :key="speaker.id" 
              class="group relative"
            >
              <SpeakerAvatar
                size="full"
                :name="speaker.name"
                :github-username="speaker.github_account"
                :avatar-url="speaker.avatar_url"
                class="relative aspect-[4/5] shadow-xl grayscale group-hover:grayscale-0 transition-all duration-700 border border-gray-100 dark:border-verse-800 group-hover:border-verse-500 rounded-[2.5rem]"
              />
              
              <Link :href="`/speaker/${speaker.id}`" class="absolute inset-0 z-20 rounded-[2.5rem]" />

                <!-- Social Icons -->
                <div class="absolute bottom-6 left-6 right-6 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <a v-if="speaker.github_account" :href="`https://github.com/${speaker.github_account}`" target="_blank" class="p-3 bg-white/90 dark:bg-verse-950/90 backdrop-blur-md rounded-xl text-verse-500 dark:text-verse-300 hover:bg-verse-500 hover:text-white transition-colors shadow-lg">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                  <a v-if="speaker.linkedinUrl" :href="speaker.linkedinUrl" target="_blank" class="p-3 bg-white/90 dark:bg-verse-950/90 backdrop-blur-md rounded-xl text-verse-500 dark:text-verse-300 hover:bg-verse-500 hover:text-white transition-colors shadow-lg">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                </div>
              </div>

              <div class="mt-8 space-y-2">
                <h3 class="text-4xl font-black tracking-tight text-gray-900 dark:text-white group-hover:text-verse-500 transition-colors duration-300">
                  {{ speaker.name }}
                </h3>
                <p v-if="speaker.github_account" class="text-sm font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500">
                  @{{ speaker.github_account }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- All Speakers Section -->
        <section v-if="regularSpeakers.length" class="space-y-12">
          <div class="flex items-center gap-4">
            <h2 class="text-2xl font-black uppercase tracking-[0.2em] text-gray-400">All Speakers</h2>
            <div class="h-px flex-1 bg-gradient-to-r from-gray-200 dark:from-verse-800 to-transparent"></div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            <Link
              v-for="speaker in regularSpeakers"
              :key="speaker.id"
              :href="`/speaker/${speaker.id}`"
              class="group block space-y-4"
            >
              <SpeakerAvatar
                size="full"
                :name="speaker.name"
                :github-username="speaker.github_account"
                :avatar-url="speaker.avatar_url"
                class="w-full aspect-square rounded-[2.5rem] grayscale group-hover:grayscale-0 group-hover:border-verse-500 group-hover:-translate-y-1"
              />
              <div class="text-center md:text-left">
                <h4 class="font-bold text-gray-900 dark:text-white group-hover:text-verse-500 transition-colors">
                  {{ speaker.name }}
                </h4>
                <p v-if="speaker.github_account" class="text-xs font-black uppercase tracking-widest text-gray-400">
                  @{{ speaker.github_account }}
                </p>
              </div>
            </Link>
          </div>
        </section>

        <!-- Empty state -->
        <div v-if="!speakers.length" class="text-center py-32 space-y-6">
          <div class="w-20 h-20 bg-verse-50 dark:bg-verse-900/20 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-10 h-10 text-verse-500 dark:text-verse-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p class="text-2xl font-bold text-gray-400">No speakers found in our records.</p>
        </div>
      </div>
    </main>
  </DefaultLayout>
</template>
