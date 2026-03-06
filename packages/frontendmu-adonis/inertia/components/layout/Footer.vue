<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import Logo from '~/components/layout/Logo.vue'
const today = new Date()
</script>

<template>
  <footer class="relative bg-gray-900 dark:bg-black text-white py-24 overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
      <span class="text-[20vw] font-black absolute -bottom-10 -left-10">CODERS</span>
    </div>

    <div class="contain relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
        <!-- Logo & Mission -->
        <div class="md:col-span-5 space-y-8">
          <Link href="/" class="inline-flex items-center gap-3 group">
            <Logo class="w-12 h-12 text-verse-500 dark:text-verse-400 transition-transform group-hover:rotate-12" />
            <span class="text-2xl font-black tracking-tighter uppercase tracking-[0.2em]">coders.mu</span>
          </Link>
          <p class="text-lg text-gray-400 font-medium leading-relaxed max-w-sm">
            Empowering the Mauritian developer ecosystem through knowledge sharing, networking, and high-impact collaboration.
          </p>
        </div>

        <!-- Links Grid -->
        <div class="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
          <div class="space-y-6">
            <h4 class="text-xs font-black uppercase tracking-widest text-verse-500">Community</h4>
            <ul class="space-y-4 text-sm font-bold text-gray-400">
              <li><Link href="/meetups" class="hover:text-white transition-colors">Meetups</Link></li>
              <li><Link href="/speakers" class="hover:text-white transition-colors">Speakers</Link></li>
              <li><Link href="/team" class="hover:text-white transition-colors">Team</Link></li>
              <li><Link href="/community" class="hover:text-white transition-colors">Connect</Link></li>
            </ul>
          </div>

          <div class="space-y-6">
            <h4 class="text-xs font-black uppercase tracking-widest text-verse-500">Involvement</h4>
            <ul class="space-y-4 text-sm font-bold text-gray-400">
              <li><Link href="/contribute" class="hover:text-white transition-colors">Contribute</Link></li>
              <li><Link href="/sponsors" class="hover:text-white transition-colors">Our Partners</Link></li>
              <li><Link href="/sponsor-us" class="hover:text-white transition-colors">Become a Sponsor</Link></li>
              <li><Link href="/branding" class="hover:text-white transition-colors">Brand Kit</Link></li>
            </ul>
          </div>

          <div class="space-y-6 col-span-2 md:col-span-1">
            <h4 class="text-xs font-black uppercase tracking-widest text-verse-500">Legal</h4>
            <ul class="space-y-4 text-sm font-bold text-gray-400">
              <li><Link href="/code-of-conduct" class="hover:text-white transition-colors">Code of Conduct</Link></li>
              <li><Link href="/coding-guidelines" class="hover:text-white transition-colors">Guidelines</Link></li>
              <li><Link href="/about" class="hover:text-white transition-colors">History</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">
          © 2016 — {{ today.getFullYear() }} Frontend Coders Mauritius
        </p>
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">Building in Public</p>
        </div>
      </div>
    </div>
  </footer>
</template>
