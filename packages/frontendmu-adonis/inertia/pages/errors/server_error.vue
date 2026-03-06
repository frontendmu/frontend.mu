<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Server Error" />
  <main class="relative min-h-screen flex items-center justify-center">
    <div class="text-center space-y-8">
      <h1 class="text-8xl font-black tracking-tighter text-verse-500">500</h1>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Server Error</h2>
      <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        Something went wrong on our end. Please try again later.
      </p>
      <Link
        href="/"
        class="inline-flex items-center gap-4 px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all"
      >
        Go Home
      </Link>
    </div>
  </main>
</template>
