<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import SpeakerAvatar from '~/components/shared/SpeakerAvatar.vue'
import type { SpeakerDto } from '~/types'

interface Props {
  speakers: SpeakerDto[]
}

const props = defineProps<Props>()

const featuredSpeakers = computed(() => props.speakers.filter((s) => s.featured))
const regularSpeakers = computed(() => props.speakers.filter((s) => !s.featured))
</script>

<template>
  <Head title="Speakers" />
    <main class="relative min-h-screen pt-40 pb-24">
      <div class="contain relative z-10">
        <!-- Page Header -->
        <div class="max-w-3xl mb-16 space-y-4">
          <p class="text-sm font-medium text-gray-400 dark:text-gray-500">Community voices</p>
          <h1 class="text-5xl md:text-7xl font-display tracking-tight dark:text-white leading-[0.9]">
            Speakers
          </h1>
          <p class="text-base text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
            The people who have shared their knowledge and experience with our community.
          </p>
        </div>

        <!-- Featured Speakers Grid -->
        <section v-if="featuredSpeakers.length" class="mb-20 space-y-8">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-semibold text-verse-500 dark:text-verse-400">Featured</h2>
            <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              v-for="speaker in featuredSpeakers"
              :key="speaker.id"
              class="group relative"
            >
              <SpeakerAvatar
                size="full"
                :name="speaker.name"
                :github-username="speaker.githubUsername"
                :avatar-url="speaker.avatarUrl"
                class="relative aspect-square shadow-md transition-all duration-300 border border-gray-100 dark:border-verse-800 group-hover:border-verse-500/60 rounded-2xl group-hover:shadow-lg group-hover:-translate-y-1"
              />

              <Link :href="`/speaker/${speaker.id}`" class="absolute inset-0 z-20 rounded-2xl" :aria-label="`View ${speaker.name}'s profile`" />

              <div class="mt-3 space-y-0.5">
                <h3 class="text-base font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-verse-500 transition-colors">
                  {{ speaker.name }}
                </h3>
                <p v-if="speaker.githubUsername" class="text-xs text-gray-400 dark:text-gray-500">
                  @{{ speaker.githubUsername }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- All Speakers Section -->
        <section v-if="regularSpeakers.length" class="space-y-8">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-semibold text-gray-400">All Speakers</h2>
            <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
          </div>

          <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8">
            <Link
              v-for="speaker in regularSpeakers"
              :key="speaker.id"
              :href="`/speaker/${speaker.id}`"
              class="group block space-y-2"
            >
              <SpeakerAvatar
                size="full"
                :name="speaker.name"
                :github-username="speaker.githubUsername"
                :avatar-url="speaker.avatarUrl"
                class="w-full aspect-square rounded-xl border border-gray-100 dark:border-verse-800 group-hover:border-verse-500/60 transition-all group-hover:-translate-y-0.5"
              />
              <div>
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-verse-500 transition-colors truncate">
                  {{ speaker.name }}
                </h4>
                <p v-if="speaker.githubUsername" class="text-xs text-gray-400 truncate">
                  @{{ speaker.githubUsername }}
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
</template>
