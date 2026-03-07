<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Coding Guidelines" />
  <main class="relative min-h-screen pt-40 pb-24">
      <div class="contain relative z-10">
        <!-- Page Header -->
        <div class="max-w-4xl mb-24 space-y-6">
          <p class="text-sm font-medium text-gray-400 dark:text-gray-500">Development standards</p>

          <h1 class="text-5xl md:text-6xl font-display tracking-tight dark:text-white leading-[0.9]">
            Coding Guidelines
          </h1>
          
          <p class="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
            Maintaining a high standard of quality and consistency across our open source projects. These are our community-driven best practices.
          </p>
        </div>

        <!-- Guidelines Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <!-- Main Content -->
          <div class="lg:col-span-8 space-y-24">
            <!-- 1. General Principles -->
            <section class="space-y-8">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold uppercase tracking-wider text-verse-500">General Principles</span>
                <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="p-8 bg-white dark:bg-verse-950/40 border border-verse-100 dark:border-verse-800 rounded-xl space-y-4">
                  <h3 class="text-lg font-bold dark:text-white">Clarity & Simplicity</h3>
                  <p class="text-gray-500 dark:text-gray-400 font-medium">Write clear and straightforward code. Avoid complex or obscure constructs that might confuse fellow contributors.</p>
                </div>
                <div class="p-8 bg-white dark:bg-verse-950/40 border border-verse-100 dark:border-verse-800 rounded-xl space-y-4">
                  <h3 class="text-lg font-bold dark:text-white">Consistency</h3>
                  <p class="text-gray-500 dark:text-gray-400 font-medium">Follow existing patterns and project structure. Familiarity is key to sustainable community maintenance.</p>
                </div>
              </div>
            </section>

            <!-- 2. Commit Messages -->
            <section class="space-y-8">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold uppercase tracking-wider text-verse-500">Commit Standards</span>
                <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
              </div>
              <div class="p-10 bg-gray-900 dark:bg-verse-900/20 border border-transparent dark:border-verse-800 rounded-2xl space-y-6">
                <p class="text-gray-400 font-mono text-sm">Format: <span class="text-verse-400">type(scope): description</span></p>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-mono text-white">feat</div>
                  <div class="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-mono text-white">fix</div>
                  <div class="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-mono text-white">refactor</div>
                  <div class="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-mono text-white">chore</div>
                </div>
                <p class="text-gray-400 font-medium leading-relaxed italic">"Example: fix(navbar): resolve alignment issue on mobile viewports"</p>
              </div>
            </section>

            <!-- 3. Accessibility -->
            <section class="space-y-8">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold uppercase tracking-wider text-verse-500">Accessibility</span>
                <div class="h-px flex-1 bg-gray-100 dark:bg-verse-900"></div>
              </div>
              <ul class="space-y-6">
                <li class="flex items-start gap-4">
                  <div class="w-1.5 h-1.5 rounded-full bg-verse-500 mt-2.5 shrink-0"></div>
                  <p class="text-lg text-gray-600 dark:text-gray-400 font-medium">Use semantic HTML and ARIA attributes where necessary to improve screen reader support.</p>
                </li>
                <li class="flex items-start gap-4">
                  <div class="w-1.5 h-1.5 rounded-full bg-verse-500 mt-2.5 shrink-0"></div>
                  <p class="text-lg text-gray-600 dark:text-gray-400 font-medium">Ensure all interactive elements are keyboard-accessible and follow a logical tab order.</p>
                </li>
                <li class="flex items-start gap-4">
                  <div class="w-1.5 h-1.5 rounded-full bg-verse-500 mt-2.5 shrink-0"></div>
                  <p class="text-lg text-gray-600 dark:text-gray-400 font-medium">Follow WCAG guidelines for color contrast and readability across all viewports.</p>
                </li>
              </ul>
            </section>
          </div>

          <!-- Sidebar -->
          <aside class="lg:col-span-4 space-y-8">
            <div class="sticky top-32 space-y-8">
              <div class="p-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-2xl space-y-6">
                <h3 class="text-2xl font-display tracking-tight">Contributing?</h3>
                <p class="font-medium opacity-70">Before submitting a PR, ensure you have run the local linters and tests. We value quality over quantity.</p>
                <a href="https://github.com/frontendmu" target="_blank" rel="noopener noreferrer" class="block w-full py-4 bg-verse-500 text-white text-center font-bold text-sm rounded-lg hover:scale-105 transition-all">
                  Open GitHub
                </a>
              </div>

              <div class="p-8 border border-verse-100 dark:border-verse-800 rounded-2xl space-y-4 bg-white/50 dark:bg-verse-950/20 backdrop-blur-xl">
                <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-400">Note</h4>
                <p class="text-xs font-bold text-gray-500 leading-relaxed italic">
                  "These are guidelines, not rigid rules. Use your best judgment and feel free to propose changes via PRs."
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
</template>
