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

function handleLogout() {
  router.post('/logout')
}

const links: TMenu = {
  about: {
    title: 'About',
    href: '/about',
    class: 'hidden md:block',
    children: [
      {
        title: 'History',
        href: '/history',
        class: '',
      },
      {
        title: 'Contribute',
        href: '/contribute',
        class: '',
      },
      {
        title: 'Code of conduct',
        href: '/code-of-conduct',
        class: '',
      },
      {
        title: 'Coding Guidelines',
        href: '/coding-guidelines',
        class: '',
      },
      {
        title: 'WhatsApp',
        href: WHATSAPP_URL,
        class: '',
      },
      {
        title: 'Instagram',
        href: INSTAGRAM_URL,
        class: '',
      },
      {
        title: 'LinkedIn',
        href: LINKEDIN_URL,
        class: '',
      },
      {
        title: 'Join Discord',
        href: DISCORD_URL,
        class: '',
      },
      {
        title: 'GitHub',
        href: GITHUB_URL,
        class: '',
      },
      {
        title: 'Twitter',
        href: TWITTER_URL,
        class: '',
      },
      {
        title: 'Advent Calendar',
        href: 'https://advent.coders.mu',
        class: 'external-link',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    ],
  },
  meetups: {
    title: 'Meetups',
    href: '/meetups',
  },
  community: {
    title: 'Community',
    href: '/community',
  },
  team: {
    title: 'Team',
    href: '/team',
    class: 'hidden md:block',
  },
  sponsors: {
    title: 'Sponsors',
    href: '/sponsors',
    class: 'hidden md:block',
    children: [
      {
        title: 'Our Sponsors',
        href: '/sponsors',
        class: '',
      },
      {
        title: 'Sponsor Us',
        href: '/sponsor-us',
        class: '',
      },
    ],
  },
}

const authLinks = computed(() => {
  if (isAuthenticated.value && user.value) {
    return [
      {
        title: 'Profile',
        href: '/profile',
        class: '',
      },
    ]
  }
  return [
    {
      title: 'Login',
      href: '/login',
      class: '',
    },
    {
      title: 'Register',
      href: '/register',
      class: '',
    },
  ]
})

function toggleHeader() {
  const headerElement = document.querySelector('.menu-wrapper') as HTMLElement

  let headerOffset = 0
  let previousScrollPosition = 0

  if (headerElement) {
    const handleScroll = () => {
      window.requestAnimationFrame(() => {
        const headerHeight = headerElement.clientHeight

        const currentScrollPosition = window.scrollY || document.documentElement.scrollTop

        const distance = currentScrollPosition - previousScrollPosition

        const nextHeaderOffset = Math.min(Math.max(headerOffset + distance, 0), headerHeight)

        if (currentScrollPosition >= headerHeight && nextHeaderOffset !== headerOffset) {
          headerOffset = nextHeaderOffset
          headerElement.style.transform = `translateY(-${headerOffset}px)`
        }

        if (currentScrollPosition > headerHeight) {
          headerElement.classList.add(
            'intersect',
            'shadow-sm',
            'dark:bg-verse-900/50',
            'bg-verse-50/50'
          )
        } else {
          headerElement.classList.remove(
            'intersect',
            'shadow-sm',
            'dark:bg-verse-900/50',
            'bg-verse-50/50'
          )
        }

        previousScrollPosition = currentScrollPosition
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
  }
}

function handleRightClick(event: MouseEvent) {
  event.preventDefault()
  // For Inertia, we'll use window.location for now
  window.location.href = '/branding'
}

onMounted(toggleHeader)
</script>

<template>
  <div class="menu-wrapper w-full flex sticky top-0 z-30 h-20 items-center">
    <div class="menu theme-light w-full">
      <div class="flex justify-between items-center contain">
        <div class="flex">
          <Link
            href="/"
            class="flex gap-2 text-verse-500 dark:text-verse-200"
            title="coders.mu"
            @contextmenu="handleRightClick"
          >
            <Logo class="w-10" />
            <span
              class="hidden text-lg font-bold leading-none tracking-tighter md:text-3xl md:block"
            >
              coders.mu
            </span>
          </Link>
        </div>
        <nav>
          <ul
            class="nav-links text-sm md:text-sm lg:text-base flex md:gap-4 gap-2 font-medium font-heading"
          >
            <template v-for="item of Object.keys(links)" :key="item">
              <MenuItem :links="links" :item="item" />
            </template>
          </ul>
        </nav>
        <div class="flex items-center md:gap-2 gap-1">
          <div class="flex items-center justify-center p-2">
            <slot name="dock-right" />
          </div>
          <ul class="flex items-center md:gap-1 gap-0 text-sm md:text-sm lg:text-base font-medium font-heading">
            <template v-for="link in authLinks" :key="link.href">
              <li class="hover:bg-white/10 rounded-md text-verse-700 dark:text-verse-300 hover:dark:text-white">
                <Link
                  :href="link.href"
                  class="flex items-center"
                >
                  <span class="relative z-20 p-2">{{ link.title }}</span>
                </Link>
              </li>
            </template>
            <li
              v-if="isAuthenticated"
              class="hover:bg-white/10 rounded-md text-verse-700 dark:text-verse-300 hover:dark:text-white"
            >
              <button
                @click="handleLogout"
                class="flex items-center"
              >
                <span class="relative z-20 p-2">Logout</span>
              </button>
            </li>
          </ul>
        </div>
        <div
          class="absolute right-10 top-10 rounded-lg px-4 bg-white/20 shadow-[0px_0px_2px_var(--color-verse-500)]"
        >
          <slot name="dock-right-bottom" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference 'tailwindcss';

.menu-wrapper {
  transition: all 0.2s ease-out;
}

.menu {
  transition: all 0.2s ease-out;
}

.intersect {
  box-shadow: 0px 0px 2px var(--color-verse-500);
  backdrop-filter: brightness(1) blur(20px);
}

.contain {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
</style>
