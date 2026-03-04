<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Register" />
  <main class="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 md:p-8">
      <div class="relative z-10 w-full max-w-[320px]">
        <div class="bg-white dark:bg-verse-950/40 backdrop-blur-xl border border-gray-100 dark:border-verse-800 rounded-2xl squircle p-6 shadow-sm">
          <div class="space-y-3 mb-8 text-center">
            <h1 class="text-2xl font-black tracking-tighter dark:text-gray-100 leading-none">
              Create account<span class="text-verse-500">.</span>
            </h1>
          </div>

          <form method="POST" action="/register" class="space-y-4">
            <input type="hidden" name="_csrf" :value="$page.props.auth.csrfToken" />

            <div class="space-y-1">
              <label for="name" class="text-[9px] font-mono uppercase tracking-widest text-gray-400 ml-1">
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
              <label for="email" class="text-[9px] font-mono uppercase tracking-widest text-gray-400 ml-1">
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
              <label for="password" class="text-[9px] font-mono uppercase tracking-widest text-gray-400 ml-1">
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
              <label for="confirmPassword" class="text-[9px] font-mono uppercase tracking-widest text-gray-400 ml-1">
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
              class="w-full py-2.5 bg-verse-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-lg hover:bg-verse-700 active:scale-[0.98] transition-all mt-2"
            >
              Sign Up
            </button>
          </form>

          <p class="mt-8 text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            Already registered?
            <Link href="/login" class="text-verse-500 dark:text-verse-400 hover:underline decoration-2 underline-offset-4 ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
</template>
