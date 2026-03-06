<script setup lang="ts">
import { computed } from 'vue'
import { Head } from '@inertiajs/vue3'
import type { EventSummaryDto, SpeakerDto, SponsorSummaryDto } from '~/types'
import { useMeetups } from '~/composables/useMeetups'
import Hero from '~/components/home/Hero.vue'
import LatestMeetup from '~/components/home/LatestMeetup.vue'
import FeaturedSpeakers from '~/components/home/FeaturedSpeakers.vue'
import SocialPresence from '~/components/home/SocialPresence.vue'
import Sponsors from '~/components/home/Sponsors.vue'
import StatsCounter from '~/components/home/StatsCounter.vue'

interface Props {
  events: EventSummaryDto[]
  featuredSpeakers: SpeakerDto[]
  sponsors: SponsorSummaryDto[]
  stats: {
    meetups: number
    speakers: number
    contributors: number
  }
}

const props = defineProps<Props>()

const { nextMeetup, todaysMeetups, areThereMeetupsToday, pastMeetups } = useMeetups(props.events)

const featuredEvent = computed(() => {
  if (areThereMeetupsToday.value) return todaysMeetups.value[0]
  if (nextMeetup.value) return nextMeetup.value
  return pastMeetups.value[0]
})
</script>

<template>
  <Head title="Home" />
  <main class="pb-8">
    <Hero :featured-event="featuredEvent" />
    <LatestMeetup :events="events" />
    <FeaturedSpeakers :speakers="featuredSpeakers" />
    <Sponsors :sponsors="sponsors" />
    <SocialPresence />
    <StatsCounter :stats="stats" />
  </main>
</template>
