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
      <div class="flex flex-col md:flex-row gap-8 md:gap-12">
        <div class="w-full md:w-1/2 max-w-full flex items-center order-2 md:order-1">
          <SponsorWhy />
        </div>
        <div class="w-full md:w-1/2 max-w-full flex items-center order-1 md:order-2">
          <SponsorEventCarousel />
        </div>
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
