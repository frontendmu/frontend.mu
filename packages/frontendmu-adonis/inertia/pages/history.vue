<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
</script>

<template>
  <Head title="History" />
  <main class="relative min-h-screen pt-40 pb-24">
      <div class="contain relative z-10">
        <!-- Page Header -->
        <div class="max-w-4xl mb-24 space-y-6">
          <p class="text-sm font-medium text-gray-400 dark:text-gray-500">Our story</p>

          <h1 class="text-5xl md:text-6xl font-display tracking-tight dark:text-white leading-[0.9]">
            Community History
          </h1>
          
          <p class="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
            The story of Frontend Coders Mauritius and its evolution over the years.
          </p>
        </div>

        <!-- Timeline -->
        <div class="relative space-y-24">
          <!-- Central Line -->
          <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-verse-500 via-gray-200 dark:via-verse-800 to-transparent md:-translate-x-1/2 hidden md:block"></div>

          <!-- Phase 1 -->
          <div class="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div class="md:text-right space-y-4">
              <span class="text-xs font-black uppercase tracking-widest text-verse-500">2016 — 2018</span>
              <h2 class="text-4xl font-black tracking-tight dark:text-white">The Genesis</h2>
              <p class="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-md md:ml-auto">
                Founded by <strong class="text-gray-900 dark:text-white">David Dias</strong>. The community was born out of a need for front-end specialized knowledge in Mauritius.
              </p>
            </div>
            <div class="relative hidden md:block">
              <div class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-verse-500 shadow-[0_0_15px_rgba(30,58,138,0.5)]"></div>
            </div>
          </div>

          <!-- Phase 2 -->
          <div class="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div class="relative hidden md:block order-last md:order-none">
              <div class="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-verse-500 shadow-[0_0_15px_rgba(30,58,138,0.5)]"></div>
            </div>
            <div class="space-y-4">
              <span class="text-xs font-black uppercase tracking-widest text-verse-500">2018 — 2022</span>
              <h2 class="text-4xl font-black tracking-tight dark:text-white">Growth & Scaling</h2>
              <p class="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-md">
                Led by <strong class="text-gray-900 dark:text-white">Cedric Poilly</strong> and <strong class="text-gray-900 dark:text-white">Sandeep Ramgolam</strong>. This era saw the scaling of meetups and the establishment of a regular cadence.
              </p>
            </div>
          </div>

          <!-- Phase 3 -->
          <div class="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div class="md:text-right space-y-4">
              <span class="text-xs font-black uppercase tracking-widest text-verse-500">2022 — Present</span>
              <h2 class="text-4xl font-black tracking-tight dark:text-white">Modern Era</h2>
              <p class="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-md md:ml-auto">
                Current leadership: <strong class="text-gray-900 dark:text-white">Sandeep Ramgolam</strong>, <strong class="text-gray-900 dark:text-white">Kushul Soomaree</strong>, and <strong class="text-gray-900 dark:text-white">Cedric Poilly</strong>. Evolving into a full-stack community under the coders.mu banner.
              </p>
            </div>
            <div class="relative hidden md:block">
              <div class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-verse-500 shadow-[0_0_15px_rgba(30,58,138,0.5)]"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
</template>
