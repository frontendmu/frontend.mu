<script setup lang="ts">
import { computed, ref } from 'vue'
import { Head } from '@inertiajs/vue3'
import { Link } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import EventCard from '~/components/event/EventCard.vue'
import { isDateInFuture, isDateInPast, isDateToday } from '~/utils/date'

interface Props {
  meetups: Data.Event[]
  canCreate: boolean
}

const props = defineProps<Props>()

// Filter state
type StatusFilter = 'all' | 'upcoming' | 'past'
const query = ref('')
const statusFilter = ref<StatusFilter>('all')

const upcomingMeetups = computed(() =>
  props.meetups.filter((m) => (m.date ? isDateInFuture(new Date(m.date)) : false))
)

const todaysMeetups = computed(() =>
  props.meetups.filter((m) => (m.date ? isDateToday(new Date(m.date)) : false))
)

const nextMeetup = computed(() => {
  const sorted = [...upcomingMeetups.value].sort(
    (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()
  )
  return sorted[0]
})

const nextMeetupId = computed(() => nextMeetup.value?.id)

// Apply search + status filter. "Upcoming" includes same-day meetups; they're
// only moved to "Past" the day after.
const filteredMeetups = computed(() => {
  const q = query.value.trim().toLowerCase()
  return props.meetups.filter((m) => {
    if (statusFilter.value !== 'all') {
      const d = m.date ? new Date(m.date) : null
      const isUpcoming = d ? !isDateInPast(d) : false
      if (statusFilter.value === 'upcoming' && !isUpcoming) return false
      if (statusFilter.value === 'past' && isUpcoming) return false
    }
    if (!q) return true
    return (
      m.title.toLowerCase().includes(q) ||
      (m.venue ?? '').toLowerCase().includes(q) ||
      (m.date ?? '').toLowerCase().includes(q)
    )
  })
})

// Group filtered meetups by year
const meetupsGroupedByYear = computed(() => {
  return filteredMeetups.value.reduce((acc: Record<number, Data.Event[]>, event) => {
    if (!event.date) return acc
    const year = new Date(event.date).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(event)
    return acc
  }, {})
})

const years = computed(() =>
  Object.keys(meetupsGroupedByYear.value)
    .map(Number)
    .sort((a, b) => b - a)
)

const totalAttendees = computed(() =>
  props.meetups.reduce((sum, m) => sum + (m.attendeeCount ?? 0), 0)
)

function clearFilters() {
  query.value = ''
  statusFilter.value = 'all'
}

function yearAttendees(year: number) {
  return (meetupsGroupedByYear.value[year] || []).reduce(
    (sum, m) => sum + (m.attendeeCount ?? 0),
    0
  )
}

// Promote the upcoming meetup (or latest past meetup of its year) as "featured" within its own year
function featuredForYear(year: number): Data.Event | undefined {
  const items = meetupsGroupedByYear.value[year] || []
  if (nextMeetup.value && new Date(nextMeetup.value.date!).getFullYear() === year) {
    return items.find((m) => m.id === nextMeetup.value!.id)
  }
  return undefined
}
</script>

<template>
  <Head title="All Meetups" />
  <main class="relative min-h-screen pt-32 pb-24 overflow-x-clip">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <!-- Page Header -->
      <header class="mb-10 max-w-3xl space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <p class="mono-eyebrow">
            <span>CODERS.MU</span>
            <span class="sep">/</span>
            <span>MEETUPS</span>
          </p>
          <Link
            v-if="canCreate"
            href="/admin/events/create"
            class="text-xs font-semibold text-verse-500 dark:text-verse-400 hover:text-verse-600 dark:hover:text-verse-300 transition-colors"
          >
            + Create Event
          </Link>
        </div>

        <h1
          class="font-display text-[clamp(48px,6vw,88px)] leading-[0.98] text-gray-900 dark:text-white text-balance"
        >
          Every meetup, <span class="font-display-italic text-verse-500 dark:text-verse-300">every year</span>
        </h1>

        <p class="text-[18px] leading-[1.55] text-gray-500 dark:text-gray-400 max-w-[58ch]">
          Over the years, we've organized {{ meetups.length }}+ meetups around the island — from beachside hacks to
          late-night terminal talks<template v-if="totalAttendees">. {{ totalAttendees.toLocaleString() }}+ builders
          have shown up</template>. Here's all of them.
        </p>
      </header>

      <!-- Filter row -->
      <div
        class="filter-row flex flex-wrap items-center gap-3 py-4 mb-6 border-y border-gray-200 dark:border-verse-900"
      >
        <label
          class="search-input flex items-center gap-2.5 flex-1 min-w-[220px] px-3.5 py-2.5 rounded-lg bg-white dark:bg-verse-950 border border-gray-200 dark:border-verse-800 focus-within:border-verse-500 transition-colors"
        >
          <svg class="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            v-model="query"
            type="text"
            placeholder="Search by title, venue, year…"
            class="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
          />
        </label>

        <div
          class="pill-filter inline-flex p-1 rounded-full bg-gray-50 dark:bg-verse-900 border border-gray-200 dark:border-verse-800"
        >
          <button
            v-for="option in [
              { k: 'all', label: 'All' },
              { k: 'upcoming', label: 'Upcoming' },
              { k: 'past', label: 'Past' },
            ]"
            :key="option.k"
            type="button"
            class="px-3.5 py-1.5 rounded-full font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors"
            :class="
              statusFilter === option.k
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            "
            @click="statusFilter = option.k as StatusFilter"
          >
            {{ option.label }}
          </button>
        </div>

        <div
          class="filter-count font-mono text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500 sm:ml-auto"
        >
          Showing
          <strong class="text-gray-900 dark:text-gray-100 font-bold">{{ filteredMeetups.length }}</strong>
          of {{ meetups.length }}
        </div>
      </div>

      <!-- Empty state (after filter) -->
      <div
        v-if="meetups.length && !filteredMeetups.length"
        class="py-20 text-center font-mono text-sm text-gray-500 dark:text-gray-400"
      >
        No meetups match <strong class="text-gray-900 dark:text-gray-100">&ldquo;{{ query }}&rdquo;</strong>.
        <div class="mt-4">
          <button
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-verse-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-verse-900"
            @click="clearFilters"
          >
            Clear filters
          </button>
        </div>
      </div>

      <!-- Timeline Grid -->
      <div class="space-y-16">
        <template v-for="year in years" :key="year">
          <section class="year-section relative">
            <!-- Giant vertical year label — breaks out of the container to the left -->
            <div
              aria-hidden="true"
              class="year-label absolute top-[40px] font-display font-normal pointer-events-none select-none hidden md:block text-gray-200/90 dark:text-verse-900"
              :style="{
                fontSize: 'clamp(80px, 12vw, 180px)',
                lineHeight: '0.8',
                letterSpacing: '-0.04em',
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                right: 'calc(100% + 1.25rem)',
                zIndex: 0,
              }"
            >
              {{ year }}
            </div>

            <!-- Year header -->
            <div class="relative z-10 flex items-baseline gap-5 mb-7">
              <h2 class="font-display text-[32px] md:text-[38px] leading-none tracking-tight text-gray-900 dark:text-gray-100">
                {{ year }}
              </h2>
              <span class="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ meetupsGroupedByYear[year].length }} meetup<template v-if="meetupsGroupedByYear[year].length !== 1">s</template>
                <template v-if="yearAttendees(year)"> · {{ yearAttendees(year) }} attendees</template>
              </span>
            </div>

            <!-- Events Grid -->
            <div class="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5">
              <template v-for="event in meetupsGroupedByYear[year]" :key="event.id">
                <div
                  :class="event.id === featuredForYear(year)?.id ? 'md:col-span-2' : ''"
                >
                  <EventCard
                    :event="event"
                    :is-next-meetup="event.id === nextMeetupId"
                    :is-meetup-today="todaysMeetups.some((m) => m.id === event.id)"
                    :featured="event.id === featuredForYear(year)?.id"
                  />
                </div>
              </template>
            </div>
          </section>
        </template>
      </div>

      <!-- Empty state (no meetups at all) -->
      <div v-if="!meetups.length" class="text-center py-32 space-y-6">
        <div
          class="w-16 h-16 bg-gray-50 dark:bg-verse-900 rounded-lg flex items-center justify-center mx-auto"
        >
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-2xl font-bold text-gray-400">No meetups found in the archives.</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.year-section + .year-section {
  border-top: 1px dashed var(--color-gray-200, #e5e7eb);
  padding-top: 4rem;
}
:global(html.dark) .year-section + .year-section {
  border-top-color: var(--color-verse-900);
}
</style>
