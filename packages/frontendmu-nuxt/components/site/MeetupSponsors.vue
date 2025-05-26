<script setup lang="ts">
import type { Sponsor } from '@/utils/types'

function sponsorLogoUrl(sponsor: Sponsor) {
  return `https://directus.coders.mu/assets/${sponsor.Sponsor_id.Logo.filename_disk}`
}

const { allSponsors } = useMeetups({})

const sponsorTypeMap: { [key: string]: string } = {
  lunch: 'Lunch Sponsor',
  venue: 'Venue Sponsor',
}

function sponsorClassList(sponsor: Sponsor) {
  return [
    sponsor.Sponsor_id.darkbg ? 'bg-verse-900/90 text-verse-100' : 'bg-white text-verse-800',
    'p-2 items-center shadow-md relative rounded-lg flex flex-wrap justify-center gap-4 text-xs',
  ]
}
</script>

<template>
  <div class="grid lg:grid-cols-7 md:gap-8 md:grid-cols-3 grid-cols-2 gap-4 auto-rows-auto">
    <!-- <template v-for="sponsor in allSponsors" :key="sponsor.Sponsor_id">
            <img class="h-16 w-20 md:w-auto object-contain md:object-cover" :src="sponsorLogoUrl(sponsor)"
                :alt="sponsor.Sponsor_id.Name" :title="sponsor.Sponsor_id.Name" :width="sponsor.Sponsor_id.Logo.width"
                :height="sponsor.Sponsor_id.Logo.height">
        </template> -->

    <template
      v-for="sponsor in allSponsors"
      :key="sponsor.Sponsor_id"
    >
      <div :class="sponsorClassList(sponsor)">
        <NuxtLink
          :to="`/meetup/${sponsor.Events_id}`"
          class="absolute inset-0"
        >
          <span class="sr-only">
            {{ sponsor.Sponsor_id.Name }}
          </span>
        </NuxtLink>
        <img
          class="w-full object-contain md:object-cover"
          :src="sponsorLogoUrl(sponsor)"
          :alt="sponsor.Sponsor_id.Name"
          :title="sponsor.Sponsor_id.Name"
          :width="sponsor.Sponsor_id.Logo.width"
          :height="sponsor.Sponsor_id.Logo.height"
        >

        <!-- <div class="flex flex-col text-md font-bold gap-1 md:gap-4">
                    <div v-for="sponsorType in sponsor.Sponsor_id?.Sponsor_type" :key="sponsorType"
                        class="flex flex-col items-center bg-gray-200/10 border-gray-500/10 border-2 p-2 rounded-md">
                        <p class="text-left md:uppercase font-semibold md:font-black opacity-70 cursor-help text-xs md:text-md"
                            :title="`${sponsor.Sponsor_id.Name} sponsored the ${sponsorType} for this meetup`">
                            {{ sponsorTypeMap[sponsorType] }}
                        </p>
                    </div>
                </div> -->
      </div>
    </template>
  </div>
</template>

<style scoped></style>
