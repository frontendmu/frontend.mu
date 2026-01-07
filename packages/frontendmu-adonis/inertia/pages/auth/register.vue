<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
</script>

<template>
  <Head title="Register" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20 max-w-md mx-auto">
        <BaseHeading :level="1" class="mb-6">Create Account</BaseHeading>

        <form method="POST" action="/register" class="space-y-6">
          <input type="hidden" name="_csrf" :value="$page.props.auth.csrfToken" />

          <div>
            <label for="name" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minlength="2"
              class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
          </div>

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
              minlength="8"
              class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
            <p class="mt-1 text-sm text-verse-500 dark:text-verse-400">
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirm_password"
              type="password"
              required
              class="w-full px-4 py-2 border border-verse-200 dark:border-verse-700 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            class="w-full px-6 py-3 bg-verse-600 hover:bg-verse-700 text-white font-medium rounded-lg transition-colors"
          >
            Create Account
          </button>
        </form>

        <p class="mt-6 text-center text-verse-600 dark:text-verse-400">
          Already have an account?
          <a href="/login" class="text-verse-600 dark:text-verse-400 hover:text-verse-800 dark:hover:text-verse-200 font-medium">
            Login
          </a>
        </p>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
