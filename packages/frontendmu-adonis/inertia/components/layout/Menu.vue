<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
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
import type { TMenu, TMenuItem, SharedProps } from '~/types'

interface SocialLink {
  label: string
  href: string
}

interface InertSiblingState {
  element: HTMLElement
  ariaHidden: string | null
  hadInert: boolean
}

const page = usePage<SharedProps>()
const isAuthenticated = computed(() => page.props.auth.isAuthenticated)
const user = computed(() => page.props.auth.user)
const currentPath = computed(() => page.url)
const isMobileMenuOpen = ref(false)
const expandedSections = ref<string[]>([])
const menuInner = ref<HTMLElement | null>(null)
const mobileMenuTrigger = ref<HTMLButtonElement | null>(null)
const mobileMenuOverlay = ref<HTMLElement | null>(null)
const mobileMenuPanel = ref<HTMLElement | null>(null)
const mobileMenuCloseButton = ref<HTMLButtonElement | null>(null)
const mobileMenuCloseButtonStyle = ref<Record<string, string>>({})
const mobileMenuShellStyle = ref<Record<string, string>>({})
const mobileMenuAnimationPhase = ref<'idle' | 'opening' | 'closing'>('idle')

const MOBILE_MENU_SHELL_DURATION_CSS_PROPERTY = '--mobile-menu-shell-duration'
const MOBILE_MENU_SHELL_DURATION_FALLBACK_MS = 360
const MOBILE_MENU_SOURCE_RADIUS = '1rem'

const isAdmin = computed(() => {
  if (!user.value) return false
  return user.value.role === 'organizer' || user.value.role === 'superadmin'
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
      { title: 'Community', href: '/community' },
      { title: 'History', href: '/history' },
      { title: 'Contribute', href: '/contribute' },
      { title: 'Code of conduct', href: '/code-of-conduct' },
      { title: 'Guidelines', href: '/coding-guidelines' },
      { title: 'Discord', href: DISCORD_URL },
      { title: 'GitHub', href: GITHUB_URL },
    ],
  },
  meetups: { title: 'Meetups', href: '/meetups' },
  team: { title: 'People', href: '/team', class: 'hidden lg:block' },
  sponsors: {
    title: 'Sponsors',
    href: '/sponsors',
    class: 'hidden md:block',
    children: [
      { title: 'Our Partners', href: '/sponsors' },
      { title: 'Become a Sponsor', href: '/sponsor-us' },
    ],
  },
}

const mobileSocialLinks: SocialLink[] = [
  { label: 'Discord', href: DISCORD_URL },
  { label: 'GitHub', href: GITHUB_URL },
  { label: 'Instagram', href: INSTAGRAM_URL },
  { label: 'LinkedIn', href: LINKEDIN_URL },
  { label: 'Twitter', href: TWITTER_URL },
  { label: 'WhatsApp', href: WHATSAPP_URL },
]

const linkEntries = computed(() => Object.entries(links))

const authLinks = computed(() => {
  if (isAuthenticated.value && user.value) {
    return [{ title: 'Profile', href: '/profile' }]
  }
  return [
    { title: 'Login', href: '/login' },
    { title: 'Register', href: '/register' },
  ]
})

const mobileActionLinks = computed(() => {
  const actionLinks = [...authLinks.value]

  if (isAdmin.value) {
    actionLinks.unshift({ title: 'Admin', href: '/admin' })
  }

  return actionLinks
})

let scrollHandler: (() => void) | null = null
let shouldRestoreMobileMenuFocus = true
let previousFocusedElement: HTMLElement | null = null
let inertSiblings: InertSiblingState[] = []

const MOBILE_FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

const isMobileMenuContentVisible = computed(() => mobileMenuAnimationPhase.value === 'idle')

function isExternalLink(href: string) {
  return href.startsWith('http')
}

function isRouteActive(href: string) {
  if (isExternalLink(href)) return false

  if (href === '/') return currentPath.value === '/'

  return currentPath.value === href || currentPath.value.startsWith(`${href}/`)
}

function isItemActive(item: TMenu[string]) {
  return isRouteActive(item.href) || !!item.children?.some((child) => isRouteActive(child.href))
}

function isSectionExpanded(key: string) {
  return expandedSections.value.includes(key)
}

function getMobileItemMeta(item: TMenu[string]) {
  if (item.children?.length)
    return `${item.children.length + 1} ${item.children.length + 1 === 1 ? 'link' : 'links'}`

  return isExternalLink(item.href) ? 'External link' : 'Open page'
}

function getMobileSectionOverviewLabel(item: TMenuItem) {
  if (item.title === 'Sponsors') return 'All sponsors'

  return `${item.title} overview`
}

function getMobileSectionLinks(item: TMenuItem) {
  if (!item.children?.length) return []

  return [
    {
      title: getMobileSectionOverviewLabel(item),
      href: item.href,
      target: item.target,
      rel: item.rel,
    },
    ...item.children,
  ]
}

function setExpandedSections() {
  expandedSections.value = linkEntries.value.flatMap(([key, item]) =>
    item.children && isItemActive(item) ? [key] : []
  )
}

function isVisibleFocusableElement(element: HTMLElement) {
  const style = window.getComputedStyle(element)

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    !element.hasAttribute('hidden') &&
    element.getClientRects().length > 0
  )
}

function getMobileFocusableElements() {
  const panel = mobileMenuPanel.value

  if (!panel) return []

  return Array.from(panel.querySelectorAll<HTMLElement>(MOBILE_FOCUSABLE_SELECTOR)).filter(
    isVisibleFocusableElement
  )
}

function setDocumentSiblingsInert() {
  const overlay = mobileMenuOverlay.value

  if (!overlay) {
    inertSiblings = []
    return
  }

  inertSiblings = Array.from(document.body.children).flatMap((node) => {
    if (!(node instanceof HTMLElement) || node === overlay) return []

    return [
      {
        element: node,
        ariaHidden: node.getAttribute('aria-hidden'),
        hadInert: node.hasAttribute('inert'),
      },
    ]
  })

  for (const sibling of inertSiblings) {
    sibling.element.setAttribute('aria-hidden', 'true')
    sibling.element.setAttribute('inert', '')
  }
}

function restoreDocumentSiblings() {
  for (const sibling of inertSiblings) {
    if (sibling.ariaHidden === null) {
      sibling.element.removeAttribute('aria-hidden')
    } else {
      sibling.element.setAttribute('aria-hidden', sibling.ariaHidden)
    }

    if (sibling.hadInert) {
      sibling.element.setAttribute('inert', '')
    } else {
      sibling.element.removeAttribute('inert')
    }
  }

  inertSiblings = []
}

async function focusMobileMenu() {
  await nextTick()

  const initialFocus =
    mobileMenuCloseButton.value ?? getMobileFocusableElements()[0] ?? mobileMenuPanel.value

  initialFocus?.focus()
}

function focusMobileMenuPanel() {
  mobileMenuPanel.value?.focus()
}

function restoreMobileMenuFocus() {
  if (!shouldRestoreMobileMenuFocus) return

  const fallbackFocusTarget = mobileMenuTrigger.value
  const focusTarget =
    previousFocusedElement && document.contains(previousFocusedElement)
      ? previousFocusedElement
      : fallbackFocusTarget

  focusTarget?.focus()
}

async function closeMobileMenu(options: { restoreFocus?: boolean } = {}) {
  shouldRestoreMobileMenuFocus = options.restoreFocus ?? true

  if (!isMobileMenuOpen.value || mobileMenuAnimationPhase.value !== 'idle') return

  const shellDuration = getMobileMenuShellDurationMs()

  focusMobileMenuPanel()
  mobileMenuAnimationPhase.value = 'closing'
  setMobileMenuShellRect(getMobileMenuTargetRect(), { borderRadius: '0px' })
  await waitForAnimationFrame()
  setMobileMenuShellRect(getMobileMenuSourceRect(), { borderRadius: MOBILE_MENU_SOURCE_RADIUS })
  await waitForMilliseconds(shellDuration)
  isMobileMenuOpen.value = false
  mobileMenuAnimationPhase.value = 'idle'
}

async function toggleMobileMenu() {
  if (mobileMenuAnimationPhase.value !== 'idle') {
    return
  }

  if (isMobileMenuOpen.value) {
    await closeMobileMenu()
    return
  }

  shouldRestoreMobileMenuFocus = true
  const shellDuration = getMobileMenuShellDurationMs()
  mobileMenuAnimationPhase.value = 'opening'
  setMobileMenuCloseButtonRect(getMobileMenuTriggerRect())
  setMobileMenuShellRect(getMobileMenuSourceRect(), { borderRadius: MOBILE_MENU_SOURCE_RADIUS })
  isMobileMenuOpen.value = true
  await nextTick()
  await waitForAnimationFrame()
  setMobileMenuShellRect(getMobileMenuTargetRect(), { borderRadius: '0px' })
  await waitForMilliseconds(shellDuration)
  mobileMenuAnimationPhase.value = 'idle'
}

function toggleMobileSection(key: string) {
  expandedSections.value = isSectionExpanded(key)
    ? expandedSections.value.filter((sectionKey) => sectionKey !== key)
    : [...expandedSections.value, key]
}

async function handleMobileLogout() {
  await closeMobileMenu({ restoreFocus: false })
  handleLogout()
}

function waitForMilliseconds(duration: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, duration))
}

function waitForAnimationFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
}

function parseDurationToMilliseconds(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) return MOBILE_MENU_SHELL_DURATION_FALLBACK_MS

  if (trimmedValue.endsWith('ms')) {
    const parsedDuration = Number.parseFloat(trimmedValue)
    return Number.isFinite(parsedDuration) ? parsedDuration : MOBILE_MENU_SHELL_DURATION_FALLBACK_MS
  }

  if (trimmedValue.endsWith('s')) {
    const parsedDuration = Number.parseFloat(trimmedValue)
    return Number.isFinite(parsedDuration)
      ? parsedDuration * 1000
      : MOBILE_MENU_SHELL_DURATION_FALLBACK_MS
  }

  const parsedDuration = Number.parseFloat(trimmedValue)
  return Number.isFinite(parsedDuration) ? parsedDuration : MOBILE_MENU_SHELL_DURATION_FALLBACK_MS
}

function getMobileMenuShellDurationMs() {
  const sourceElement = mobileMenuOverlay.value ?? menuInner.value ?? document.documentElement
  const durationValue = window
    .getComputedStyle(sourceElement)
    .getPropertyValue(MOBILE_MENU_SHELL_DURATION_CSS_PROPERTY)

  return parseDurationToMilliseconds(durationValue)
}

function getMobileMenuSourceRect() {
  const sourceElement = menuInner.value ?? mobileMenuTrigger.value
  const rect = sourceElement?.getBoundingClientRect()

  if (!rect) {
    return {
      top: 16,
      left: 16,
      width: window.innerWidth - 32,
      height: 64,
    }
  }

  return rect
}

function getMobileMenuTriggerRect() {
  const rect = mobileMenuTrigger.value?.getBoundingClientRect()

  if (!rect) {
    return {
      top: 26,
      left: window.innerWidth - 72,
      width: 44,
      height: 44,
    }
  }

  return rect
}

function getMobileMenuTargetRect() {
  const rect = mobileMenuPanel.value?.getBoundingClientRect()

  if (!rect) {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  return rect
}

function setMobileMenuShellRect(
  rect: Pick<DOMRect, 'top' | 'left' | 'width' | 'height'>,
  options: { borderRadius: string }
) {
  mobileMenuShellStyle.value = {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    borderRadius: options.borderRadius,
  }
}

function setMobileMenuCloseButtonRect(rect: Pick<DOMRect, 'top' | 'left' | 'width' | 'height'>) {
  mobileMenuCloseButtonStyle.value = {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  }
}

function handleMobileDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMobileMenu()
    return
  }

  if (event.key !== 'Tab') return

  const focusableElements = getMobileFocusableElements()

  if (!focusableElements.length) {
    event.preventDefault()
    mobileMenuPanel.value?.focus()
    return
  }

  const firstFocusableElement = focusableElements[0]
  const lastFocusableElement = focusableElements[focusableElements.length - 1]
  const activeElement = document.activeElement as HTMLElement | null
  const panel = mobileMenuPanel.value

  if (!activeElement || !panel?.contains(activeElement)) {
    const fallbackFocusTarget = event.shiftKey ? lastFocusableElement : firstFocusableElement
    event.preventDefault()
    fallbackFocusTarget.focus()
    return
  }

  if (event.shiftKey) {
    if (activeElement === panel || activeElement === firstFocusableElement) {
      event.preventDefault()
      lastFocusableElement.focus()
    }
    return
  }

  if (activeElement === lastFocusableElement) {
    event.preventDefault()
    firstFocusableElement.focus()
  }
}

function handleWindowKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

function toggleHeader() {
  const headerElement = document.querySelector('.menu-wrapper') as HTMLElement

  if (headerElement) {
    scrollHandler = () => {
      const currentScrollPosition = window.scrollY || document.documentElement.scrollTop
      if (currentScrollPosition > 40) {
        headerElement.classList.add('scrolled')
      } else {
        headerElement.classList.remove('scrolled')
      }
    }
    window.addEventListener('scroll', scrollHandler, { passive: true })
  }
}

watch(isMobileMenuOpen, async (open) => {
  if (open) {
    previousFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    setExpandedSections()
    setMobileMenuCloseButtonRect(getMobileMenuTriggerRect())
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    await nextTick()
    setDocumentSiblingsInert()
    focusMobileMenuPanel()
    if (mobileMenuAnimationPhase.value === 'opening') {
      await waitForMilliseconds(getMobileMenuShellDurationMs())
    }
    await focusMobileMenu()
    return
  }

  expandedSections.value = []
  restoreDocumentSiblings()
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  await nextTick()
  restoreMobileMenuFocus()
  previousFocusedElement = null
})

watch(
  () => page.url,
  () => {
    if (isMobileMenuOpen.value) {
      closeMobileMenu({ restoreFocus: false })
    }
  }
)

onMounted(toggleHeader)
onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown)
})

onUnmounted(() => {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
  }

  window.removeEventListener('keydown', handleWindowKeydown)
  restoreDocumentSiblings()
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})
</script>

<template>
  <div
    class="menu-wrapper fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 transition-all duration-500 ease-expo"
  >
    <div
      ref="menuInner"
      class="menu-inner w-[92%] max-w-5xl bg-white/80 dark:bg-verse-950/60 backdrop-blur-xl border border-gray-100 dark:border-verse-800 rounded-2xl squircle px-3 md:px-5 h-16 flex items-center justify-between shadow-sm"
    >
      <!-- Brand -->
      <div class="flex items-center">
        <Link
          href="/"
          class="flex items-center gap-2 group"
          @contextmenu.prevent="router.visit('/branding')"
        >
          <div
            class="w-9 h-9 flex items-center justify-center rounded-xl bg-verse-500 text-white shadow-lg shadow-verse-500/20 group-hover:scale-110 transition-all duration-500"
          >
            <Logo class="w-5 h-5" />
          </div>
          <span
            class="hidden sm:block text-lg font-black tracking-tighter dark:text-gray-100 uppercase tracking-[0.1em]"
          >
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
        <div class="hidden items-center gap-2 md:flex md:gap-4">
          <slot name="dock-right" />

          <div class="h-6 w-px bg-gray-100 dark:bg-verse-800" />

          <ul class="flex items-center gap-1">
            <li v-if="isAdmin" class="mr-1">
              <Link
                href="/admin"
                class="px-3 py-1.5 bg-verse-600 text-white rounded-lg text-xs font-bold hover:bg-verse-700 transition-colors"
              >
                Admin
              </Link>
            </li>

            <template v-for="link in authLinks" :key="link.href">
              <li>
                <Link
                  :href="link.href"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-verse-500 dark:hover:text-verse-300 transition-colors"
                >
                  {{ link.title }}
                </Link>
              </li>
            </template>

            <li v-if="isAuthenticated">
              <button
                @click="handleLogout"
                class="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500/70 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>

        <button
          ref="mobileMenuTrigger"
          type="button"
          class="mobile-focus inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-600 shadow-sm transition-all hover:border-verse-500/30 hover:text-verse-500 active:scale-95 dark:border-verse-800 dark:bg-verse-950/70 dark:text-gray-300 dark:hover:border-verse-600 dark:hover:text-verse-300 md:hidden"
          aria-controls="mobile-navigation"
          :aria-expanded="isMobileMenuOpen"
          aria-haspopup="dialog"
          aria-label="Open navigation menu"
          @click="toggleMobileMenu"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.25"
              d="M4 7h16M4 12h16M4 17h16"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="isMobileMenuOpen" ref="mobileMenuOverlay" class="fixed inset-0 z-[70] md:hidden">
      <div class="absolute inset-0 bg-verse-950/18" aria-hidden="true" />

      <div
        aria-hidden="true"
        class="mobile-menu-shell pointer-events-none absolute border border-gray-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.96))] shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-verse-800/92 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.8),rgba(2,6,23,0.97))] dark:shadow-[0_24px_90px_rgba(1,4,12,0.52)]"
        :style="mobileMenuShellStyle"
      />

      <div
        id="mobile-navigation"
        ref="mobileMenuPanel"
        class="relative z-10 flex h-full w-full flex-col overflow-y-auto text-gray-900 focus:outline-none dark:text-gray-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
        aria-describedby="mobile-menu-description"
        tabindex="-1"
        @keydown="handleMobileDialogKeydown"
      >
        <div
          class="mobile-menu-content relative flex min-h-full flex-col transition-opacity duration-200 ease-out"
          :class="isMobileMenuContentVisible ? 'opacity-100' : 'pointer-events-none opacity-0'"
          :inert="!isMobileMenuContentVisible"
        >
          <div class="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              class="absolute right-[-20%] top-[-4%] h-56 w-56 rounded-full bg-verse-500/12 blur-3xl dark:bg-verse-400/10"
            />
            <div
              class="absolute left-[-18%] top-48 h-40 w-40 rounded-full bg-orange-400/12 blur-3xl dark:bg-orange-300/10"
            />
          </div>

          <div
            class="mobile-menu-section relative z-10 pb-6"
            style="padding-top: calc(env(safe-area-inset-top) + 1rem)"
          >
            <div class="flex items-start gap-4 pr-16">
              <Link
                href="/"
                class="flex min-w-0 items-center gap-3"
                @click="closeMobileMenu({ restoreFocus: false })"
              >
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl bg-verse-500 text-white shadow-lg shadow-verse-500/20"
                >
                  <Logo class="w-6 h-6" />
                </div>

                <div class="min-w-0">
                  <p
                    id="mobile-menu-title"
                    class="truncate text-2xl font-black tracking-tight text-gray-900 dark:text-white"
                  >
                    coders<span class="text-verse-500">.mu</span>
                  </p>
                  <p
                    id="mobile-menu-description"
                    class="mt-1 max-w-[15rem] text-sm text-gray-600 dark:text-gray-300"
                  >
                    Front-end community, meetups, and people in Mauritius.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <button
            ref="mobileMenuCloseButton"
            type="button"
            class="mobile-focus fixed z-20 inline-flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-600 shadow-sm transition-all hover:border-verse-500/30 hover:text-verse-500 active:scale-95 dark:border-verse-800 dark:bg-verse-950/70 dark:text-gray-300 dark:hover:border-verse-600 dark:hover:text-verse-300"
            :style="mobileMenuCloseButtonStyle"
            aria-label="Close navigation menu"
            @click="closeMobileMenu"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.25"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div
            class="mobile-menu-section relative z-10 py-4"
            role="group"
            aria-labelledby="mobile-quick-actions-title"
            aria-describedby="mobile-quick-actions-description"
          >
            <div class="sr-only">
              <p id="mobile-quick-actions-title">Quick actions</p>
              <p id="mobile-quick-actions-description">Theme and account controls</p>
            </div>

            <div class="flex items-center justify-between gap-4">
              <div class="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3">
                <Link
                  v-for="link in mobileActionLinks"
                  :key="link.href"
                  :href="link.href"
                  class="mobile-inline-action mobile-focus inline-flex items-center text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-gray-700 transition-colors hover:text-verse-600 dark:text-gray-200 dark:hover:text-verse-300"
                  @click="closeMobileMenu({ restoreFocus: false })"
                >
                  {{ link.title }}
                </Link>

                <button
                  v-if="isAuthenticated"
                  type="button"
                  class="mobile-inline-action mobile-focus inline-flex items-center text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-red-600 transition-colors hover:text-red-500 dark:text-red-300"
                  @click="handleMobileLogout"
                >
                  Logout
                </button>
              </div>

              <div class="shrink-0 -translate-x-px">
                <slot name="dock-right" />
              </div>
            </div>
          </div>

          <nav
            aria-label="Mobile navigation"
            aria-describedby="mobile-navigation-meta"
            class="relative z-10 flex-1 px-5 pb-6 pt-4"
          >
            <p id="mobile-navigation-meta" class="sr-only">
              Navigate, {{ linkEntries.length }} sections
            </p>

            <ul class="border-y border-gray-200/70 dark:border-white/8">
              <template v-for="[key, item] of linkEntries" :key="key">
                <li
                  class="overflow-visible border-b border-gray-200/65 last:border-b-0 dark:border-white/7"
                >
                  <div class="relative">
                    <span
                      v-if="isItemActive(item)"
                      aria-hidden="true"
                      class="pointer-events-none absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-full bg-verse-500"
                    />

                    <button
                      v-if="item.children"
                      type="button"
                      class="mobile-row mobile-focus group flex w-full min-w-0 items-center justify-between gap-4 px-5 py-4 text-left"
                      :class="
                        isItemActive(item)
                          ? 'text-gray-950 dark:text-white'
                          : 'text-gray-900 dark:text-gray-100'
                      "
                      :aria-controls="`mobile-submenu-${key}`"
                      :aria-expanded="isSectionExpanded(key)"
                      @click="toggleMobileSection(key)"
                    >
                      <div class="min-w-0">
                        <span class="block font-heading text-[1.35rem] font-semibold leading-tight">
                          {{ item.title }}
                        </span>
                        <span class="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          {{ getMobileItemMeta(item) }}
                        </span>
                      </div>

                      <div class="flex items-center gap-3">
                        <span
                          v-if="isRouteActive(item.href)"
                          class="text-[10px] font-semibold uppercase tracking-[0.18em] text-verse-700 dark:text-verse-200"
                        >
                          Current
                        </span>
                        <svg
                          class="h-5 w-5 shrink-0 text-gray-400 transition-[color,transform] duration-300 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                          :class="
                            isSectionExpanded(key)
                              ? 'rotate-180 text-gray-700 dark:text-gray-200'
                              : ''
                          "
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.25"
                            d="m19 9-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    <Link
                      v-else-if="!isExternalLink(item.href)"
                      :href="item.href"
                      class="mobile-row mobile-focus group flex min-w-0 items-center justify-between gap-4 px-5 py-4 text-left"
                      :class="
                        isItemActive(item)
                          ? 'text-gray-950 dark:text-white'
                          : 'text-gray-900 dark:text-gray-100'
                      "
                      :aria-current="isRouteActive(item.href) ? 'page' : undefined"
                      @click="closeMobileMenu({ restoreFocus: false })"
                    >
                      <div class="min-w-0">
                        <span class="block font-heading text-[1.35rem] font-semibold leading-tight">
                          {{ item.title }}
                        </span>
                        <span class="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          {{ getMobileItemMeta(item) }}
                        </span>
                      </div>

                      <div class="flex items-center gap-3">
                        <span
                          v-if="isRouteActive(item.href)"
                          class="text-[10px] font-semibold uppercase tracking-[0.18em] text-verse-700 dark:text-verse-200"
                        >
                          Current
                        </span>
                        <svg
                          class="h-4 w-4 shrink-0 text-gray-400 transition-colors duration-200 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.25"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>

                    <a
                      v-else
                      :href="item.href"
                      :target="item.target || '_blank'"
                      :rel="item.rel || 'noopener noreferrer'"
                      :aria-label="`${item.title} (opens in a new tab)`"
                      class="mobile-row mobile-focus group flex min-w-0 items-center justify-between gap-4 px-5 py-4 text-left text-gray-900 dark:text-gray-100"
                      @click="closeMobileMenu({ restoreFocus: false })"
                    >
                      <div class="min-w-0">
                        <span class="block font-heading text-[1.35rem] font-semibold leading-tight">
                          {{ item.title }}
                        </span>
                        <span class="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          {{ getMobileItemMeta(item) }}
                        </span>
                      </div>

                      <svg
                        class="h-4 w-4 shrink-0 text-gray-400 transition-colors duration-200 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2.25"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>

                    <Transition
                      enter-active-class="transition duration-200 ease-out"
                      enter-from-class="translate-y-2 opacity-0"
                      enter-to-class="translate-y-0 opacity-100"
                      leave-active-class="transition duration-150 ease-in"
                      leave-from-class="translate-y-0 opacity-100"
                      leave-to-class="translate-y-2 opacity-0"
                    >
                      <div
                        v-if="item.children && isSectionExpanded(key)"
                        :id="`mobile-submenu-${key}`"
                        class="mobile-submenu ml-5 mr-4 pb-3 pl-4"
                      >
                        <ul class="space-y-1">
                          <li
                            v-for="submenu in getMobileSectionLinks(item)"
                            :key="`${key}-${submenu.href}`"
                          >
                            <Link
                              v-if="!isExternalLink(submenu.href)"
                              :href="submenu.href"
                              class="mobile-subrow mobile-focus flex items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors"
                              :class="
                                isRouteActive(submenu.href)
                                  ? 'text-verse-700 dark:text-verse-200'
                                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                              "
                              :aria-current="isRouteActive(submenu.href) ? 'page' : undefined"
                              @click="closeMobileMenu({ restoreFocus: false })"
                            >
                              <span class="truncate">{{ submenu.title }}</span>

                              <svg
                                class="h-4 w-4 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2.25"
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </Link>

                            <a
                              v-else
                              :href="submenu.href"
                              :target="submenu.target || '_blank'"
                              :rel="submenu.rel || 'noopener noreferrer'"
                              :aria-label="`${submenu.title} (opens in a new tab)`"
                              class="mobile-subrow mobile-focus flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                              @click="closeMobileMenu({ restoreFocus: false })"
                            >
                              <span class="truncate">{{ submenu.title }}</span>

                              <svg
                                class="h-4 w-4 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2.25"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </Transition>
                  </div>
                </li>
              </template>
            </ul>
          </nav>

          <div
            class="relative z-10 px-5 pt-5"
            style="padding-bottom: calc(env(safe-area-inset-bottom) + 1.25rem)"
          >
            <div class="flex items-end justify-between gap-4">
              <div>
                <p
                  class="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400"
                >
                  Stay connected
                </p>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Follow the community elsewhere
                </p>
              </div>

              <Link
                href="/meetups"
                class="mobile-inline-action mobile-focus inline-flex items-center text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-gray-700 transition-colors hover:text-verse-600 dark:text-gray-200 dark:hover:text-verse-300"
                @click="closeMobileMenu({ restoreFocus: false })"
              >
                Meetups
              </Link>
            </div>

            <ul class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
              <li v-for="socialLink in mobileSocialLinks" :key="socialLink.label">
                <a
                  :href="socialLink.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="`${socialLink.label} (opens in a new tab)`"
                  class="mobile-text-link mobile-focus flex items-center justify-between gap-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-verse-600 dark:text-gray-200 dark:hover:text-verse-300"
                  @click="closeMobileMenu({ restoreFocus: false })"
                >
                  <span>{{ socialLink.label }}</span>

                  <svg
                    class="h-3.5 w-3.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.25"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@reference 'tailwindcss';

:global(:root) {
  --mobile-menu-shell-duration: 360ms;
  --mobile-menu-inline-padding: calc(4vw + 0.75rem);
}

.menu-wrapper.scrolled {
  @apply pt-2;
}

.menu-wrapper.scrolled .menu-inner {
  @apply shadow-lg border-gray-200;

  &:where(.dark *, .dark) {
    border-color: var(--color-verse-700);
  }
}

.ease-expo {
  transition-timing-function: cubic-bezier(0.87, 0, 0.13, 1);
}

.mobile-menu-shell {
  transition:
    top var(--mobile-menu-shell-duration) cubic-bezier(0.22, 1, 0.36, 1),
    left var(--mobile-menu-shell-duration) cubic-bezier(0.22, 1, 0.36, 1),
    width var(--mobile-menu-shell-duration) cubic-bezier(0.22, 1, 0.36, 1),
    height var(--mobile-menu-shell-duration) cubic-bezier(0.22, 1, 0.36, 1),
    border-radius var(--mobile-menu-shell-duration) cubic-bezier(0.22, 1, 0.36, 1);
  will-change: top, left, width, height, border-radius;
}

.mobile-menu-section {
  padding-inline: var(--mobile-menu-inline-padding);
}

.mobile-row {
  border-radius: 0.3rem;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.mobile-row:hover {
  background: rgba(15, 23, 42, 0.04);
}

.mobile-submenu {
  border-left: 1px solid rgba(148, 163, 184, 0.24);
}

.mobile-subrow {
  border-radius: 0.3rem;
}

.mobile-subrow:hover {
  background: rgba(15, 23, 42, 0.05);
}

.mobile-inline-action {
  position: relative;
  padding-bottom: 0.2rem;
}

.mobile-inline-action::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  background: currentColor;
  opacity: 0.18;
  transition: opacity 180ms ease;
}

.mobile-inline-action:hover::after,
.mobile-inline-action:focus-visible::after {
  opacity: 0.42;
}

.mobile-focus {
  outline: none;
}

.mobile-focus:focus-visible {
  box-shadow:
    0 0 0 2px var(--color-verse-400),
    0 0 0 5px rgba(248, 250, 252, 0.96);
}

:where(.dark *, .dark) .mobile-row:hover {
  background: rgba(255, 255, 255, 0.035);
}

:where(.dark *, .dark) .mobile-submenu {
  border-color: rgba(148, 163, 184, 0.18);
}

:where(.dark *, .dark) .mobile-subrow:hover {
  background: rgba(255, 255, 255, 0.04);
}

:where(.dark *, .dark) .mobile-focus:focus-visible {
  box-shadow:
    0 0 0 2px var(--color-verse-300),
    0 0 0 5px rgba(2, 6, 23, 0.96);
}
</style>
