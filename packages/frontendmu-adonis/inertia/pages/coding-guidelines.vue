<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Coding Guidelines" />
  <main class="relative min-h-screen pt-40 pb-24">
      <div class="contain relative z-10">
        <!-- Page Header -->
        <div class="max-w-4xl mb-24 space-y-6">
          <div class="inline-flex items-center gap-3">
            <span class="h-1 w-12 bg-verse-500 rounded-full"></span>
            <span class="text-sm font-black uppercase tracking-[0.4em] text-verse-500">Quality Control</span>
          </div>
          
          <h1 class="text-6xl md:text-8xl font-black tracking-tighter dark:text-white leading-[0.9]">
            Coding <br />
            <span class="text-verse-600 dark:text-verse-400">Guidelines.</span>
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
              <div class="flex items-center gap-3">
                <span class="text-4xl font-black text-verse-500/20">01</span>
                <h2 class="text-2xl font-black uppercase tracking-widest dark:text-white">General Principles</h2>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="p-8 bg-white dark:bg-verse-950/40 border border-verse-100 dark:border-verse-800 rounded-[2.5rem] space-y-4">
                  <h3 class="text-lg font-black dark:text-white">Clarity & Simplicity</h3>
                  <p class="text-gray-500 dark:text-gray-400 font-medium">Write clear and straightforward code. Avoid complex or obscure constructs that might confuse fellow contributors.</p>
                </div>
                <div class="p-8 bg-white dark:bg-verse-950/40 border border-verse-100 dark:border-verse-800 rounded-[2.5rem] space-y-4">
                  <h3 class="text-lg font-black dark:text-white">Consistency</h3>
                  <p class="text-gray-500 dark:text-gray-400 font-medium">Follow existing patterns and project structure. Familiarity is key to sustainable community maintenance.</p>
                </div>
              </div>
            </section>

            <!-- 2. Commit Messages -->
            <section class="space-y-8">
              <div class="flex items-center gap-3">
                <span class="text-4xl font-black text-verse-500/20">02</span>
                <h2 class="text-2xl font-black uppercase tracking-widest dark:text-white">Commit Standards</h2>
              </div>
              <div class="p-10 bg-gray-900 dark:bg-verse-900/20 border border-transparent dark:border-verse-800 rounded-[3rem] space-y-6">
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
              <div class="flex items-center gap-3">
                <span class="text-4xl font-black text-verse-500/20">03</span>
                <h2 class="text-2xl font-black uppercase tracking-widest dark:text-white">Accessibility</h2>
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
              <div class="p-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[3rem] shadow-2xl space-y-6">
                <h3 class="text-2xl font-black tracking-tight">Contributing?</h3>
                <p class="font-medium opacity-70">Before submitting a PR, ensure you have run the local linters and tests. We value quality over quantity.</p>
                <a href="https://github.com/frontendmu" target="_blank" class="block w-full py-4 bg-verse-500 text-white text-center font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all">
                  Open GitHub
                </a>
              </div>

              <div class="p-8 border border-verse-100 dark:border-verse-800 rounded-[3rem] space-y-4 bg-white/50 dark:bg-verse-950/20 backdrop-blur-xl">
                <h4 class="text-[10px] font-black uppercase tracking-widest text-gray-400">Note</h4>
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
