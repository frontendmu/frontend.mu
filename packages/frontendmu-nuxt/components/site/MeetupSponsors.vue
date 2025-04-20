<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSponsorStore } from '../../store/sponsorStore'
import type { Sponsor } from '../../store/sponsorStore'
import Card from '@/components/base/Card.vue'

const sponsorStore = useSponsorStore()
const sortedMeetupsByYear = computed(() => sponsorStore.getMeetupsGroupedByYearSorted)

function sponsorLogoUrl(sponsor: Sponsor) {
  if (typeof sponsor.logo === 'string') {
    return `https://directus.frontend.mu/assets/${sponsor.logo}`
  }
  return ''
}

function isRecentSponsorship(meetups: { date: string }[]): boolean {
  if (!meetups.length)
    return false
  // Get most recent event date
  const mostRecent = meetups.reduce((max, m) => m.date > max ? m.date : max, '')
  if (!mostRecent)
    return false
  const eventDate = new Date(mostRecent)
  const now = new Date()
  const diffMonths = (now.getFullYear() - eventDate.getFullYear()) * 12 + (now.getMonth() - eventDate.getMonth())
  return diffMonths <= 6
}
</script>

<template>
  <div>
    <div v-for="[year, meetups] in sortedMeetupsByYear" :key="year" class="mb-12">
      <h2 class="text-4xl font-bold text-verse-600 dark:text-verse-100 mb-6 border-b border-verse-200/10 pb-2">
        {{ year }}
      </h2>
      <div class="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-8">
        <div v-for="item in meetups" :key="`${item.meetup.id}-${item.sponsor.id}`" class="flex flex-col gap-4 bg-white/50 overflow-hidden dark:bg-verse-100/10 dark:backdrop-blur-sm p-4 shadow-lg sm:rounded-lg">
          <div class="flex flex-col items-center gap-2 flex-1 relative">
            <img
              :src="sponsorLogoUrl(item.sponsor)"
              :alt="item.sponsor.name"
              class="h-20 max-h-24 w-full object-contain mb-2 rounded-md p-2"
              :class="item.sponsor.darkbg ? 'dark:bg-verse-900 bg-gray-500' : 'bg-white'"
            >
            <div class="font-semibold text-lg text-center sr-only">
              {{ item.sponsor.name }}
            </div>
            <template v-if="item.sponsor.website && isRecentSponsorship([item.meetup])">
              <a :href="item.sponsor.website" target="_blank" rel="noopener" class="absolute top-0 left-0 w-full h-full text-blue-600 underline text-xs opacity-0">{{ item.sponsor.website }}</a>
            </template>
          </div>
          <div class="flex flex-col gap-2 mt-2">
            <div class="bg-verse-100 dark:bg-verse-800 rounded-md p-3 flex flex-col gap-1">
              <div class="text-sm font-semibold text-verse-700 dark:text-verse-200">
                <NuxtLink :to="`/meetup/${item.meetup.id}`" class="hover:underline">
                  {{ item.meetup.title }}
                </NuxtLink>
              </div>
              <div class="text-xs text-gray-500 flex gap-2">
                <span>{{ item.meetup.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
