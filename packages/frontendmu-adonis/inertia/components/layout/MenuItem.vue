<script setup lang="ts">
import { computed } from 'vue'
import { Link, usePage } from '@inertiajs/vue3'
import type { TMenu } from '~/types'

interface Props {
  links: TMenu
  item: string
}

const props = defineProps<Props>()

const page = usePage()
const currentPath = computed(() => page.url)

const isActive = computed(() => {
  const href = props.links[props.item].href
  if (href === '/') return currentPath.value === '/'
  return currentPath.value.startsWith(href)
})
</script>

<template>
  <li class="relative group/nav">
    <Link
      v-if="!links[item].href.includes('https')"
      :href="links[item].href"
      class="flex items-center px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300"
      :class="[
        isActive
          ? 'text-verse-500 dark:text-verse-300 bg-verse-500/10 dark:bg-verse-500/15'
          : 'text-gray-600 dark:text-gray-400 hover:text-verse-500 dark:hover:text-verse-300 hover:bg-gray-50 dark:hover:bg-verse-900/40'
      ]"
    >
      {{ links[item].title }}
      <svg v-if="links[item].children" class="w-3.5 h-3.5 ml-1 opacity-50 group-hover/nav:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </Link>

    <a
      v-else
      :href="links[item].href"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center px-3 py-2 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-verse-500 dark:hover:text-verse-300 hover:bg-gray-50 dark:hover:bg-verse-900/40 transition-all duration-300"
    >
      {{ links[item].title }}
      <svg class="w-3 h-3 ml-1.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>

    <!-- Dropdown -->
    <div
      v-if="links[item].children"
      class="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto transition-all duration-300 z-50 min-w-[200px]"
    >
      <div class="bg-white dark:bg-verse-950 border border-gray-100 dark:border-verse-800 rounded-2xl squircle shadow-xl shadow-black/5 p-2 overflow-hidden">
        <ul class="space-y-1">
          <li v-for="submenu in links[item].children" :key="submenu.href">
            <Link
              v-if="!submenu.href.includes('https')"
              :href="submenu.href"
              class="flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-verse-500 hover:bg-verse-50 dark:hover:bg-verse-900/60 transition-all"
            >
              {{ submenu.title }}
            </Link>
            <a
              v-else
              :href="submenu.href"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-verse-500 hover:bg-verse-50 dark:hover:bg-verse-900/60 transition-all"
            >
              {{ submenu.title }}
              <svg class="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </li>
</template>
