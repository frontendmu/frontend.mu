<script setup lang="ts">
</script>

<template>
  <div class="homepage-container -mt-32 pt-16 md:pt-0">
    <div class="homepage-wrapper">
      <main>
        <div class="relative z-0 w-full contain pt-[200px] pb-[100px] flex flex-col gap-32">
          <div class="relative z-20  flex flex-col-reverse md:flex-row h-full justify-between">
            <div class="flex flex-col justify-center text-center md:text-left gap-10 md:w-2/3">
              <h1
                class="font-heading dark:text-white font-black text-4xl leading-tight sm:text-5xl lg:text-5xl xl:text-7xl"
              >
                Frontend Coders<br>
                <span
                  class="accent font-bold uppercase sm:text-4xl lg:text-4xl xl:text-6xl inline-block"
                >Mauritius</span>
              </h1>
              <p class="text-md md:text-lg dark:text-gray-300 md:w-5/6">
                {{ useAppConfig().description }}
              </p>
              <div class="grid place-items-center md:place-items-start">
                <NuxtLink
                  href="/meetups"
                  class="bg-verse-500 hover:bg-verse-600 transition-colors duration-200 text-md block w-48 rounded-full px-4 py-4 text-center font-medium text-white md:w-52 md:px-6 md:text-lg"
                >
                  View all meetups
                </NuxtLink>
              </div>
            </div>

            <div class="grid place-items-center">
              <div class="image-container">
                <div class="image-bg" />
                <MiscLogoFec class="img-src text-verse-500 dark:text-white" />
              </div>
            </div>
          </div>
          <div>
            <HomeEventCarousel />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Your existing styles here */
</style>
