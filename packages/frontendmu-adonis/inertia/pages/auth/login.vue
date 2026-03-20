<script setup lang="ts">
import { Head, Link, usePage } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import { computed } from 'vue'

const page = usePage<Data.SharedProps>()
const errors = computed(() => page.props.errors as Record<string, string> | undefined)
</script>

<template>
  <Head title="Login" />
  <main class="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 md:p-8">
    <div class="w-full max-w-sm">
      <div
        class="bg-white dark:bg-verse-950 border border-gray-300 dark:border-verse-900 rounded-lg p-8"
      >
        <div class="mb-6">
          <h1 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Sign in
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Continue to frontend.mu</p>
        </div>

        <div
          v-if="errors?.login"
          role="alert"
          class="mb-4 px-3 py-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-900 rounded-md"
        >
          {{ errors.login }}
        </div>

        <!-- Google Sign In -->
        <Link
          href="/auth/google"
          class="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white dark:bg-verse-900 border border-gray-300 dark:border-verse-800 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-verse-800 transition-colors"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Link>

        <div class="relative my-5">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-verse-900"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-2 bg-white dark:bg-verse-950 text-gray-400">or</span>
          </div>
        </div>

        <form method="POST" action="/login" class="space-y-4">
          <input type="hidden" name="_csrf" :value="$page.props.auth.csrfToken" />

          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              class="w-full px-3 py-2 bg-white dark:bg-verse-900 border border-gray-300 dark:border-verse-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-verse-500/40 focus:border-verse-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              class="w-full px-3 py-2 bg-white dark:bg-verse-900 border border-gray-300 dark:border-verse-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-verse-500/40 focus:border-verse-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            class="w-full py-2.5 bg-verse-600 text-white text-sm font-medium rounded-md hover:bg-verse-700 transition-colors"
          >
            Sign in
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?
          <Link
            href="/register"
            class="text-verse-500 hover:text-verse-600 dark:text-verse-400 dark:hover:text-verse-300 ml-1 font-medium"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  </main>
</template>
