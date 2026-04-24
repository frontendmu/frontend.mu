<script setup lang="ts">
import { Head, Link, usePage } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import { computed } from 'vue'

const page = usePage<Data.SharedProps>()
const errors = computed(() => page.props.errors as Record<string, string> | undefined)
</script>

<template>
  <Head title="Register" />
  <main class="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 md:p-8">
    <div class="w-full max-w-sm">
      <div
        class="bg-white dark:bg-verse-950 border border-gray-300 dark:border-verse-900 rounded-lg p-8"
      >
        <div class="mb-6">
          <h1 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Create account
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Join the community</p>
        </div>

        <div
          v-if="errors && Object.keys(errors).length"
          role="alert"
          class="mb-4 px-3 py-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-900 rounded-md"
        >
          {{ errors.form || errors.email || Object.values(errors)[0] }}
        </div>

        <form method="POST" action="/register" class="space-y-4">
          <input type="hidden" name="_csrf" :value="$page.props.auth.csrfToken" />

          <div>
            <label
              for="name"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minlength="2"
              class="w-full px-3 py-2 bg-white dark:bg-verse-900 border border-gray-300 dark:border-verse-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-verse-500/40 focus:border-verse-500 transition-colors"
              placeholder="John Doe"
            />
          </div>

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
              minlength="8"
              class="w-full px-3 py-2 bg-white dark:bg-verse-900 border border-gray-300 dark:border-verse-800 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-verse-500/40 focus:border-verse-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label
              for="confirmPassword"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirm_password"
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
            Sign up
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already registered?
          <Link
            href="/login"
            class="text-verse-500 hover:text-verse-600 dark:text-verse-300 dark:hover:text-verse-200 ml-1 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  </main>
</template>
