<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
</script>

<template>
  <Head title="Login" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20 max-w-md mx-auto">
        <BaseHeading :level="1" class="mb-6">Login</BaseHeading>

        <!-- Google Sign In Button -->
        <a
          href="/auth/google"
          class="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-verse-800 border border-verse-200 dark:border-verse-700 hover:bg-verse-50 dark:hover:bg-verse-700 text-verse-900 dark:text-verse-100 font-medium rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
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
        </a>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-verse-200 dark:border-verse-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-verse-900 text-verse-500">or continue with email</span>
          </div>
        </div>

        <form method="POST" action="/login" class="space-y-6">
          <input type="hidden" name="_csrf" :value="$page.props.auth.csrfToken" />

          <div>
            <label for="email" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            class="w-full px-6 py-3 bg-verse-600 hover:bg-verse-700 text-white font-medium rounded-lg transition-colors"
          >
            Login with Email
          </button>
        </form>

        <p class="mt-6 text-center text-verse-600 dark:text-verse-400">
          Don't have an account?
          <a href="/register" class="text-verse-600 dark:text-verse-400 hover:text-verse-800 dark:hover:text-verse-200 font-medium">
            Register
          </a>
        </p>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
