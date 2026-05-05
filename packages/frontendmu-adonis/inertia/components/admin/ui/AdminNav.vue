<script setup lang="ts">
import { computed } from 'vue'
import { Link, usePage } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import { useAuth } from '~/composables/use_auth'

interface NavItem {
  label: string
  href: string
  match: (path: string) => boolean
  icon: string
  superadminOnly?: boolean
}

const page = usePage<Data.SharedProps>()
const { isSuperadmin } = useAuth()

const currentPath = computed(() => {
  const url = page.url ?? ''
  return url.split('?')[0] || '/'
})

const items: NavItem[] = [
  {
    label: 'Overview',
    href: '/admin',
    match: (p) => p === '/admin' || p === '/admin/',
    icon: 'overview',
  },
  {
    label: 'Events',
    href: '/admin/events',
    match: (p) => p.startsWith('/admin/events'),
    icon: 'events',
  },
  {
    label: 'Speakers',
    href: '/admin/speakers',
    match: (p) => p.startsWith('/admin/speakers'),
    icon: 'speakers',
  },
  {
    label: 'Sponsors',
    href: '/admin/sponsors',
    match: (p) => p.startsWith('/admin/sponsors'),
    icon: 'sponsors',
  },
  {
    label: 'Users',
    href: '/admin/users',
    match: (p) => p.startsWith('/admin/users'),
    icon: 'users',
    superadminOnly: true,
  },
]

const visibleItems = computed(() =>
  items.filter((item) => !item.superadminOnly || isSuperadmin.value)
)

const icons: Record<string, string> = {
  overview:
    'M3 12l2-2 4 4 8-8 4 4M3 19h18',
  events:
    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  speakers:
    'M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 21v-2a4 4 0 0 0-3-3.87M17 3.13a4 4 0 0 1 0 7.75',
  sponsors:
    'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  users:
    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M19 3.13a4 4 0 0 1 0 7.75',
}
</script>

<template>
  <nav aria-label="Admin sections" class="w-full">
    <!-- Mobile / tablet: horizontal scroll rail -->
    <div class="lg:hidden -mx-4 px-4 sm:-mx-6 sm:px-6 overflow-x-auto">
      <ul class="flex items-center gap-1.5 min-w-max pb-2">
        <li v-for="item in visibleItems" :key="item.href">
          <Link
            :href="item.href"
            :class="[
              'inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm font-medium transition-colors whitespace-nowrap',
              item.match(currentPath)
                ? 'bg-verse-900 dark:bg-verse-50 border-verse-900 dark:border-verse-50 text-white dark:text-verse-900'
                : 'bg-white dark:bg-verse-900/40 border-verse-200 dark:border-verse-800 text-verse-700 dark:text-verse-200 hover:border-verse-400 dark:hover:border-verse-600',
            ]"
          >
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path :d="icons[item.icon]" />
            </svg>
            <span>{{ item.label }}</span>
          </Link>
        </li>
      </ul>
    </div>

    <!-- Desktop: vertical sidebar -->
    <div class="hidden lg:block">
      <div class="mono-eyebrow mb-4">
        <span>Admin</span>
      </div>
      <ul class="flex flex-col gap-1">
        <li v-for="item in visibleItems" :key="item.href">
          <Link
            :href="item.href"
            :class="[
              'group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              item.match(currentPath)
                ? 'bg-verse-100 dark:bg-verse-800/70 text-verse-900 dark:text-verse-50'
                : 'text-verse-600 dark:text-verse-400 hover:bg-verse-50 dark:hover:bg-verse-900/40 hover:text-verse-900 dark:hover:text-verse-100',
            ]"
          >
            <span
              v-if="item.match(currentPath)"
              class="absolute -left-2 top-2 bottom-2 w-0.5 rounded-full bg-coral-strong"
              aria-hidden="true"
            />
            <svg
              class="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path :d="icons[item.icon]" />
            </svg>
            <span>{{ item.label }}</span>
          </Link>
        </li>
      </ul>
    </div>
  </nav>
</template>
