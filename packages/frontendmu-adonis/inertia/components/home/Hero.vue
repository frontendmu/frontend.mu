<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import Logo from '~/components/layout/Logo.vue'
import type { EventSummaryDto } from '~/types'
import { DISCORD_URL, GITHUB_URL, TWITTER_URL, LINKEDIN_URL } from '~/constants'

interface Props {
  featuredEvent?: EventSummaryDto
}

defineProps<Props>()

const description =
  'A community of passionate developers in Mauritius. Join us for regular meetups, workshops, and tech talks.'
</script>

<template>
  <section class="hero-section min-h-[min(calc(100vh-5rem),900px)] flex items-center pt-24 pb-12 lg:pt-24 lg:pb-8">
    <div class="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        <!-- Text Content -->
        <div class="hero-content w-full lg:w-[55%] text-center lg:text-left space-y-5">
          <h1 class="hero-heading font-display tracking-tight leading-[0.85] text-gray-900 dark:text-white">
            <span class="block">Frontend</span>
            <span class="block">Coders</span>
            <span class="font-display-italic text-verse-600 dark:text-verse-400">
              Mauritius
            </span>
          </h1>

          <p class="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            {{ description }}
          </p>

          <!-- CTAs -->
          <div class="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <Link v-if="featuredEvent" :href="`/meetup/${featuredEvent.id}`" class="inline-flex items-center gap-2 px-5 py-2.5 bg-verse-600 hover:bg-verse-700 text-white rounded-md text-sm font-medium transition-colors">
              {{ featuredEvent.title }}
              <svg class="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/meetups"
              class="inline-flex items-center px-5 py-2.5 border border-gray-300 dark:border-verse-800 text-gray-700 dark:text-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-verse-900 transition-colors"
            >
              All Meetups
            </Link>

            <div class="flex items-center gap-1">
              <a :href="GITHUB_URL" target="_blank" class="p-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a :href="DISCORD_URL" target="_blank" class="p-2.5 text-gray-400 dark:text-gray-500 hover:text-[#5865F2] transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              </a>
              <a :href="TWITTER_URL" target="_blank" class="p-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a :href="LINKEDIN_URL" target="_blank" class="p-2.5 text-gray-400 dark:text-gray-500 hover:text-[#0A66C2] transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Logo -->
        <div class="hidden lg:flex w-full lg:w-[45%] justify-center items-center">
          <div class="w-56 h-56 lg:w-72 lg:h-72 rounded-lg bg-gray-50 dark:bg-verse-900 border border-gray-200 dark:border-verse-900 flex items-center justify-center p-14">
            <Logo class="w-full h-full text-verse-500 dark:text-white" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference 'tailwindcss';

.hero-heading {
  font-size: clamp(3.25rem, 7vw + 1rem, 5.5rem);
}

@media (min-width: 1024px) {
  .hero-heading {
    font-size: clamp(3.5rem, 9vh + 1rem, 8.5rem);
  }

  .hero-content {
    gap: clamp(1rem, 3vh, 2.5rem);
  }

  .hero-section {
    padding-top: clamp(4rem, 12vh, 6rem);
    padding-bottom: clamp(1rem, 3vh, 2rem);
  }
}
</style>
