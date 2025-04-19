<script setup lang="ts">
defineOgImageComponent('Home')
</script>

<template>
  <div>
    <HomeHero />
    <HomeLatestMeetup />
    <ClientOnly>
      <HomeTeamSection />
    </ClientOnly>
    <HomeFeaturedSpeakers />
    <HomeSocialPresence />
    <HomeStatsCounter />
  </div>
</template>
