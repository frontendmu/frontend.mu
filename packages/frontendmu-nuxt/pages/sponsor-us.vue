<script setup lang="ts">
// No additional logic required for this page
</script>

<template>
  <ContentBlock>
    <div class="flex flex-col gap-24 md:gap-32">
      <!-- Hero Section -->
      <div class="text-center space-y-8">
        <div class="space-y-6">
          <BaseHeading :level="1" class="text-4xl md:text-5xl !mb-0 tracking-tight">
            Sponsor Frontend Coders Mauritius
          </BaseHeading>
          <p class="text-xl md:text-2xl text-verse-600 dark:text-verse-300 max-w-3xl mx-auto leading-relaxed">
            Join us in fostering Mauritius' tech community while gaining exceptional brand visibility
          </p>
        </div>

        <div class="pt-4">
          <a href="#sponsor-cta" class="inline-flex items-center gap-2 px-6 py-3 text-lg font-medium text-white bg-verse-600 hover:bg-verse-700 rounded-lg transition-colors duration-200">
            Become a Sponsor
            <Icon name="carbon:arrow-right" class="w-5 h-5" />
          </a>
        </div>
      </div>

      <!-- Above the Fold Sections -->
      <div class="grid md:grid-cols-1 gap-12 md:gap-16">
        <!-- Calendar Section -->
        <div class="space-y-6">
          <SponsorYearCalendar />
        </div>

        <!-- Benefits Preview -->
        <div class="space-y-6">
          <div class="text-center md:text-left">
            <BaseHeading :level="2" class="text-2xl md:text-3xl !mb-4">
              Why Sponsor?
            </BaseHeading>
            <p class="text-lg text-verse-600 dark:text-verse-300">
              Discover the value of supporting our community
            </p>
          </div>
          <SponsorWhy />
        </div>
      </div>

      <!-- Event Showcase Section -->
      <div class="w-full max-w-5xl mx-auto bg-gradient-to-b from-verse-50/50 to-transparent dark:from-verse-900/50 rounded-3xl p-8 md:p-12">
        <div class="text-center space-y-6 mb-12">
          <BaseHeading :level="2" class="text-3xl !mb-0">
            Our Previous Events
          </BaseHeading>
          <p class="text-lg text-verse-600 dark:text-verse-300 max-w-2xl mx-auto">
            Take a look at the impact and engagement from our past meetups
          </p>
        </div>
        <SponsorEventCarousel />
      </div>

      <!-- Process Section -->
      <div class="w-full max-w-5xl mx-auto">
        <SponsorHow />
      </div>

      <!-- Advocate Section -->
      <div class="w-full max-w-5xl mx-auto bg-gradient-to-b from-verse-50/50 to-transparent dark:from-verse-900/50 rounded-3xl p-8 md:p-12">
        <SponsorAdvocate />
      </div>

      <!-- CTA Section -->
      <div class="w-full max-w-4xl mx-auto">
        <SponsorCta />
      </div>
    </div>
  </ContentBlock>
</template>

<style>
.prose strong{
  @apply text-verse-600 dark:text-verse-100;
}
</style>
