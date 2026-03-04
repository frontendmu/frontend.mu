<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import type { EventSummaryDto, SpeakerDto, SponsorSummaryDto } from '~/types'
import { useMeetups } from '~/composables/useMeetups'
import Hero from '~/components/home/Hero.vue'
import LatestMeetup from '~/components/home/LatestMeetup.vue'
import FeaturedSpeakers from '~/components/home/FeaturedSpeakers.vue'
import SocialPresence from '~/components/home/SocialPresence.vue'
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

const featuredEvent = areThereMeetupsToday.value
  ? todaysMeetups.value[0]
  : (nextMeetup.value || pastMeetups.value[0])
</script>

<template>
  <Head title="Home" />
  <main class="pb-8">
    <Hero :featured-event="featuredEvent" />
    <LatestMeetup :events="events" />
    <FeaturedSpeakers :speakers="featuredSpeakers" />
    <SocialPresence />
    <StatsCounter :stats="stats" />
  </main>
</template>
