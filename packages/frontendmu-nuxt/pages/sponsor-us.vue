<script setup lang="ts">
// No additional logic required for this page
</script>

<template>
  <ContentBlock>
    <div class="flex flex-col gap-24 md:gap-32">
      <!-- Hero Section -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-verse-50 via-verse-100/50 to-verse-200/30 dark:from-verse-800 dark:via-verse-800/50 dark:to-verse-900/30 px-4 sm:px-8 py-12 sm:py-16 md:py-24">
        <!-- Decorative Elements -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
        <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-verse-300/20 dark:via-verse-300/10 to-transparent" />
        <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-verse-300/20 dark:via-verse-300/10 to-transparent" />
        
        <!-- Content -->
        <div class="relative text-center space-y-8 sm:space-y-12">
          <div class="space-y-6 sm:space-y-8">
            <!-- Eyebrow text -->
            <p class="text-sm md:text-base font-medium text-verse-600 dark:text-verse-400 tracking-wide uppercase">
              Join Mauritius' Premier Frontend Community
            </p>
            
            <div class="space-y-4 sm:space-y-6">
              <BaseHeading :level="1" class="text-3xl sm:text-4xl md:text-6xl !mb-0 tracking-tight bg-gradient-to-br from-verse-700 to-verse-900 dark:from-verse-200 dark:to-verse-400 bg-clip-text text-transparent px-4 sm:px-0">
                Sponsor Frontend Coders Mauritius
              </BaseHeading>
              <p class="text-lg sm:text-xl md:text-2xl text-verse-600 dark:text-verse-300 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                Partner with us to empower Mauritius' tech ecosystem while elevating your brand's presence in the developer community
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <a href="#sponsor-cta" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-white bg-verse-600 hover:bg-verse-700 rounded-xl shadow-lg shadow-verse-600/10 hover:shadow-verse-600/20 transition-all duration-200 transform hover:-translate-y-0.5">
              Become a Sponsor
              <Icon name="carbon:arrow-right" class="w-5 h-5" />
            </a>
            <a href="#calendar" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-verse-700 dark:text-verse-200 bg-white dark:bg-verse-800 hover:bg-verse-50 dark:hover:bg-verse-700 rounded-xl border border-verse-200 dark:border-verse-700 transition-all duration-200 transform hover:-translate-y-0.5">
              View Calendar
              <Icon name="carbon:calendar" class="w-5 h-5" />
            </a>
          </div>
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
      <div class="w-full max-w-5xl mx-auto bg-gradient-to-br from-verse-50 via-verse-100/50 to-verse-50/30 dark:from-verse-800 dark:via-verse-800/50 dark:to-verse-900/30 rounded-3xl px-4 sm:px-8 py-12 md:p-12">
        <div class="text-center space-y-6 mb-12">
          <BaseHeading :level="2" class="text-3xl !mb-0">
            Our Previous Events
          </BaseHeading>
          <p class="text-lg text-verse-600 dark:text-verse-300 max-w-2xl mx-auto">
            Take a look at the impact and engagement from our past meetups
          </p>
        </div>
        <div class="-mx-4 sm:mx-0">
          <SponsorEventCarousel />
        </div>
      </div>

      <!-- Process Section -->
      <div class="w-full max-w-5xl mx-auto px-4 sm:px-0">
        <SponsorHow />
      </div>

      <!-- Advocate Section -->
      <div class="w-full max-w-5xl mx-auto bg-gradient-to-br from-verse-50 via-verse-100/50 to-verse-50/30 dark:from-verse-800/80 dark:via-verse-800/60 dark:to-verse-900/40 rounded-3xl px-4 sm:px-8 py-12 md:p-12 border border-verse-200/10 dark:border-verse-700/10 backdrop-blur-sm">
        <SponsorAdvocate />
      </div>

      <!-- CTA Section -->
      <div class="w-full max-w-4xl mx-auto px-4 sm:px-0">
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
