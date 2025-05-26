<script setup lang="ts">
import sponsors from '../../../frontendmu-data/data/sponsors.js'
</script>

<template>
  <div class="homepage-container pt-20">
    <div class="homepage-wrapper">
      <main>
        <div class="relative pb-20 z-0 h-[auto] w-full">
          <div class="relative z-20 mx-auto grid grid-cols-1 gap-10 md:flex-row h-full justify-center max-w-6xl px-12">
            <div class="flex flex-col justify-center text-center gap-10">
              <BaseHeading>Our Sponsors</BaseHeading>
              <!-- <flip-book class="mt-[-16%] md:mt-[-12%]" /> -->
              <p class="max-w-3xl mx-auto text-xl text-verse-600 dark:text-verse-200 text-center">
                We're lucky to have sponsors support our community. If you're
                interested in sponsoring us, <a
                  href="mailto:sandeep+frontendmu@ramgolam.com" title="Email us"
                  class="underline"
                >please reach out to us here</a>.
              </p>
              <div class="grid place-items-center">
                <NuxtLink
                  to="/sponsors"
                  class="bg-verse-500 hover:bg-verse-600 transition-colors duration-200 text-md block w-48 rounded-full px-4 py-4 text-center font-medium text-white md:w-52 md:px-6 md:text-lg"
                >
                  View all sponsors
                </NuxtLink>
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              <template v-for="sponsorType of sponsors">
                <template v-for="sponsor of sponsorType.sponsors" :key="sponsor.name">
                  <a
                    :title="sponsor.description" target="_blank" :href="sponsor.sponsorUrl"
                    class="mt-4 h-full md:mt-0 relative rounded-xl  flex justify-between items-center flex-col gap-4 group bg-white dark:bg-verse-200 dark:backdrop-blur-sm p-6 shadow-md transition-all hover:shadow-lg"
                  >
                    <div>
                      <span class="text-2xl font-bold text-center w-full block dark:text-verse-900">
                        {{ sponsor.name }}
                      </span>
                    </div>
                    <img :src="`/img/sponsors/${sponsor.logo}`" :alt="sponsor.description">
                    <div
                      v-if="sponsor.description"
                      class="bg-gray-300 py-1 px-4 text-xs w-full text-center text-gray-500 dark:text-black font-medium rounded-2xl self-end"
                    >
                      {{ sponsor.description }}
                    </div>
                  </a>
                </template>
              </template>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
