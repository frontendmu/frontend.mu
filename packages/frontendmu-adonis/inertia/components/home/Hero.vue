<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import Logo from '~/components/layout/Logo.vue'

const description =
  'A community of passionate developers in Mauritius. Join us for regular meetups, workshops, and tech talks.'
</script>

<template>
  <div class="homepage-container -mt-32 pt-16 md:pt-0">
    <div class="homepage-wrapper">
      <main>
        <div
          class="relative z-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[200px] pb-[100px] flex flex-col gap-32"
        >
          <div class="relative z-20 flex flex-col-reverse md:flex-row h-full justify-between">
            <div class="flex flex-col justify-center text-center md:text-left gap-10 md:w-2/3">
              <h1
                class="font-heading dark:text-white font-black text-4xl leading-tight sm:text-5xl lg:text-5xl xl:text-7xl"
              >
                Frontend Coders<br />
                <span
                  class="accent font-bold uppercase sm:text-4xl lg:text-4xl xl:text-6xl inline-block"
                  >Mauritius</span
                >
              </h1>
              <p class="text-md md:text-lg dark:text-gray-300 md:w-5/6">
                {{ description }}
              </p>
              <div class="grid place-items-center md:place-items-start">
                <Link
                  href="/meetups"
                  class="bg-verse-500 hover:bg-verse-600 transition-colors duration-200 text-md block w-48 rounded-full px-4 py-4 text-center font-medium text-white md:w-52 md:px-6 md:text-lg"
                >
                  View all meetups
                </Link>
              </div>
            </div>

            <div class="grid place-items-center">
              <div class="image-container">
                <div class="image-bg" />
                <Logo class="img-src text-verse-500 dark:text-white w-48 md:w-64 lg:w-80" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.accent {
  background: linear-gradient(
    135deg,
    hsl(13, 100%, 52%) 10%,
    hsl(175, 100%, 38%) 50%,
    hsl(13, 100%, 52%) 80%,
    hsl(175, 100%, 38%) 90%
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-size: 400% 400%;
  animation: gradient-animation 12s ease infinite;
}

@keyframes gradient-animation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.image-container {
  position: relative;
}

.image-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(0, 200, 150, 0.2) 0%, transparent 70%);
  filter: blur(40px);
  transform: scale(1.5);
}
</style>
