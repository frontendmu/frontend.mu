<script setup lang="ts">
// No additional logic required for this page
</script>

<template>
  <ContentBlock>
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

      <div class="text-center py-12 md:py-16 px-4 md:px-8 bg-verse-50 dark:bg-verse-900/50 rounded-2xl max-w-4xl mx-auto w-full">
        <h3 class="text-2xl font-bold text-verse-700 dark:text-verse-200 mb-4">
          Ready to make an impact?
        </h3>
        <p class="text-lg text-verse-600 dark:text-verse-300 mb-8 max-w-xl mx-auto">
          Join us in fostering the growth of frontend development in Mauritius
        </p>
        <a
          href="mailto:sandeep@ramgolam.com"
          class="inline-block bg-verse-600 dark:bg-verse-400 text-white px-8 py-4 rounded-full hover:bg-verse-700 dark:hover:bg-verse-500 hover:scale-[105%] transition-all duration-200 text-lg font-semibold w-full md:w-auto shadow-lg hover:shadow-xl"
        >
          Get in touch to sponsor a meetup
        </a>
        <p class="text-sm text-verse-500 dark:text-verse-400 mt-6">
          Want more details about sponsorship packages, requirements, or past events? Contact us and we'll be happy to help!
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
