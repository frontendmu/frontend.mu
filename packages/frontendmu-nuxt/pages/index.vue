<script setup lang="ts">
defineOgImageComponent('Home')

const { description } = useSiteConfig()
useSeoMeta({ description })
</script>

<template>
  <div>
    <HomeHero />
    <HomeSponsorCalendar />
    <!-- <HomeSponsorCarousel /> -->
    <HomeLatestMeetup />
    <HomeFeaturedSpeakers />
    <HomeSocialPresence />
    <HomeStatsCounter />
  </div>
</template>
