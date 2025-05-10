<script setup lang="ts">
// No additional logic required for this page
</script>

<template>
  <ContentBlock>
    <BaseHeading :level="2">
      Sponsoring a meetup
    </BaseHeading>

    <div class="flex flex-col gap-24">
      <div class="flex flex-col md:flex-row gap-8">
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

      <div class="text-center my-8 md:my-0">
        <a href="mailto:sandeep@ramgolam.com" class="inline-block bg-verse-600 dark:bg-verse-400 text-white px-6 py-3 rounded-full hover:bg-verse-700 dark:hover:bg-verse-500 hover:scale-[110%] transition group text-lg font-semibold w-full md:w-auto">
          Get in touch to sponsor a meetup
        </a>
        <p class="text-sm text-verse-400 mt-8">
          Want more details about sponsorship packages, requirements, or past events? Contact us and we’ll be happy to help!
        </p>
      </div>
    </div>
  </ContentBlock>
</template>

<style>
.prose strong{
  @apply text-verse-600 dark:text-verse-100;
}
</style>
