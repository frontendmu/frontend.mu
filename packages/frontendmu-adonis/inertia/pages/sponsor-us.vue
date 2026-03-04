<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Sponsor Us" />
  <main class="relative min-h-screen pt-20 pb-32">
      <div class="contain relative z-10 max-w-5xl">
        <!-- Page Header -->
        <div class="mb-20 space-y-4">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black uppercase tracking-[0.3em] text-verse-500 dark:text-verse-300 bg-verse-500/10 px-2 py-0.5 rounded">Opportunity</span>
          </div>
          
          <h1 class="text-5xl md:text-7xl font-black tracking-tighter dark:text-white leading-none">
            Invest in us<span class="text-verse-600 dark:text-verse-400">.</span>
          </h1>
          
          <p class="text-base text-gray-500 dark:text-gray-400 font-medium max-w-xl leading-relaxed">
            Support the growth of the Mauritian tech ecosystem while gaining visibility among talented developers.
          </p>
        </div>

        <!-- Why Sponsor? -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mb-32 items-start">
          <div class="lg:col-span-7 space-y-12">
            <section class="space-y-8">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-[0.2em] text-verse-500 dark:text-verse-400">The Value</span>
                <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="p-6 bg-white dark:bg-verse-950/40 border border-gray-100 dark:border-verse-800 rounded-2xl shadow-sm">
                  <h3 class="text-lg font-black mb-3 dark:text-gray-100">Talent Acquisition</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Connect directly with the most active and ambitious developers in Mauritius.</p>
                </div>
                <div class="p-6 bg-white dark:bg-verse-950/40 border border-gray-100 dark:border-verse-800 rounded-2xl shadow-sm">
                  <h3 class="text-lg font-black mb-3 dark:text-gray-100">Brand Visibility</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Position your organization as a key player in the local tech revolution.</p>
                </div>
                <div class="p-6 bg-white dark:bg-verse-950/40 border border-gray-100 dark:border-verse-800 rounded-2xl shadow-sm">
                  <h3 class="text-lg font-black mb-3 dark:text-gray-100">Community Support</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Show your commitment to continuous learning and professional growth.</p>
                </div>
                <div class="p-6 bg-white dark:bg-verse-950/40 border border-gray-100 dark:border-verse-800 rounded-2xl shadow-sm">
                  <h3 class="text-lg font-black mb-3 dark:text-gray-100">Networking</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Build meaningful relationships with other tech leaders and community organizers.</p>
                </div>
              </div>
            </section>
          </div>

          <div class="lg:col-span-5 space-y-8">
            <!-- Contact Card -->
            <div class="p-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-3xl shadow-2xl space-y-6">
              <h3 class="text-2xl font-black tracking-tight leading-tight">Let's talk partnerships.</h3>
              <p class="text-base font-medium opacity-70 leading-relaxed">
                Every sponsorship is a custom partnership. We'll work with you to ensure your goals are met.
              </p>
              <div class="pt-2">
                <a
                  href="mailto:hello@frontend.mu"
                  class="block w-full py-4 bg-verse-500 text-white text-center text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20"
                >
                  Send an Inquiry
                </a>
              </div>
              <p class="text-center text-[9px] font-bold opacity-50 uppercase tracking-widest italic">
                Response time: 24-48 hours
              </p>
            </div>

            <!-- Sponsorship Tiers (Simplified) -->
            <div class="p-8 border border-gray-100 dark:border-verse-800 rounded-3xl space-y-6 bg-white/50 dark:bg-verse-950/20 backdrop-blur-xl">
              <h4 class="text-[9px] font-black uppercase tracking-widest text-gray-400">Available Options</h4>
              <ul class="space-y-4">
                <li class="flex items-center justify-between font-bold text-sm">
                  <span class="text-gray-600 dark:text-gray-300">Venue Hosting</span>
                  <span class="text-[9px] font-black uppercase tracking-widest text-verse-500 bg-verse-500/10 px-2 py-0.5 rounded">Popular</span>
                </li>
                <li class="h-px w-full bg-gray-50 dark:bg-verse-800"></li>
                <li class="flex items-center justify-between font-bold text-sm text-gray-600 dark:text-gray-300">
                  <span>Catering & Refreshments</span>
                </li>
                <li class="h-px w-full bg-gray-50 dark:bg-verse-800"></li>
                <li class="flex items-center justify-between font-bold text-sm text-gray-600 dark:text-gray-300">
                  <span>Workshop Equipment</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
</template>
