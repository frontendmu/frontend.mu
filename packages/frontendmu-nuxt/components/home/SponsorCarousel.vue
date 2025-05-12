<script setup lang="ts">
import { templateRef } from '@vueuse/core'
import { useSponsorStore } from '@/store/sponsorStore'

const sponsorStore = useSponsorStore()
// Get all sponsors, sorted by their most recent event date descending and remove duplicate sponsors from the list
const sortedSponsors = computed(() => {
  return [...sponsorStore.sponsors]
    .sort((a, b) => {
      // Find most recent meetup date for each sponsor
      const aLatest = a.meetups.reduce((max, m) => m.date > max ? m.date : max, '')
      const bLatest = b.meetups.reduce((max, m) => m.date > max ? m.date : max, '')
      return bLatest.localeCompare(aLatest)
    })
    .filter((sponsor, index, self) => {
      return index === self.findIndex(s => s.name.toLowerCase() === sponsor.name.toLowerCase())
    })
})

function sponsorLogoUrl(sponsor: any) {
  if (typeof sponsor.logo === 'string') {
    return `https://directus.frontend.mu/assets/${sponsor.logomark}`
  }
  return ''
}

const carouselRef = templateRef<HTMLDivElement>('carouselRef')
</script>

<template>
  <section class="relative w-full   dark:bg-verse-200/5 backdrop-blur-sm  mx-auto py-6 md:py-10">
    <div class="flex items-center justify-center mb-3 w-full">
      <h2 class="font-heading tracking-tight text-verse-900 dark:text-verse-200 font-light text-3xl sm:text-4xl md:text-5xl">
        Sponsored by
      </h2>
    </div>
    <div class="w-full py-4 px-8 max-w-7xl mx-auto">
      <div
        ref="carouselRef"
        class="grid lg:grid-cols-8 md:grid-cols-2 grid-cols-1 gap-8"
        tabindex="0"
        aria-label="Sponsor logos carousel"
      >
        <NuxtLink
          v-for="(sponsor) in sortedSponsors"
          :key="sponsor.id"
          :to="{
            name: 'meetup-id',
            params: {
              id: sponsor.meetups[0].id,
            },
          }"
          :title="`${sponsor.name} has sponsored the ${sponsor.meetups[0].title} meetup at ${sponsor.meetups[0].venue}`"
        >
          <div

            class="flip-card h-32  w-full object-contain rounded-md"
            :title="sponsor.name"
          >
            <div class="flip-card-inner">
              <div class="flip-card-front grid place-items-center justify-center items-center bg-white p-4 rounded-md">
                <img
                  :src="sponsorLogoUrl(sponsor)"
                  :alt="sponsor.name"
                  :class="sponsor.darkbg ? 'dark:bg-verse-900 bg-gray-500' : ''"
                  class="h-20 max-h-28 w-full object-contain rounded-md p-2"
                  draggable="false"
                >
              </div>
              <div class="flip-card-back grid place-items-center justify-center items-center bg-white p-4 rounded-md">
                <span class="z-0 absolute inset-0 h-full text-center w-full items-center justify-center text-gray-200 text-[100px] flex gap-2">
                  {{ sponsor.meetups[0].date.split('-')[0] }}
                </span>
                <span class="z-10 font-medium font-mono text-lg text-center w-full block">{{ `${sponsor.name} has sponsored the ${sponsor.meetups[0].title} meetup` }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
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
.flip-card {
  background: transparent;
  perspective: 200px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.4s ease-in-out;
  transform-style: preserve-3d;
  /* transform-origin: 100px center; */
}

.flip-card:hover .flip-card-inner,
.flip-card:focus-within .flip-card-inner {
  transition: transform 0.6s cubic-bezier(0.68, -0.6, 0.32, 1.5);
  transform: rotateX(180deg);
}

.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem; /* match rounded-md */
}

.flip-card-front {
  z-index: 2;
}

.flip-card-back {
  transform: rotateX(180deg);
  z-index: 1;
  background: #fff;
  color: #222;
  padding: 1rem;
  box-sizing: border-box;
}
</style>
