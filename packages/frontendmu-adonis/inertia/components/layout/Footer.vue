<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import Logo from '~/components/layout/Logo.vue'
import { GITHUB_URL } from '~/constants'
const today = new Date()
</script>

<template>
  <footer class="relative bg-gray-900 dark:bg-black text-white pt-16 pb-10 overflow-hidden">
    <div class="contain relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        <!-- Logo & Mission -->
        <div class="md:col-span-4 space-y-5">
          <Link href="/" class="inline-flex items-center gap-2.5 group">
            <Logo class="w-8 h-8 text-verse-500 dark:text-verse-400" />
            <span class="text-base font-bold tracking-tight">coders.mu</span>
          </Link>
          <p class="text-sm text-gray-300 leading-relaxed max-w-xs">
            Inspire people about technology
          </p>
        </div>

        <!-- Links Grid -->
        <div class="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
          <div class="space-y-4">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-300">Community</h4>
            <ul class="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/meetups" class="hover:text-white transition-colors">Meetups</Link></li>
              <li><Link href="/speakers" class="hover:text-white transition-colors">Speakers</Link></li>
              <li><Link href="/team" class="hover:text-white transition-colors">Team</Link></li>
              <li><Link href="/community" class="hover:text-white transition-colors">Connect</Link></li>
            </ul>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-300">Involvement</h4>
            <ul class="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/contribute" class="hover:text-white transition-colors">Contribute</Link></li>
              <li><Link href="/api-docs" class="hover:text-white transition-colors">API</Link></li>
              <li><Link href="/sponsors" class="hover:text-white transition-colors">Partners</Link></li>
              <li><Link href="/sponsor-us" class="hover:text-white transition-colors">Sponsor Us</Link></li>
              <li><Link href="/branding" class="hover:text-white transition-colors">Brand Kit</Link></li>
            </ul>
          </div>

          <div class="space-y-4 col-span-2 md:col-span-1">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-300">Resources</h4>
            <ul class="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/code-of-conduct" class="hover:text-white transition-colors">Code of Conduct</Link></li>
              <li><Link href="/coding-guidelines" class="hover:text-white transition-colors">Guidelines</Link></li>
              <li><Link href="/about" class="hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-xs text-gray-400">
          &copy; 2016–{{ today.getFullYear() }} Frontend Coders Mauritius
        </p>
        <p class="text-xs text-gray-400">
          Open source on <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer" class="text-white underline hover:text-gray-200 transition-colors">GitHub</a>
        </p>
      </div>
    </div>
  </footer>
</template>
