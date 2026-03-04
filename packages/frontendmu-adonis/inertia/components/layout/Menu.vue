<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { Link, usePage, router } from '@inertiajs/vue3'
import Logo from '~/components/layout/Logo.vue'
import MenuItem from '~/components/layout/MenuItem.vue'
import {
  DISCORD_URL,
  GITHUB_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  TWITTER_URL,
  WHATSAPP_URL,
} from '~/constants'
import type { TMenu } from '~/types'

const page = usePage()
const isAuthenticated = computed(() => page.props.auth.isAuthenticated)
const user = computed(() => page.props.auth.user)

const isAdmin = computed(() => {
  if (!user.value) return false
  const role = (user.value as any).role
  return role === 'organizer' || role === 'superadmin'
})

function handleLogout() {
  router.post('/logout')
}

const links: TMenu = {
  about: {
    title: 'About',
    href: '/about',
    class: 'hidden lg:block',
    children: [
      { title: 'History', href: '/history' },
      { title: 'Contribute', href: '/contribute' },
      { title: 'Code of conduct', href: '/code-of-conduct' },
      { title: 'Guidelines', href: '/coding-guidelines' },
      { title: 'Discord', href: DISCORD_URL },
      { title: 'GitHub', href: GITHUB_URL },
    ],
  },
  meetups: { title: 'Meetups', href: '/meetups' },
  community: { title: 'Community', href: '/community' },
  team: { title: 'Team', href: '/team', class: 'hidden md:block' },
  sponsors: { 
    title: 'Sponsors', 
    href: '/sponsors', 
    class: 'hidden md:block',
    children: [
      { title: 'Our Partners', href: '/sponsors' },
      { title: 'Become a Sponsor', href: '/sponsor-us' },
    ]
  },
}

const authLinks = computed(() => {
  if (isAuthenticated.value && user.value) {
    return [{ title: 'Profile', href: '/profile' }]
  }
  return [
    { title: 'Login', href: '/login' },
    { title: 'Register', href: '/register' },
  ]
})

function toggleHeader() {
  const headerElement = document.querySelector('.menu-wrapper') as HTMLElement
  let previousScrollPosition = 0

  if (headerElement) {
    const handleScroll = () => {
      const currentScrollPosition = window.scrollY || document.documentElement.scrollTop
      if (currentScrollPosition > 40) {
        headerElement.classList.add('scrolled')
      } else {
        headerElement.classList.remove('scrolled')
      }
      previousScrollPosition = currentScrollPosition
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
}

onMounted(toggleHeader)
</script>

<template>
  <div class="menu-wrapper fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 transition-all duration-500 ease-expo">
    <div class="menu-inner w-[92%] max-w-5xl bg-white/80 dark:bg-verse-950/60 backdrop-blur-xl border border-gray-100 dark:border-verse-800 rounded-2xl squircle px-4 md:px-6 h-16 flex items-center justify-between shadow-sm">
      
      <!-- Brand -->
      <div class="flex items-center">
        <Link href="/" class="flex items-center gap-2 group">
          <div class="w-9 h-9 flex items-center justify-center rounded-xl bg-verse-500 text-white shadow-lg shadow-verse-500/20 group-hover:scale-110 transition-all duration-500">
            <Logo class="w-5 h-5" />
          </div>
          <span class="hidden sm:block text-lg font-black tracking-tighter dark:text-gray-100 uppercase tracking-[0.1em]">
            coders<span class="text-verse-500">.mu</span>
          </span>
        </Link>
      </div>

      <!-- Navigation -->
      <nav class="hidden md:block">
        <ul class="flex items-center gap-1 lg:gap-2">
          <template v-for="item of Object.keys(links)" :key="item">
            <MenuItem :links="links" :item="item" />
          </template>
        </ul>
      </nav>

      <!-- Right Actions -->
      <div class="flex items-center gap-2 md:gap-4">
        <slot name="dock-right" />
        
        <div class="h-6 w-px bg-gray-100 dark:bg-verse-800"></div>

        <ul class="flex items-center gap-1">
          <li v-if="isAdmin" class="mr-1">
            <Link href="/admin" class="px-3 py-1.5 bg-verse-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-verse-700 transition-colors">
              Admin
            </Link>
          </li>

          <template v-for="link in authLinks" :key="link.href">
            <li>
              <Link :href="link.href" class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-verse-500 dark:hover:text-verse-300 transition-colors">
                {{ link.title }}
              </Link>
            </li>
          </template>

          <li v-if="isAuthenticated">
            <button @click="handleLogout" class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500/70 hover:text-red-500 transition-colors">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference 'tailwindcss';

.menu-wrapper.scrolled {
  @apply pt-2;
}

.menu-wrapper.scrolled .menu-inner {
  @apply max-w-4xl shadow-lg border-gray-200;

  &:where(.dark *, .dark) {
    border-color: var(--color-verse-700);
  }
}

.ease-expo {
  transition-timing-function: cubic-bezier(0.87, 0, 0.13, 1);
}
</style>
