<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import Logo from '~/components/layout/Logo.vue'
import SpeakerAvatar from '~/components/shared/SpeakerAvatar.vue'
import type { Meetup } from '~/types'
import { isDateInFuture, isDateToday } from '~/utils/date'

interface Props {
  featuredEvent?: Meetup
}

const props = defineProps<Props>()

const description =
  'A community of passionate developers in Mauritius. Join us for regular meetups, workshops, and tech talks.'

const eventStatus = computed(() => {
  if (!props.featuredEvent?.Date) return ''
  const date = new Date(props.featuredEvent.Date)
  if (isDateToday(date)) return 'Happening Today'
  if (isDateInFuture(date)) return 'Next Event'
  return 'Latest Meetup'
})

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return {
    day: date.getDate(),
    month: date.toLocaleString('en-US', { month: 'short' }),
  }
}
</script>

<template>
  <section class="relative min-h-[calc(100vh-5rem)] flex items-center overflow-hidden">
    <div class="contain relative z-10 w-full">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
        <!-- Text Content -->
        <div class="w-full lg:w-[60%] text-center lg:text-left space-y-12">
          
          <div class="flex flex-col">
            <!-- Simple Static Role -->
            <span class="text-xl md:text-2xl font-black uppercase tracking-[0.4em] text-verse-500 block leading-none mb-4">
              Frontend
            </span>

            <h1 class="relative z-10 text-7xl md:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.8] dark:text-white pointer-events-auto cursor-default">
              <span class="block">Coders</span>
              <span class="relative inline-block">
                <span class="text-verse-600 dark:text-verse-400">Mauritius</span>
                <svg class="absolute -bottom-2 left-0 w-full h-4 text-verse-500/30 dark:text-verse-400/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" stroke-width="4" />
                </svg>
              </span>
            </h1>
          </div>

          <p class="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
            {{ description }}
          </p>

          <!-- Dynamic Event Card -->
          <div v-if="featuredEvent" class="flex justify-center lg:justify-start pt-4">
            <Link :href="`/meetup/${featuredEvent.id}`" class="group relative flex items-center gap-5 bg-white/80 dark:bg-verse-900/40 backdrop-blur-xl border border-verse-200 dark:border-verse-800 p-4 pr-10 rounded-[2rem] transition-all hover:scale-[1.02] hover:shadow-xl hover:border-verse-400 dark:hover:border-verse-500 text-left">
              <div class="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-verse-500 text-white font-black shrink-0 shadow-lg shadow-verse-500/20">
                <span class="text-xl leading-none">{{ formatDate(featuredEvent.Date).day }}</span>
                <span class="text-[10px] uppercase tracking-wider">{{ formatDate(featuredEvent.Date).month }}</span>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-[0.25em] text-verse-500">{{ eventStatus }}</p>
                <h3 class="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-verse-600 dark:group-hover:text-verse-400 transition-colors">
                  {{ featuredEvent.title }}
                </h3>
              </div>
              <div class="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-verse-800 border border-verse-200 dark:border-verse-700 flex items-center justify-center shadow-md group-hover:bg-verse-500 group-hover:text-white transition-all">
                <svg class="w-4 h-4 text-verse-500 dark:text-verse-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>

          <!-- CTAs -->
          <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
            <Link
              href="/meetups"
              class="group relative inline-flex items-center justify-center px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
            >
              <span>Explore Meetups</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </Link>
            
            <a 
              href="https://discord.gg/WxXW9Jvv6k" 
              target="_blank"
              class="inline-flex items-center justify-center px-8 py-4 font-bold text-verse-700 dark:text-verse-200 transition-all duration-200 bg-white dark:bg-verse-900/40 border-2 border-verse-200 dark:border-verse-800 font-heading rounded-2xl hover:bg-verse-50 dark:hover:bg-verse-900/60 active:scale-95"
            >
              Join Discord
            </a>
          </div>
        </div>

        <!-- Visual Element -->
        <div class="w-full lg:w-[40%] flex justify-center items-center relative py-12 lg:py-0">
          <div class="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
            <div class="absolute inset-0 rounded-full border-2 border-dashed border-verse-500/20 animate-spin-slow"></div>
            <div class="absolute inset-6 rounded-full border border-verse-500/10 animate-spin-reverse-slow"></div>
            <div class="absolute inset-12 rounded-[3.5rem] squircle bg-white dark:bg-verse-900/40 backdrop-blur-2xl border border-verse-200 dark:border-verse-700 flex items-center justify-center shadow-2xl p-12 rotate-3 transition-transform hover:rotate-0 duration-500 group/logo">
              <Logo class="w-full h-full text-verse-500 dark:text-white transition-transform duration-500 group-hover/logo:scale-110" />
            </div>
            <div class="absolute -top-4 -right-4 w-12 h-12 bg-red-500 rounded-2xl animate-float opacity-80 shadow-lg"></div>
            <div class="absolute bottom-10 -left-6 w-8 h-8 bg-green-500 rounded-full animate-float-slow opacity-80 shadow-lg" style="animation-delay: 1s"></div>
            <div class="absolute -bottom-2 right-12 w-10 h-10 bg-yellow-400 rounded-xl animate-float opacity-80 shadow-lg" style="animation-delay: 2s"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference 'tailwindcss';

.animate-spin-slow {
  animation: spin 35s linear infinite;
}

.animate-spin-reverse-slow {
  animation: spin-reverse 40s linear infinite;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-slow {
  animation: float 8s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}

@keyframes spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
