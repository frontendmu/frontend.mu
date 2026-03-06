<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
</script>

<template>
  <Head title="About" />
  <main class="relative min-h-screen pt-40 pb-24">
      <div class="contain relative z-10">
        <!-- Header -->
        <div class="max-w-3xl mb-20 space-y-4">
          <p class="text-sm font-medium text-gray-400 dark:text-gray-500">About us</p>
          <h1 class="text-5xl md:text-7xl font-display tracking-tight dark:text-white leading-[0.9]">
            Frontend Coders <span class="font-display-italic text-verse-600 dark:text-verse-400">Mauritius</span>
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
            The local community for developers to share knowledge and build the future together.
          </p>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          <!-- Left: Main Narrative -->
          <div class="lg:col-span-7 space-y-16">
            <section class="space-y-6">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">The Mission</h2>
              <p class="text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                Formerly known as Front-End Coders Mauritius, we have evolved into a multi-disciplinary community. Our mission is simple: to foster a vibrant developer community in Mauritius by providing platforms for learning, networking, and high-impact collaboration.
              </p>
            </section>

            <section class="space-y-6">
              <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">What We Do</h2>
              <ul class="space-y-6">
                <li class="flex items-start gap-4">
                  <div class="w-1.5 h-1.5 rounded-full bg-verse-500 mt-2.5 shrink-0"></div>
                  <p class="text-lg text-gray-600 dark:text-gray-400 font-medium">Monthly meetups featuring expert talks from local legends and international guests.</p>
                </li>
                <li class="flex items-start gap-4">
                  <div class="w-1.5 h-1.5 rounded-full bg-verse-500 mt-2.5 shrink-0"></div>
                  <p class="text-lg text-gray-600 dark:text-gray-400 font-medium">Hands-on workshops designed to bridge the gap between theory and production code.</p>
                </li>
                <li class="flex items-start gap-4">
                  <div class="w-1.5 h-1.5 rounded-full bg-verse-500 mt-2.5 shrink-0"></div>
                  <p class="text-lg text-gray-600 dark:text-gray-400 font-medium">Open source initiatives that allow our members to build real-world tools for the island.</p>
                </li>
              </ul>
            </section>
          </div>

          <!-- Right: Visual / CTA Column -->
          <div class="lg:col-span-5 space-y-8">
            <div class="p-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl space-y-6">
              <h3 class="text-2xl font-display tracking-tight leading-tight">Ready to join?</h3>
              <p class="text-sm opacity-70 leading-relaxed">
                Whether you're writing your first line of CSS or architecting cloud systems, there's a seat for you.
              </p>
              <div class="flex flex-col gap-3">
                <Link href="/register" class="block w-full py-3.5 bg-verse-500 text-white text-center font-bold text-sm rounded-lg hover:bg-verse-600 transition-colors">
                  Join the Community
                </Link>
                <a href="https://discord.gg/WxXW9Jvv6k" target="_blank" class="block w-full py-3.5 border border-white/20 dark:border-gray-200 text-center font-bold text-sm rounded-lg hover:bg-white/10 dark:hover:bg-gray-100 transition-colors">
                  Hop on Discord
                </a>
              </div>
            </div>

            <!-- Stats Block -->
            <div class="p-8 border border-gray-100 dark:border-verse-800 rounded-2xl space-y-5 bg-white/50 dark:bg-verse-950/20">
              <div class="flex items-baseline gap-3">
                <span class="text-3xl font-display text-verse-500">10+</span>
                <p class="text-sm text-gray-400">years of meetups</p>
              </div>
              <div class="h-px w-full bg-gray-100 dark:bg-verse-800"></div>
              <div class="flex items-baseline gap-3">
                <span class="text-3xl font-display text-verse-500">1000+</span>
                <p class="text-sm text-gray-400">developers reached</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
</template>
