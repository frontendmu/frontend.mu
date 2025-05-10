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

function opacityValue(index: number) {
  // the lower the index, the closer it has to be to 100, the higher the index it has to reach 0
  // the max index is sortedSponsors.length - 1
  const maxIndex = sortedSponsors.value.length - 1
  return Math.floor(100 - (index * 100) / maxIndex)
}

function sponsorLogoUrl(sponsor: any) {
  if (typeof sponsor.logo === 'string') {
    return `https://directus.frontend.mu/assets/${sponsor.logo}`
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
        class="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-8"
        tabindex="0"
        aria-label="Sponsor logos carousel"
      >
        <div
          v-for="(sponsor) in sortedSponsors"
          :key="sponsor.id"
          class="grid place-items-center justify-center items-center bg-white p-4 rounded-md"
          :title="sponsor.name"
        >
          <!-- :style="{ opacity: `${opacityValue(index)}%`, width: `${opacityValue(index) / 6}%`, filter: `saturate(${opacityValue(index) / 100})` }" -->
          <NuxtLink
            :to="{
              name: 'meetup-id',
              params: {
                id: sponsor.meetups[0].id,
              },
            }"
            :title="`${sponsor.name} has sponsored the ${sponsor.meetups[0].title} meetup at ${sponsor.meetups[0].venue}`"
          >
            <img
              :src="sponsorLogoUrl(sponsor)"
              :alt="sponsor.name"
              :class="sponsor.darkbg ? 'dark:bg-verse-900 bg-gray-500' : ''"
              class="h-20 max-h-24 w-full object-contain rounded-md p-2"
              draggable="false"
            >
          </NuxtLink>
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
