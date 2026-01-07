<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link, usePage } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

interface Stats {
  events: {
    total: number
    published: number
    draft: number
    cancelled: number
  }
  users: number
  speakers: number
  sponsors: number
}

interface Props {
  stats: Stats
}

const props = defineProps<Props>()
const page = usePage()
const user = computed(() => page.props.auth.user as any)
const isSuperadmin = computed(() => user.value?.role === 'superadmin')

// Admin menu items
const menuItems = [
  {
    title: 'Events',
    description: 'Create, edit, and manage meetup events',
    href: '/admin/events',
    icon: 'calendar',
    stats: [
      { label: 'Total', value: props.stats.events.total },
      { label: 'Published', value: props.stats.events.published, color: 'text-green-600 dark:text-green-400' },
      { label: 'Draft', value: props.stats.events.draft, color: 'text-yellow-600 dark:text-yellow-400' },
      { label: 'Cancelled', value: props.stats.events.cancelled, color: 'text-red-600 dark:text-red-400' },
    ],
  },
  {
    title: 'Speakers',
    description: 'Manage speaker profiles and information',
    href: '/admin/speakers',
    icon: 'users',
    stats: [{ label: 'Total', value: props.stats.speakers }],
  },
  {
    title: 'Sponsors',
    description: 'Manage sponsors and partnerships',
    href: '/admin/sponsors',
    icon: 'heart',
    stats: [{ label: 'Total', value: props.stats.sponsors }],
  },
  {
    title: 'Users',
    description: 'Manage user accounts and roles',
    href: '/admin/users',
    icon: 'user',
    stats: [{ label: 'Total', value: props.stats.users }],
    superadminOnly: true,
  },
]

const getIcon = (name: string) => {
  const icons: Record<string, string> = {
    calendar: 'M26 4h-4V2h-2v2h-8V2h-2v2H6c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 22H6V12h20zm0-16H6V6h4v2h2V6h8v2h2V6h4z',
    users: 'M31 30h-2v-5a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v5h-2v-5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5zM24 12a3 3 0 1 1-3 3a3 3 0 0 1 3-3m0-2a5 5 0 1 0 5 5a5 5 0 0 0-5-5M15 22h-2v-5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v5H1v-5a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5zM8 4a3 3 0 1 1-3 3a3 3 0 0 1 3-3m0-2a5 5 0 1 0 5 5a5 5 0 0 0-5-5',
    heart: 'M22.45 6a5.47 5.47 0 0 1 3.91 1.64a5.7 5.7 0 0 1 0 8L16 26.13L5.64 15.64a5.7 5.7 0 0 1 0-8a5.48 5.48 0 0 1 7.82 0l2.54 2.6l2.53-2.58A5.44 5.44 0 0 1 22.45 6m0-2a7.47 7.47 0 0 0-5.34 2.24L16 7.36l-1.11-1.12a7.49 7.49 0 0 0-10.68 0a7.72 7.72 0 0 0 0 10.82L16 29l11.79-11.94a7.72 7.72 0 0 0 0-10.82A7.49 7.49 0 0 0 22.45 4',
    user: 'M16 4a5 5 0 1 1-5 5a5 5 0 0 1 5-5m0-2a7 7 0 1 0 7 7a7 7 0 0 0-7-7m10 28h-2v-5a5 5 0 0 0-5-5h-6a5 5 0 0 0-5 5v5H6v-5a7 7 0 0 1 7-7h6a7 7 0 0 1 7 7z',
  }
  return icons[name] || icons.calendar
}
</script>

<template>
  <Head title="Admin Dashboard" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20">
        <!-- Header -->
        <div class="mb-8">
          <BaseHeading :level="1">Admin Dashboard</BaseHeading>
          <p class="text-verse-600 dark:text-verse-400 mt-2">
            Manage your frontend.mu content and settings.
          </p>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white dark:bg-verse-800/50 rounded-xl border border-verse-200 dark:border-verse-700 p-4">
            <div class="text-2xl font-bold text-verse-900 dark:text-verse-100">{{ stats.events.total }}</div>
            <div class="text-sm text-verse-600 dark:text-verse-400">Total Events</div>
          </div>
          <div class="bg-white dark:bg-verse-800/50 rounded-xl border border-verse-200 dark:border-verse-700 p-4">
            <div class="text-2xl font-bold text-verse-900 dark:text-verse-100">{{ stats.speakers }}</div>
            <div class="text-sm text-verse-600 dark:text-verse-400">Speakers</div>
          </div>
          <div class="bg-white dark:bg-verse-800/50 rounded-xl border border-verse-200 dark:border-verse-700 p-4">
            <div class="text-2xl font-bold text-verse-900 dark:text-verse-100">{{ stats.sponsors }}</div>
            <div class="text-sm text-verse-600 dark:text-verse-400">Sponsors</div>
          </div>
          <div class="bg-white dark:bg-verse-800/50 rounded-xl border border-verse-200 dark:border-verse-700 p-4">
            <div class="text-2xl font-bold text-verse-900 dark:text-verse-100">{{ stats.users }}</div>
            <div class="text-sm text-verse-600 dark:text-verse-400">Users</div>
          </div>
        </div>

        <!-- Admin Menu -->
        <div class="grid md:grid-cols-2 gap-6">
          <template v-for="item in menuItems" :key="item.title">
            <component
              v-if="!item.superadminOnly || isSuperadmin"
              :is="item.disabled ? 'div' : Link"
              :href="item.disabled ? undefined : item.href"
              :class="[
                'block p-6 bg-white dark:bg-verse-800/50 rounded-xl border border-verse-200 dark:border-verse-700 transition-all',
                item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-lg hover:border-verse-300 dark:hover:border-verse-600'
              ]"
            >
              <div class="flex items-start gap-4">
                <!-- Icon -->
                <div class="flex-shrink-0 w-12 h-12 bg-verse-100 dark:bg-verse-700 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-verse-600 dark:text-verse-300" viewBox="0 0 32 32" fill="currentColor">
                    <path :d="getIcon(item.icon)" />
                  </svg>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-lg font-semibold text-verse-900 dark:text-verse-100">
                      {{ item.title }}
                    </h3>
                    <span
                      v-if="item.disabled"
                      class="px-2 py-0.5 text-xs font-medium bg-verse-100 dark:bg-verse-700 text-verse-500 dark:text-verse-400 rounded"
                    >
                      Coming Soon
                    </span>
                    <span
                      v-if="item.superadminOnly"
                      class="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded"
                    >
                      Superadmin
                    </span>
                  </div>
                  <p class="text-sm text-verse-600 dark:text-verse-400 mt-1">
                    {{ item.description }}
                  </p>
                  <!-- Stats -->
                  <div class="flex flex-wrap gap-4 mt-3">
                    <div
                      v-for="stat in item.stats"
                      :key="stat.label"
                      class="text-sm"
                    >
                      <span class="text-verse-500 dark:text-verse-400">{{ stat.label }}:</span>
                      <span :class="stat.color || 'text-verse-900 dark:text-verse-100'" class="font-semibold ml-1">
                        {{ stat.value }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Arrow -->
                <svg
                  v-if="!item.disabled"
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5 text-verse-400 dark:text-verse-500 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </component>
          </template>
        </div>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
