<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
</script>

<template>
  <Head title="About" />
  <DefaultLayout>
    <main class="relative min-h-screen pt-40 pb-24">
      <div class="contain relative z-10">
        <!-- Header -->
        <div class="max-w-4xl mb-32 space-y-6">
          <div class="inline-flex items-center gap-3">
            <span class="h-1 w-12 bg-verse-500 rounded-full"></span>
            <span class="text-sm font-black uppercase tracking-[0.4em] text-verse-500">About</span>
          </div>
          
          <h1 class="text-6xl md:text-8xl font-black tracking-tighter dark:text-white leading-[0.9]">
            Frontend <br />
            <span class="text-verse-600 dark:text-verse-400">Coders Mauritius.</span>
          </h1>
          
          <p class="text-2xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
            The local community for developers to share knowledge and build the future together.
          </p>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          <!-- Left: Main Narrative -->
          <div class="lg:col-span-7 space-y-16">
            <section class="space-y-8">
              <div class="flex items-center gap-3">
                <span class="h-px w-8 bg-verse-500"></span>
                <h2 class="text-sm font-black uppercase tracking-[0.3em] text-verse-500">The Mission</h2>
              </div>
              <p class="text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                Formerly known as Front-End Coders Mauritius, we have evolved into a multi-disciplinary community. Our mission is simple: to foster a vibrant developer community in Mauritius by providing platforms for learning, networking, and high-impact collaboration.
              </p>
            </section>

            <section class="space-y-8">
              <div class="flex items-center gap-3">
                <span class="h-px w-8 bg-verse-500"></span>
                <h2 class="text-sm font-black uppercase tracking-[0.3em] text-verse-500">What We Do</h2>
              </div>
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
          <div class="lg:col-span-5 space-y-12">
            <div class="p-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[3rem] shadow-2xl space-y-8">
              <h3 class="text-3xl font-black tracking-tight leading-tight">Ready to join the movement?</h3>
              <p class="text-lg font-medium opacity-70 leading-relaxed">
                Whether you're writing your first line of CSS or architecting complex cloud systems, there's a seat for you at our table.
              </p>
              <div class="pt-4 flex flex-col gap-4">
                <Link href="/register" class="block w-full py-5 bg-verse-500 text-white text-center font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all">
                  Join the Community
                </Link>
                <a href="https://discord.gg/WxXW9Jvv6k" target="_blank" class="block w-full py-5 border-2 border-white/20 dark:border-gray-200 text-center font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 dark:hover:bg-gray-100 transition-all">
                  Hop on Discord
                </a>
              </div>
            </div>

            <!-- Stats Block -->
            <div class="p-10 border border-verse-100 dark:border-verse-800 rounded-[3rem] space-y-6 bg-white/50 dark:bg-verse-950/20 backdrop-blur-xl">
              <div class="flex items-center gap-4">
                <span class="text-4xl font-black text-verse-500">10+</span>
                <p class="text-sm font-black uppercase tracking-widest text-gray-400">Years of Code</p>
              </div>
              <div class="h-px w-full bg-verse-100 dark:border-verse-800"></div>
              <div class="flex items-center gap-4">
                <span class="text-4xl font-black text-verse-500">1000+</span>
                <p class="text-sm font-black uppercase tracking-widest text-gray-400">Developers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </DefaultLayout>
</template>
