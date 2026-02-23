<script setup lang="ts">
const { allMeetups } = useMeetups({ pastMeetupsLimit: 100 })
const { register: registerMeetupSearch, cleanup: cleanupMeetupSearch } = useWebMCPMeetups(allMeetups)

onMounted(() => registerMeetupSearch())
onUnmounted(() => cleanupMeetupSearch())

defineOgImageComponent('Home')
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
