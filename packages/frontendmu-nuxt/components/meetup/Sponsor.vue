<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  sponsors: {
    type: Array,
    required: true,
  },
})

const sponsorTypeMap = {
  lunch: 'Lunch Sponsor',
  venue: 'Venue Sponsor',
}

const hasSponsors = props.sponsors && props.sponsors.length > 0

function sponsorClassList(sponsor) {
  return [
    sponsor.Sponsor_id.darkbg ? 'bg-verse-900/90 text-verse-100' : 'bg-white text-verse-800',
    'p-4 items-center shadow-md rounded-lg flex flex-wrap justify-center gap-4 text-xs',
  ]
}

function sponsorLogoUrl(sponsor) {
  return `https://directus.coders.mu/assets/${sponsor.Sponsor_id.Logo.filename_disk}`
}
</script>

<template>
  <div>
    <div v-if="hasSponsors" class="text-base uppercase text-verse-900 dark:text-verse-200 font-semibold mb-4">
      Sponsor(s)
    </div>
    <div v-if="hasSponsors" class="flex flex-col md:flex-row justify-start items-start gap-2 md:gap-4">
      <div v-for="sponsor in sponsors" :key="sponsor.Sponsor_id" :class="sponsorClassList(sponsor)">
        <img class="h-16 w-20 md:w-auto object-contain md:object-cover" :src="sponsorLogoUrl(sponsor)"
             :alt="sponsor.Sponsor_id.Name" :title="sponsor.Sponsor_id.Name" :width="sponsor.Sponsor_id.Logo.width"
             :height="sponsor.Sponsor_id.Logo.height"
        >
        <div class="flex flex-col md:flex-row text-md font-bold gap-1 md:gap-4">
          <div v-for="sponsorType in sponsor.Sponsor_id?.Sponsor_type" :key="sponsorType"
               class="flex flex-col items-center bg-gray-200/10 border-gray-500/10 border-2 p-2 rounded-md"
          >
            <p class="text-left md:uppercase font-semibold md:font-black opacity-70 cursor-help text-xs md:text-md"
               :title="`${sponsor.Sponsor_id.Name} sponsored the ${sponsorType} for this meetup`"
            >
              {{ sponsorTypeMap[sponsorType] }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
