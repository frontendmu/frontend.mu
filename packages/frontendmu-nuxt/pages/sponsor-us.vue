<script setup lang="ts">
// No additional logic required for this page
</script>

<template>
  <ContentBlock>
    <SponsorYearCalendar />

    <div class="space-y-4 mb-16 text-center md:text-left">
      <BaseHeading :level="2" class="!mb-2">
        Sponsoring a meetup
      </BaseHeading>
      <p class="text-xl text-verse-600 dark:text-verse-300 max-w-2xl">
        Support the frontend development community in Mauritius while gaining visibility for your brand
      </p>
    </div>

    <div class="flex flex-col gap-16 md:gap-24">
      <div class="flex flex-col gap-8">
        <div class="w-full max-w-4xl mx-auto">
          <SponsorWhy />
        </div>
      </div>

      <div class="w-full max-w-3xl mx-auto">
        <SponsorEventCarousel />
      </div>

      <div class="flex flex-col md:flex-row gap-8">
        <SponsorHow />
      </div>

      <div class="flex flex-col gap-8">
        <SponsorAdvocate />
      </div>

      <SponsorCta />
    </div>
  </ContentBlock>
</template>

<style>
.prose strong{
  @apply text-verse-600 dark:text-verse-100;
}
</style>
