<script setup lang="ts">
import { computed, onUnmounted, ref, useId } from 'vue'
import {
  buildCalendarEvent,
  downloadIcs,
  googleCalendarUrl,
  office365Url,
  outlookComUrl,
  type CalendarEventInput,
} from '~/utils/calendar'

const props = withDefaults(
  defineProps<{
    event: CalendarEventInput
    filename: string
    variant?: 'icon' | 'full'
  }>(),
  { variant: 'full' }
)

const menuId = `add-to-calendar-${useId()}`
const trigger = ref<HTMLButtonElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const calendarEvent = computed(() => buildCalendarEvent(props.event))

const links = computed(() => {
  const event = calendarEvent.value
  if (!event) return []
  return [
    { label: 'Google Calendar', href: googleCalendarUrl(event) },
    { label: 'Outlook.com', href: outlookComUrl(event) },
    { label: 'Microsoft 365', href: office365Url(event) },
  ]
})

function placeMenu() {
  if (!trigger.value || !menu.value) return
  const rect = trigger.value.getBoundingClientRect()
  const menuRect = menu.value.getBoundingClientRect()
  const gap = 8
  const margin = 12
  const opensUp = rect.bottom + gap + menuRect.height > window.innerHeight - margin
  const top = opensUp ? rect.top - gap - menuRect.height : rect.bottom + gap
  const left = Math.min(
    Math.max(margin, rect.right - menuRect.width),
    window.innerWidth - menuRect.width - margin
  )
  menu.value.style.top = `${Math.max(margin, top)}px`
  menu.value.style.left = `${left}px`
  menu.value.style.visibility = 'visible'
}

function closeMenu() {
  menu.value?.hidePopover()
}

function onBeforeToggle(event: Event) {
  if ((event as ToggleEvent).newState === 'open' && menu.value) {
    menu.value.style.visibility = 'hidden'
  }
}

function onToggle(event: Event) {
  isOpen.value = (event as ToggleEvent).newState === 'open'
  if (isOpen.value) {
    placeMenu()
    window.addEventListener('scroll', closeMenu, { passive: true })
    window.addEventListener('resize', closeMenu)
    menu.value?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
  } else {
    window.removeEventListener('scroll', closeMenu)
    window.removeEventListener('resize', closeMenu)
  }
}

function onMenuKeydown(event: KeyboardEvent) {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  const items = Array.from(menu.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
  if (!items.length) return
  event.preventDefault()
  const index = items.indexOf(document.activeElement as HTMLElement)
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? items.length - 1
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
  items[next].focus()
}

function downloadFile() {
  if (calendarEvent.value) downloadIcs(calendarEvent.value, props.filename)
  closeMenu()
}

onUnmounted(() => {
  window.removeEventListener('scroll', closeMenu)
  window.removeEventListener('resize', closeMenu)
})
</script>

<template>
  <template v-if="calendarEvent">
    <button ref="trigger" type="button" :popovertarget="menuId" aria-haspopup="menu" :aria-expanded="isOpen" :aria-controls="menuId" :aria-label="variant === 'icon' ? 'Add to Calendar' : undefined" :class="variant === 'icon' ? 'w-11 h-11 rounded-lg border border-gray-200 dark:border-verse-800 grid place-items-center text-gray-500 dark:text-gray-400 cursor-pointer hover:text-verse-500 transition-colors' : 'flex-1 inline-flex items-center justify-center gap-2 py-3 text-sm font-semibold border border-gray-200 dark:border-verse-800 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-verse-900 transition-colors'">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </svg>
      <template v-if="variant === 'full'">
        Add to Calendar
        <svg class="w-3.5 h-3.5 transition-transform" :class="isOpen && 'rotate-180'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </template>
    </button>

    <div :id="menuId" ref="menu" popover="auto" role="menu" aria-label="Add to Calendar" class="add-to-calendar-menu m-0 w-72 p-1.5 rounded-xl border border-gray-200 dark:border-verse-800 bg-white dark:bg-verse-950 text-gray-700 dark:text-gray-200 shadow-[0_12px_32px_-8px_rgba(13,20,51,0.25),0_4px_12px_-4px_rgba(13,20,51,0.12)]" @beforetoggle="onBeforeToggle" @toggle="onToggle" @keydown="onMenuKeydown">
      <a v-for="link in links" :key="link.label" role="menuitem" :href="link.href" target="_blank" rel="noopener noreferrer" class="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-verse-900 focus:bg-gray-50 dark:focus:bg-verse-900 focus:outline-none transition-colors" @click="closeMenu">
        {{ link.label }}
      </a>
      <button type="button" role="menuitem" class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-verse-900 focus:bg-gray-50 dark:focus:bg-verse-900 focus:outline-none transition-colors" @click="downloadFile">
        Apple Calendar / .ics file
      </button>
    </div>
  </template>
</template>

<style scoped>
.add-to-calendar-menu {
  position: fixed;
  inset: auto;
}
</style>
