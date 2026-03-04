<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
</script>

<template>
  <Head title="Code of Conduct" />
  <DefaultLayout>
    <main class="relative min-h-screen pt-40 pb-24">
      <div class="contain relative z-10">
        <!-- Page Header -->
        <div class="max-w-4xl mb-24 space-y-6">
          <div class="inline-flex items-center gap-3">
            <span class="h-1 w-12 bg-verse-500 rounded-full"></span>
            <span class="text-sm font-black uppercase tracking-[0.4em] text-verse-500">Standards</span>
          </div>
          
          <h1 class="text-6xl md:text-8xl font-black tracking-tighter dark:text-white leading-[0.9]">
            Code of <br />
            <span class="text-verse-600 dark:text-verse-400">Conduct.</span>
          </h1>
          
          <p class="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
            Our community is built on mutual respect and shared passion. We maintain a professional and welcoming environment for everyone.
          </p>
        </div>

        <!-- Content Sections -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          <!-- Main Text Column -->
          <div class="lg:col-span-8 space-y-24">
            <!-- Our Pledge -->
            <section class="space-y-8">
              <div class="flex items-center gap-3">
                <span class="h-px w-8 bg-verse-500"></span>
                <h2 class="text-sm font-black uppercase tracking-[0.3em] text-verse-500">Our Pledge</h2>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
                We as members, contributors, and leaders pledge to make participation in the coders.mu community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.
              </p>
            </section>

            <!-- Our Standards -->
            <section class="space-y-8">
              <div class="flex items-center gap-3">
                <span class="h-px w-8 bg-verse-500"></span>
                <h2 class="text-sm font-black uppercase tracking-[0.3em] text-verse-500">Our Standards</h2>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="p-8 bg-green-500/5 border border-green-500/10 rounded-[2.5rem] space-y-4">
                  <h3 class="text-xl font-black text-green-600 uppercase tracking-widest">Positive Behavior</h3>
                  <ul class="space-y-4 text-gray-600 dark:text-gray-400 font-medium">
                    <li class="flex gap-3"><span>•</span> Demonstrating empathy and kindness</li>
                    <li class="flex gap-3"><span>•</span> Being respectful of differing viewpoints</li>
                    <li class="flex gap-3"><span>•</span> Gracefully accepting constructive feedback</li>
                    <li class="flex gap-3"><span>•</span> Focusing on what is best for the community</li>
                  </ul>
                </div>
                <div class="p-8 bg-red-500/5 border border-red-500/10 rounded-[2.5rem] space-y-4">
                  <h3 class="text-xl font-black text-red-600 uppercase tracking-widest">Unacceptable</h3>
                  <ul class="space-y-4 text-gray-600 dark:text-gray-400 font-medium">
                    <li class="flex gap-3"><span>•</span> Sexualized language or imagery</li>
                    <li class="flex gap-3"><span>•</span> Trolling, insulting or derogatory comments</li>
                    <li class="flex gap-3"><span>•</span> Public or private harassment</li>
                    <li class="flex gap-3"><span>•</span> Publishing others' private information</li>
                  </ul>
                </div>
              </div>
            </section>

            <!-- Enforcement -->
            <section class="space-y-8">
              <div class="flex items-center gap-3">
                <span class="h-px w-8 bg-verse-500"></span>
                <h2 class="text-sm font-black uppercase tracking-[0.3em] text-verse-500">Enforcement</h2>
              </div>
              <div class="prose prose-xl prose-gray dark:prose-invert max-w-none">
                <p>Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.</p>
                <p>Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the community leaders responsible for enforcement at <a href="mailto:hello@frontend.mu" class="text-verse-500 font-black no-underline hover:underline">hello@frontend.mu</a>.</p>
              </div>
            </section>
          </div>

          <!-- Sidebar / Quick Info -->
          <div class="lg:col-span-4 space-y-8 sticky top-32">
            <div class="p-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[3rem] shadow-2xl space-y-6">
              <h3 class="text-2xl font-black tracking-tight">Need to report?</h3>
              <p class="font-medium opacity-70">
                All complaints will be reviewed and investigated promptly and fairly. All community leaders are obligated to respect the privacy and security of the reporter.
              </p>
              <a href="mailto:hello@frontend.mu" class="block w-full py-4 bg-verse-500 text-white text-center font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all">
                Email Leadership
              </a>
            </div>

            <div class="p-8 border border-verse-100 dark:border-verse-800 rounded-[3rem] space-y-4 bg-white/50 dark:bg-verse-950/20 backdrop-blur-xl">
              <h4 class="text-[10px] font-black uppercase tracking-widest text-gray-400">Attribution</h4>
              <p class="text-xs font-bold text-gray-500 leading-relaxed">
                This Code of Conduct is adapted from the Contributor Covenant, version 2.1. Community Impact Guidelines were inspired by Mozilla's enforcement ladder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </DefaultLayout>
</template>
