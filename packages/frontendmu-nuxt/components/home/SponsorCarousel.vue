<script setup lang="ts">
import { templateRef } from '@vueuse/core'
import { useSponsorStore } from '@/store/sponsorStore'

const sponsorStore = useSponsorStore()
// Get all sponsors, sorted by their most recent event date descending
const sortedSponsors = computed(() => {
  return [...sponsorStore.sponsors]
    .sort((a, b) => {
      // Find most recent meetup date for each sponsor
      const aLatest = a.meetups.reduce((max, m) => m.date > max ? m.date : max, '')
      const bLatest = b.meetups.reduce((max, m) => m.date > max ? m.date : max, '')
      return bLatest.localeCompare(aLatest)
    })
})

function sponsorLogoUrl(sponsor: any) {
  if (typeof sponsor.logo === 'string') {
    return `https://directus.frontend.mu/assets/${sponsor.logo}`
  }
  return ''
}

const carouselRef = templateRef<HTMLDivElement>('carouselRef')
</script>

<template>
  <section class="relative w-full bg-white/50  dark:bg-verse-200/5 backdrop-blur-sm  mx-auto py-6 md:py-10">
    <div class="flex items-center justify-center mb-3 w-full">
      <h2 class="font-heading tracking-tight text-verse-900 dark:text-verse-200 font-light text-3xl sm:text-4xl md:text-5xl">
        Sponsored by
      </h2>
    </div>
    <div class="w-full py-4">
      <div
        ref="carouselRef"
        class="carousel-grid"
        tabindex="0"
        aria-label="Sponsor logos carousel"
      >
        <div
          v-for="sponsor in sortedSponsors"
          :key="sponsor.id"
          class="carousel-item"
          :title="sponsor.name"
        >
          <img
            :src="sponsorLogoUrl(sponsor)"
            :alt="sponsor.name"
            class="carousel-img"
            :class="sponsor.darkbg ? 'dark:bg-verse-900 bg-gray-500' : ''"
            draggable="false"
          >
        </div>
      </div>
    </div>
    <div class="text-center">
      <a href="#" class="inline-block bg-verse-600 dark:bg-verse-400 text-white px-4 py-2 rounded-full hover:bg-verse-700 dark:hover:bg-verse-500 hover:scale-[110%] transition group">
        Want to sponsor a meetup?
      </a>
    </div>
  </section>
</template>

<style scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.carousel-grid {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(3, 1fr);
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 1rem;
  scroll-padding-right: 1rem;
  padding-bottom: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  scrollbar-width: thin;
}

.carousel-item {
  scroll-snap-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tw-prose-bg, white);
  border-radius: 0.5rem;
  transition: transform 0.3s cubic-bezier(.4,2,.6,1);
  width: 10rem;
  height: 6rem;
}

.carousel-item:active {
  transform: scale(0.96);
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0.25rem;
  padding: 1rem;
  filter: saturate(0);
  transition: filter 0.3s;
}
.carousel-img:hover {
  filter: saturate(1);
}

@media (max-width: 768px) {
  .carousel-grid {
    grid-template-rows: repeat(2, 1fr);
    gap: 0.5rem;
  }
  .carousel-item {
    width: 7rem;
    height: 4rem;
  }
}

@media (max-width: 480px) {
  .carousel-grid {
    grid-template-rows: repeat(2, 1fr);
    gap: 0.25rem;
  }
  .carousel-item {
    width: 5.5rem;
    height: 3rem;
  }
}
.carousel::-webkit-scrollbar {
  height: 12px;
  background: transparent;
}
.light-mode .carousel::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #b6c2de 0%, #e0e7ef 100%);
  border-radius: 8px;
  border: 2px solid #f0f4fa;
  background-clip: padding-box;
  box-shadow: 0 2px 8px #cbd5e188;
  opacity: 0.7;
  transition: background 0.2s, opacity 0.3s;
}
.light-mode .carousel::-webkit-scrollbar-thumb:hover,
.light-mode .carousel::-webkit-scrollbar-thumb:active {
  background: linear-gradient(90deg, #e0e7ef 0%, #b6c2de 100%);
  opacity: 1;
}
.light-mode .carousel::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 8px;
}

.dark-mode .carousel::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #7dd3fc 0%, #94a3b8 100%);
  border-radius: 8px;
  border: 3px solid #1e293b;
  background-clip: padding-box;
  box-shadow: 0 2px 8px #0f172a88;
  opacity: 0.7;
  transition: background 0.2s, opacity 0.3s;
}
.dark-mode .carousel::-webkit-scrollbar-thumb:hover,
.dark-mode .carousel::-webkit-scrollbar-thumb:active {
  background: linear-gradient(90deg, #bae6fd 0%, #a5b4fc 100%);
  opacity: 1;
}
.dark-mode .carousel::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.3);
  border-radius: 8px;
}

.carousel {
  scrollbar-width: thin;
}
.light-mode .carousel {
  scrollbar-color: #b6c2de #f8fafc;
}
.dark-mode .carousel {
  scrollbar-color: #7dd3fc #23293a;
}

.carousel-arrow {
  @apply flex items-center justify-center p-2 rounded-full bg-verse-100 dark:bg-verse-800 hover:bg-verse-200 dark:hover:bg-verse-700 shadow transition;
  outline: none;
}
.carousel-arrow:focus {
  @apply ring-2 ring-verse-400;
}
.carousel-item {
  transition: transform 0.3s cubic-bezier(.4,2,.6,1);
}
.carousel-item:active {
  transform: scale(0.96);
}
</style>
