<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link, usePage } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import AdminShell from '~/components/admin/ui/AdminShell.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminStatGrid from '~/components/admin/ui/AdminStatGrid.vue'
import AdminBadge from '~/components/admin/ui/AdminBadge.vue'

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
const page = usePage<Data.SharedProps>()
const user = computed(() => page.props.auth.user)
const isSuperadmin = computed(
  () => user.value?.roles.some((role) => role.name === 'superadmin') ?? false
)

const overviewStats = computed(() => [
  { label: 'Events', value: props.stats.events.total },
  { label: 'Speakers', value: props.stats.speakers },
  { label: 'Sponsors', value: props.stats.sponsors },
  { label: 'Users', value: props.stats.users },
])

interface Section {
  title: string
  href: string
  description: string
  stats: { label: string; value: number; tone?: 'success' | 'warning' | 'danger' | 'default' }[]
  icon: string
  superadminOnly?: boolean
  primaryAction?: { label: string; href: string }
}

const sections = computed<Section[]>(() => [
  {
    title: 'Events',
    href: '/admin/events',
    description: 'Plan meetups, manage RSVPs and run the event timeline.',
    stats: [
      { label: 'Published', value: props.stats.events.published, tone: 'success' },
      { label: 'Draft', value: props.stats.events.draft, tone: 'warning' },
      { label: 'Cancelled', value: props.stats.events.cancelled, tone: 'danger' },
    ],
    icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    primaryAction: { label: 'New event', href: '/admin/events/create' },
  },
  {
    title: 'Speakers',
    href: '/admin/speakers',
    description: 'Curate speakers, bios and link them to upcoming sessions.',
    stats: [{ label: 'In roster', value: props.stats.speakers }],
    icon: 'M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    primaryAction: { label: 'Add speaker', href: '/admin/speakers/create' },
  },
  {
    title: 'Sponsors',
    href: '/admin/sponsors',
    description: 'Track sponsors, partnerships and event-level perks.',
    stats: [{ label: 'On record', value: props.stats.sponsors }],
    icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    primaryAction: { label: 'Add sponsor', href: '/admin/sponsors/create' },
  },
  {
    title: 'Users',
    href: '/admin/users',
    description: 'Roles, permissions and account management for the community.',
    stats: [{ label: 'Total', value: props.stats.users }],
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    superadminOnly: true,
  },
])

const visibleSections = computed(() =>
  sections.value.filter((s) => !s.superadminOnly || isSuperadmin.value)
)

const toneClasses: Record<NonNullable<Section['stats'][number]['tone']>, string> = {
  default: 'text-verse-900 dark:text-verse-100',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400',
}
</script>

<template>
  <Head title="Admin" />
  <AdminShell
    title="Admin"
    :description="`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}. Here’s what’s happening across frontend.mu.`"
  >
    <section class="mb-8">
      <AdminStatGrid :stats="overviewStats" />
    </section>

    <section>
      <div class="mb-3 flex items-baseline justify-between">
        <h2 class="font-display text-xl text-verse-900 dark:text-verse-50 tracking-tight">
          Manage
        </h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminCard
          v-for="section in visibleSections"
          :key="section.title"
          interactive
          padded
        >
          <div class="flex items-start gap-4">
            <div
              class="shrink-0 w-11 h-11 rounded-2xl bg-verse-100 dark:bg-verse-800 flex items-center justify-center text-verse-600 dark:text-verse-300"
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path :d="section.icon" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <Link
                  :href="section.href"
                  class="text-base font-semibold text-verse-900 dark:text-verse-50 hover:underline decoration-coral-strong decoration-2 underline-offset-4"
                >
                  {{ section.title }}
                </Link>
                <AdminBadge v-if="section.superadminOnly" tone="danger">Superadmin</AdminBadge>
              </div>
              <p class="text-sm text-verse-500 dark:text-verse-400 mt-1">
                {{ section.description }}
              </p>
              <div
                v-if="section.stats.length"
                class="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1"
              >
                <div v-for="stat in section.stats" :key="stat.label" class="flex items-baseline gap-1.5">
                  <span
                    :class="['text-sm font-semibold tabular-nums', toneClasses[stat.tone ?? 'default']]"
                  >
                    {{ stat.value }}
                  </span>
                  <span class="text-xs text-verse-500 dark:text-verse-400 font-mono uppercase tracking-wide">
                    {{ stat.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <Link
              :href="section.href"
              class="inline-flex items-center gap-1.5 text-sm font-medium text-verse-700 dark:text-verse-200 hover:text-verse-900 dark:hover:text-white"
            >
              View {{ section.title.toLowerCase() }}
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link
              v-if="section.primaryAction"
              :href="section.primaryAction.href"
              class="text-xs font-medium text-coral-deep dark:text-coral-strong hover:underline"
            >
              {{ section.primaryAction.label }}
            </Link>
          </template>
        </AdminCard>
      </div>
    </section>
  </AdminShell>
</template>
