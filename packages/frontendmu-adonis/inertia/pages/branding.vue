<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
</script>

<template>
  <Head title="Branding" />
  <DefaultLayout>
    <main class="relative min-h-screen pt-40 pb-24">
      <div class="contain relative z-10">
        <!-- Page Header -->
        <div class="max-w-4xl mb-24 space-y-6 text-center lg:text-left">
          <div class="inline-flex items-center gap-3">
            <span class="h-1 w-12 bg-verse-500 rounded-full"></span>
            <span class="text-sm font-black uppercase tracking-[0.4em] text-verse-500">Visual Identity</span>
          </div>
          
          <h1 class="text-6xl md:text-8xl font-black tracking-tighter dark:text-white leading-[0.9]">
            The Brand <br />
            <span class="text-verse-600 dark:text-verse-400">Kit.</span>
          </h1>
          
          <p class="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
            Assets and guidelines for representing the Frontend Coders Mauritius community.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <!-- Left Column -->
          <div class="lg:col-span-8 space-y-24">
            <!-- Logos -->
            <section class="space-y-12">
              <div class="flex items-center gap-4">
                <h2 class="text-2xl font-black uppercase tracking-[0.2em] text-verse-500">Core Logos</h2>
                <div class="h-px flex-1 bg-gradient-to-r from-verse-500/20 to-transparent"></div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="p-12 bg-white dark:bg-verse-950/40 border border-verse-100 dark:border-verse-800 rounded-[3rem] flex items-center justify-center group transition-all hover:border-verse-500">
                  <div class="w-32 h-32 text-verse-600 dark:text-verse-400 transition-transform duration-500 group-hover:scale-110">
                    <svg width="100%" viewBox="0 0 874 875" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M859.531 437.446C859.531 670.711 670.358 859.812 436.996 859.812C203.635 859.812 14.461 670.711 14.461 437.446C14.461 204.182 203.635 15.0801 436.996 15.0801C670.358 15.0801 859.531 204.182 859.531 437.446Z" stroke="currentColor" stroke-width="30"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M366.465 176.049H457.133L344.931 440.435L344.907 440.492L242.953 682.966H152.312L366.465 176.049ZM510.002 230.04L721.787 441.878L339.608 633.855L388.574 517.196L586.487 423.5L475.465 310.902L510.002 230.04Z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                <div class="p-12 bg-gray-900 dark:bg-black border border-verse-800 rounded-[3rem] flex items-center justify-center group transition-all hover:border-verse-500">
                  <div class="w-32 h-32 text-white transition-transform duration-500 group-hover:scale-110">
                    <svg width="100%" viewBox="0 0 874 875" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M859.531 437.446C859.531 670.711 670.358 859.812 436.996 859.812C203.635 859.812 14.461 670.711 14.461 437.446C14.461 204.182 203.635 15.0801 436.996 15.0801C670.358 15.0801 859.531 204.182 859.531 437.446Z" stroke="currentColor" stroke-width="30"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M366.465 176.049H457.133L344.931 440.435L344.907 440.492L242.953 682.966H152.312L366.465 176.049ZM510.002 230.04L721.787 441.878L339.608 633.855L388.574 517.196L586.487 423.5L475.465 310.902L510.002 230.04Z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>
            </section>

            <!-- Color Palette -->
            <section class="space-y-12">
              <div class="flex items-center gap-4">
                <h2 class="text-2xl font-black uppercase tracking-[0.2em] text-verse-500">Color Palette</h2>
                <div class="h-px flex-1 bg-gradient-to-r from-verse-500/20 to-transparent"></div>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-5 gap-8">
                <div class="space-y-4">
                  <div class="aspect-square bg-verse-500 rounded-3xl shadow-xl shadow-verse-500/20 transition-transform hover:scale-105"></div>
                  <p class="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Primary</p>
                  <p class="text-xs font-mono text-gray-400">#1e3a8a</p>
                </div>
                <div class="space-y-4">
                  <div class="aspect-square bg-verse-700 rounded-3xl shadow-xl shadow-verse-700/20 transition-transform hover:scale-105"></div>
                  <p class="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Deep</p>
                  <p class="text-xs font-mono text-gray-400">#0f172a</p>
                </div>
                <div class="space-y-4">
                  <div class="aspect-square bg-verse-950 rounded-3xl shadow-xl shadow-black/20 transition-transform hover:scale-105 border border-verse-800"></div>
                  <p class="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Obsidian</p>
                  <p class="text-xs font-mono text-gray-400">#020617</p>
                </div>
                <div class="space-y-4">
                  <div class="aspect-square bg-verse-300 rounded-3xl shadow-xl shadow-verse-300/20 transition-transform hover:scale-105"></div>
                  <p class="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Steel</p>
                  <p class="text-xs font-mono text-gray-400">#94a3b8</p>
                </div>
                <div class="space-y-4">
                  <div class="aspect-square bg-verse-100 rounded-3xl shadow-xl shadow-verse-100/20 transition-transform hover:scale-105"></div>
                  <p class="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Mist</p>
                  <p class="text-xs font-mono text-gray-400">#f1f5f9</p>
                </div>
              </div>
            </section>
          </div>

          <!-- Sidebar -->
          <aside class="lg:col-span-4 space-y-8">
            <div class="sticky top-32 space-y-8">
              <div class="p-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[3rem] shadow-2xl space-y-6">
                <h3 class="text-2xl font-black tracking-tight">Need Assets?</h3>
                <p class="font-medium opacity-70 leading-relaxed">
                  We're working on a full brand kit. In the meantime, you can inspect the SVG logos on this page for high-fidelity vector versions.
                </p>
                <button disabled class="block w-full py-4 border-2 border-white/20 dark:border-gray-200 text-center font-black uppercase tracking-widest rounded-2xl opacity-50 cursor-not-allowed">
                  Download Kit (Soon)
                </button>
              </div>

              <div class="p-8 border border-verse-100 dark:border-verse-800 rounded-[3rem] space-y-6 bg-white/50 dark:bg-verse-950/20 backdrop-blur-xl">
                <h4 class="text-xs font-black uppercase tracking-widest text-gray-400">Usage Rules</h4>
                <ul class="space-y-4 text-xs font-bold text-gray-500 leading-relaxed italic">
                  <li>• Maintain generous whitespace around the logo.</li>
                  <li>• Do not distort or stretch the icon.</li>
                  <li>• Ensure high contrast with the background.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </DefaultLayout>
</template>
