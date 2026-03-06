<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Register" />
  <main class="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 md:p-8">
      <div class="relative z-10 w-full max-w-sm">
        <div class="bg-white dark:bg-verse-950/40 backdrop-blur-xl border border-gray-100 dark:border-verse-800 rounded-xl p-8 shadow-sm">
          <div class="space-y-2 mb-8">
            <h1 class="text-2xl font-display tracking-tight dark:text-gray-100">
              Create account
            </h1>
            <p class="text-sm text-gray-400">Join the community</p>
          </div>

          <form method="POST" action="/register" class="space-y-4">
            <input type="hidden" name="_csrf" :value="$page.props.auth.csrfToken" />

            <div class="space-y-1">
              <label for="name" class="text-xs font-medium text-gray-400">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                minlength="2"
                class="w-full px-4 py-2 bg-gray-50/50 dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-verse-500 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div class="space-y-1">
              <label for="email" class="text-xs font-medium text-gray-400">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                class="w-full px-4 py-2 bg-gray-50/50 dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-verse-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div class="space-y-1">
              <label for="password" class="text-xs font-medium text-gray-400">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minlength="8"
                class="w-full px-4 py-2 bg-gray-50/50 dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-verse-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div class="space-y-1">
              <label for="confirmPassword" class="text-xs font-medium text-gray-400">
                Confirm
              </label>
              <input
                id="confirmPassword"
                name="confirm_password"
                type="password"
                required
                class="w-full px-4 py-2 bg-gray-50/50 dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-verse-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              class="w-full py-3 bg-verse-600 text-white font-bold text-sm rounded-lg hover:bg-verse-700 active:scale-[0.98] transition-all mt-2"
            >
              Sign Up
            </button>
          </form>

          <p class="mt-8 text-center text-xs text-gray-400">
            Already registered?
            <Link href="/login" class="text-verse-500 dark:text-verse-400 hover:underline underline-offset-4 ml-1 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
</template>
