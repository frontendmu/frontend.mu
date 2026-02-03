<script setup lang="ts">
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import { Head } from '@inertiajs/vue3'
import type { Meetup } from '~/types'
import Hero from '~/components/home/Hero.vue'
import LatestMeetup from '~/components/home/LatestMeetup.vue'
import FeaturedSpeakers from '~/components/home/FeaturedSpeakers.vue'
import SocialPresence from '~/components/home/SocialPresence.vue'
import StatsCounter from '~/components/home/StatsCounter.vue'

interface Speaker {
  id: string
  name: string
  github_account: string | null
  featured: boolean
  bio?: string | null
}

interface Props {
  events: Meetup[]
  featuredSpeakers: Speaker[]
  sponsors: any[]
  stats: {
    meetups: number
    speakers: number
    contributors: number
  }
}

defineProps<Props>()
</script>

<template>
  <Head title="Home" />
  <DefaultLayout>
    <main class="pb-20">
      <!-- Hero Section -->
      <Hero />

      <!-- Latest Meetups Section -->
      <LatestMeetup :events="events" />

      <!-- Featured Speakers Section -->
      <FeaturedSpeakers :speakers="featuredSpeakers" />

      <!-- Social Presence Section -->
      <SocialPresence />

      <!-- Stats Counter Section -->
      <StatsCounter :stats="stats" />
    </main>
  </DefaultLayout>
</template>
