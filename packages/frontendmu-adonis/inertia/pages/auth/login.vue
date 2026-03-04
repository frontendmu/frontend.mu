<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
</script>

<template>
  <Head title="Login" />
  <DefaultLayout>
    <main class="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 md:p-8">
      <div class="relative z-10 w-full max-w-[320px]">
        <div class="bg-white dark:bg-verse-950/40 backdrop-blur-xl border border-gray-100 dark:border-verse-800 rounded-2xl squircle p-6 shadow-sm">
          <div class="space-y-3 mb-8 text-center">
            <h1 class="text-2xl font-black tracking-tighter dark:text-gray-100 leading-tight">
              Welcome back<span class="text-verse-500">.</span>
            </h1>
          </div>

          <!-- Google Sign In -->
          <a
            href="/auth/google"
            class="group w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-lg hover:border-verse-500 transition-all duration-300"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="font-black uppercase tracking-widest text-[9px] text-gray-900 dark:text-gray-100">Continue with Google</span>
          </a>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-50 dark:border-verse-900"></div>
            </div>
            <div class="relative flex justify-center text-[9px]">
              <span class="px-3 bg-white dark:bg-[#020617] text-gray-500 font-mono uppercase tracking-[0.3em]">OR</span>
            </div>
          </div>

          <form method="POST" action="/login" class="space-y-4">
            <input type="hidden" name="_csrf" :value="$page.props.auth.csrfToken" />

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
                class="w-full px-4 py-2 bg-gray-50/50 dark:bg-verse-900/40 border border-gray-100 dark:border-verse-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-verse-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              class="w-full py-2.5 bg-verse-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-lg hover:bg-verse-700 active:scale-[0.98] transition-all mt-2"
            >
              Sign In
            </button>
          </form>

          <p class="mt-8 text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            Don't have an account?
            <Link href="/register" class="text-verse-500 dark:text-verse-400 hover:underline decoration-2 underline-offset-4 ml-1">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </main>
  </DefaultLayout>
</template>
