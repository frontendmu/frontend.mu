<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Contribute" />
  <main class="relative min-h-screen pt-40 pb-24">
      <div class="contain relative z-10">
        <!-- Page Header -->
        <div class="max-w-4xl mb-24 space-y-6">
          <p class="text-sm font-medium text-gray-400 dark:text-gray-500">Open source</p>

          <h1 class="text-5xl md:text-7xl font-display tracking-tight dark:text-white leading-[0.9]">
            Help us <span class="font-display-italic text-verse-600 dark:text-verse-400">build this</span>
          </h1>
          
          <p class="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
            coders.mu is community-driven. Every feature, every talk, and every line of code is a collective effort. Here is how you can play a part.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <!-- Main Content -->
          <div class="lg:col-span-8 space-y-24">
            <!-- Ways to Contribute -->
            <section class="space-y-12">
              <div class="flex items-center gap-3">
                <span class="h-px w-8 bg-verse-500"></span>
                <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">Avenues of Impact</h2>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="p-8 bg-white dark:bg-verse-950/40 border border-verse-100 dark:border-verse-800 rounded-xl space-y-4">
                  <h3 class="text-xl font-bold dark:text-white">Event Curation</h3>
                  <p class="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Help us plan, promote, and run meetups. Suggest speakers or volunteer for logistics.</p>
                </div>
                <div class="p-8 bg-white dark:bg-verse-950/40 border border-verse-100 dark:border-verse-800 rounded-xl space-y-4">
                  <h3 class="text-xl font-bold dark:text-white">Design & Code</h3>
                  <p class="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Improve the site UI, fix bugs, or enhance accessibility. Our codebase is your playground.</p>
                </div>
                <div class="p-8 bg-white dark:bg-verse-950/40 border border-verse-100 dark:border-verse-800 rounded-xl space-y-4">
                  <h3 class="text-xl font-bold dark:text-white">Content Management</h3>
                  <p class="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Ensure speakers and sponsors are accurately represented and kept up to date.</p>
                </div>
                <div class="p-8 bg-white dark:bg-verse-950/40 border border-verse-100 dark:border-verse-800 rounded-xl space-y-4">
                  <h3 class="text-xl font-bold dark:text-white">Community Flow</h3>
                  <p class="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Engage with members on Discord and help spread the word about our mission.</p>
                </div>
              </div>
            </section>

            <!-- Local Setup -->
            <section class="space-y-12">
              <div class="flex items-center gap-3">
                <span class="h-px w-8 bg-verse-500"></span>
                <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">Quick Start Guide</h2>
              </div>

              <div class="bg-gray-900 dark:bg-verse-900/20 rounded-2xl p-10 space-y-8">
                <div class="space-y-6">
                  <div class="flex gap-5">
                    <div class="w-2 h-2 rounded-full bg-verse-500 mt-2.5 shrink-0"></div>
                    <div>
                      <h4 class="text-xl font-bold text-white mb-2">Fork & Clone</h4>
                      <p class="text-gray-400 font-medium">Create your own copy of the repository on GitHub and pull it to your local machine.</p>
                    </div>
                  </div>
                  <div class="flex gap-5">
                    <div class="w-2 h-2 rounded-full bg-verse-500 mt-2.5 shrink-0"></div>
                    <div>
                      <h4 class="text-xl font-bold text-white mb-2">Install Deps</h4>
                      <p class="text-gray-400 font-medium">Run <code class="bg-white/5 px-2 py-1 rounded">pnpm install</code> to get the project ready for development.</p>
                    </div>
                  </div>
                  <div class="flex gap-5">
                    <div class="w-2 h-2 rounded-full bg-verse-500 mt-2.5 shrink-0"></div>
                    <div>
                      <h4 class="text-xl font-bold text-white mb-2">Env Setup</h4>
                      <p class="text-gray-400 font-medium">Copy the example environment file and adjust your local configuration.</p>
                    </div>
                  </div>
                </div>
                <div class="pt-4 border-t border-white/10 flex justify-between items-center">
                  <p class="text-xs font-mono text-verse-400">pnpm run dev</p>
                  <p class="text-xs font-medium text-gray-500">Spin up the local server</p>
                </div>
              </div>
            </section>
          </div>

          <!-- Sidebar -->
          <aside class="lg:col-span-4 space-y-8">
            <div class="sticky top-32 space-y-8">
              <div class="p-8 bg-white dark:bg-verse-950/80 backdrop-blur-xl border border-verse-100 dark:border-verse-800 rounded-2xl shadow-2xl space-y-6">
                <h3 class="text-2xl font-display tracking-tight dark:text-white">Contribution Flow</h3>
                <div class="space-y-4">
                  <Link href="/code-of-conduct" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-verse-900/40 rounded-2xl group transition-all hover:border-verse-500 border border-transparent">
                    <span class="font-bold text-gray-600 dark:text-gray-300 group-hover:text-verse-500">Code of Conduct</span>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                  <Link href="/coding-guidelines" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-verse-900/40 rounded-2xl group transition-all hover:border-verse-500 border border-transparent">
                    <span class="font-bold text-gray-600 dark:text-gray-300 group-hover:text-verse-500">Coding Standards</span>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              </div>

              <div class="p-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-2xl space-y-6">
                <h3 class="text-xl font-display tracking-tight">Need help?</h3>
                <p class="text-sm font-medium opacity-70">Reach out on Discord or open a GitHub issue. We're here to help you get started.</p>
                <a href="https://github.com/frontendmu" target="_blank" rel="noopener noreferrer" class="block w-full py-4 bg-verse-500 text-white text-center font-bold text-sm rounded-lg hover:scale-105 transition-all">
                  Open GitHub
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
</template>
