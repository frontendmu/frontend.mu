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
function scrollByOne(dir: 'left' | 'right') {
  if (!carouselRef.value)
    return
  const el = carouselRef.value
  const card = el.querySelector('.carousel-item') as HTMLElement
  if (!card)
    return
  const scrollAmount = card.offsetWidth + 500 // 16px gap
  el.scrollBy({
    left: dir === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth',
  })
}
</script>

<template>
  <section class="relative w-full bg-white/50  dark:bg-verse-200/5 backdrop-blur-sm  mx-auto py-6 md:py-10">
    <div class="flex items-center justify-center mb-3 w-full">
      <h2 class="font-heading tracking-tight text-verse-900 dark:text-verse-200 font-light text-3xl sm:text-4xl md:text-5xl">
        Sponsored by
      </h2>
    </div>
    <div class="flex justify-between items-center w-full py-4">
      <button aria-label="Scroll left" class="carousel-arrow" @click="() => scrollByOne('left')">
        <Icon name="ic:round-arrow-back-ios" class="w-6 h-6" />
      </button>
      <div
        ref="carouselRef"
        class="carousel flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 px-4"
        tabindex="0"
        aria-label="Sponsor logos carousel"
      >
        <div
          v-for="sponsor in sortedSponsors"
          :key="sponsor.id"
          class="carousel-item flex-shrink-0 md:w-48 md:h-24 mt-4 rounded-md   dark:bg-verse-100 flex items-center justify-center snap-center transition-transform duration-300"
          :title="sponsor.name"
        >
          <img
            :src="sponsorLogoUrl(sponsor)"
            :alt="sponsor.name"
            class="w-full h-full object-contain rounded-sm  p-4 saturate-0 hover:saturate-100 transition"
            :class="sponsor.darkbg ? 'dark:bg-verse-900 bg-gray-500' : ''"
            draggable="false"
          >
        </div>
      </div>
      <button aria-label="Scroll right" class="carousel-arrow" @click="() => scrollByOne('right')">
        <Icon name="ic:round-arrow-forward-ios" class="w-6 h-6" />
      </button>
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
.carousel {
  scroll-padding-left: 1rem;
  scroll-padding-right: 1rem;
  scrollbar-width: thin;
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
