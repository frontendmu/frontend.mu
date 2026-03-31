<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { Link } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Not Found" />
  <main class="relative min-h-screen flex items-center justify-center">
    <div class="text-center space-y-8">
      <h1 class="text-8xl font-display tracking-tight text-verse-500">404</h1>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Page Not Found</h2>
      <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        class="inline-flex items-center gap-3 px-8 py-3.5 bg-verse-600 text-white rounded-xl font-bold text-sm hover:bg-verse-700 transition-colors"
      >
        Go Home
      </Link>
    </div>
  </main>
</template>
