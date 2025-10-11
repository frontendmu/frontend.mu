<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { DISCORD_URL, GITHUB_URL, INSTAGRAM_URL, LINKEDIN_URL, TWITTER_URL, WHATSAPP_URL } from '@/constants'

const router = useRouter()
const route = useRoute()

interface TMenuItem {
  title: string
  href: string
  class?: string
  children?: TMenuItem[]
  target?: string
  rel?: string
}

interface TMenu {
  [key: string]: TMenuItem
}

const links: TMenu = {
  about: {
    title: 'About',
    href: '/about',
    class: 'hidden md:block',
    children: [
      // {
      //   title: 'FAQ',
      //   href: '/faq',
      //   class: '',
      // },
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
        href: '/code_of_conduct',
        class: '',
      },
      {
        title: 'Coding Guidelines',
        href: '/coding_guidelines',
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
  // advent: {
  //   title: 'Advent Calendar',
  //   href: 'https://advent.coders.mu',
  //   class: 'external-link',
  //   target: '_blank',
  //   rel: 'noopener noreferrer',
  // },
}

function toggleHeader() {
  const headerElement = document.querySelector('.menu-wrapper') as HTMLElement

  // headerOffset tracks how much the header has been moved vertically
  let headerOffset = 0

  // This keeps track of the previous scroll position to calculate whether the user is scrolling up or down.
  let previousScrollPosition = 0

  if (headerElement) {
    const handleScroll = () => {
      window.requestAnimationFrame(() => {
        const headerHeight = headerElement.clientHeight

        // the current vertical scroll position of the page
        const currentScrollPosition
          = window.scrollY || document.documentElement.scrollTop

        // the distance that the user has scrolled since the last scroll event
        const distance = currentScrollPosition - previousScrollPosition

        // New vertical position of the header
        const nextHeaderOffset = Math.min(
          Math.max(headerOffset + distance, 0),
          headerHeight,
        )

        // checks if the user has scrolled past the header and nextHeaderOffset differs from the current position
        if (
          currentScrollPosition >= headerHeight
          && nextHeaderOffset !== headerOffset
        ) {
          headerOffset = nextHeaderOffset
          headerElement.style.transform = `translateY(-${headerOffset}px)`
        }

        // if the user has scrolled past the header, we add these classes
        if (currentScrollPosition > headerHeight) {
          headerElement.classList.add(
            'intersect',
            'shadow-sm',
            'dark:bg-verse-900/50',
            'bg-verse-50/50',
          )
        }
        else {
          headerElement.classList.remove(
            'intersect',
            'shadow-sm',
            'dark:bg-verse-900/50',
            'bg-verse-50/50',
          )
        }

        previousScrollPosition = currentScrollPosition
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
  }
}

function handleRightClick(event: MouseEvent) {
  // prevent default and navigate to /branding
  event.preventDefault()
  router.push('/branding')
}

onMounted(toggleHeader)

const isMobileMenuOpen = ref(false)
const mobileMenuRef = ref<HTMLElement | null>(null)
const mobileMenuButtonRef = ref<HTMLButtonElement | null>(null)
let lastFocusedElement: HTMLElement | null = null

const linkKeys = computed(() => Object.keys(links))

function lockBodyScroll(shouldLock: boolean) {
  if (typeof document === 'undefined')
    return

  document.body.classList.toggle('overflow-hidden', shouldLock)
}

function focusFirstItem() {
  const focusableSelectors
    = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  const dialogElement = mobileMenuRef.value
  const focusableElements = dialogElement
    ? Array.from(dialogElement.querySelectorAll<HTMLElement>(focusableSelectors))
    : []

  if (focusableElements.length > 0) {
    focusableElements[0].focus()
  }
}

function openMobileMenu() {
  if (isMobileMenuOpen.value)
    return

  lastFocusedElement = document.activeElement as HTMLElement
  isMobileMenuOpen.value = true
  lockBodyScroll(true)
  nextTick(focusFirstItem)
}

function closeMobileMenu() {
  if (!isMobileMenuOpen.value)
    return

  isMobileMenuOpen.value = false
  lockBodyScroll(false)
  nextTick(() => {
    if (mobileMenuButtonRef.value) {
      mobileMenuButtonRef.value.focus()
    }
    else if (lastFocusedElement) {
      lastFocusedElement.focus()
    }
    lastFocusedElement = null
  })
}

function toggleMobileMenu() {
  if (isMobileMenuOpen.value)
    closeMobileMenu()
  else
    openMobileMenu()
}

function handleDialogKeydown(event: KeyboardEvent) {
  if (!isMobileMenuOpen.value)
    return

  if (event.key === 'Escape') {
    event.preventDefault()
    closeMobileMenu()
    return
  }

  if (event.key !== 'Tab')
    return

  const focusableSelectors
    = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  const dialogElement = mobileMenuRef.value
  const focusableElements = dialogElement
    ? Array.from(dialogElement.querySelectorAll<HTMLElement>(focusableSelectors))
      .filter(element => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'))
    : []

  if (focusableElements.length === 0)
    return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  }
  else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

watch(() => route.fullPath, () => {
  if (isMobileMenuOpen.value)
    closeMobileMenu()
})

onMounted(() => {
  document.addEventListener('keydown', handleDialogKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleDialogKeydown)
  lockBodyScroll(false)
})
</script>

<template>
  <div class="menu-wrapper w-full flex sticky top-0 z-30 h-20 items-center">
    <div class="menu theme-light w-full flex justify-between">
      <div class="flex justify-between items-center w-full px-4 contain">
        <div class="flex items-center justify-between gap-3 w-full md:w-auto ">
          <NuxtLink
            href="/" class="flex gap-2 text-verse-500 dark:text-verse-200" title="coders.mu"
            @contextmenu="handleRightClick"
          >
            <SiteLogo class="w-10" />
            <span class="hidden text-lg font-bold leading-none tracking-tighter md:text-3xl md:block">
              coders.mu
            </span>
          </NuxtLink>

          <button
            ref="mobileMenuButtonRef"
            type="button"
            class="flex items-center md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verse-500"
            :aria-expanded="isMobileMenuOpen"
            aria-controls="site-mobile-menu"
            aria-label="Toggle navigation menu"
            @click="toggleMobileMenu"
          >
            <Icon
              :name="isMobileMenuOpen ? 'carbon:close' : 'carbon:menu'"
              class="w-7 h-7 text-verse-600 dark:text-verse-100"
            />
          </button>
        </div>

        <nav class="hidden md:block" aria-label="Primary navigation">
          <ul class="nav-links text-sm md:text-sm lg:text-base flex md:gap-4 gap-2 font-medium font-heading">
            <template v-for="item of linkKeys" :key="item">
              <SiteMenuItem :links="links" :item="item" />
            </template>
          </ul>
        </nav>

        <div class="hidden md:flex">
          <div class="flex items-center gap-2">
            <slot name="dock-right" />
          </div>
        </div>

        <div class="hidden md:block absolute right-10 top-10 rounded-lg px-4 bg-white/20 shadow-[0px_0px_2px_var(--color-verse-500)]">
          <slot name="dock-right-bottom" />
        </div>
      </div>
    </div>
  </div>

  <transition name="mobile-menu" appear>
    <div
      v-if="isMobileMenuOpen"
      id="site-mobile-menu"
      ref="mobileMenuRef"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-title"
      class="mobile-menu p-4 pt-6 md:hidden h-dvh bg-verse-50/95 backdrop-blur text-verse-900 dark:bg-verse-900/95 dark:text-verse-50"
      tabindex="-1"
    >
      <header class="mobile-menu-header">
        <p id="mobile-menu-title" class="text-lg font-semibold">
          Menu
        </p>
        <button
          type="button"
          class="flex items-center text-verse-600 dark:text-verse-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verse-500"
          @click="closeMobileMenu"
        >
          <Icon name="carbon:close" class="w-7 h-7" />
          <span class="sr-only">Close menu</span>
        </button>
      </header>

      <nav class="mobile-menu-content p-0.5" aria-label="Mobile navigation">
        <ul class="flex flex-col gap-4 text-lg font-medium p-0.5">
          <template v-for="itemKey of linkKeys" :key="`${itemKey}-mobile`">
            <li class="mobile-menu-item">
              <NuxtLink
                class="mobile-menu-link hover:text-verse-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verse-500 dark:hover:text-verse-200"
                :href="links[itemKey].href"
                :target="links[itemKey].target ?? (links[itemKey].href.startsWith('http') ? '_blank' : '_self')"
                :rel="links[itemKey].rel"
                @click="closeMobileMenu"
              >
                <span>{{ links[itemKey].title }}</span>
                <Icon v-if="links[itemKey].href.startsWith('http')" name="carbon:launch" class="w-5 h-5" />
              </NuxtLink>

              <ul
                v-if="links[itemKey].children && links[itemKey].children!.length"
                class="mobile-submenu"
              >
                <li v-for="subItem in links[itemKey].children" :key="`${itemKey}-child-${subItem.title}`">
                  <NuxtLink
                    class="mobile-submenu-link hover:text-verse-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verse-500 dark:hover:text-verse-200"
                    :href="subItem.href"
                    :target="subItem.target ?? (subItem.href.startsWith('http') ? '_blank' : '_self')"
                    :rel="subItem.rel"
                    @click="closeMobileMenu"
                  >
                    <span>{{ subItem.title }}</span>
                    <Icon v-if="subItem.href.startsWith('http')" name="carbon:launch" class="w-4 h-4" />
                  </NuxtLink>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </nav>

      <footer class="mobile-menu-footer">
        <slot name="dock-right" />
        <slot name="dock-right-bottom" />
      </footer>
    </div>
  </transition>
</template>

<style scoped lang="postcss">
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

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  --duration: 0.5s;
  transition: opacity var(--duration) ease, transform var(--duration) ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

.mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100dvh;
}

.mobile-menu-header,
.mobile-menu-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-menu-content {
  flex: 1;
  overflow-y: auto;
}

.mobile-menu :deep(a) {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.mobile-menu-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-menu-link {
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
}

.mobile-submenu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 1rem;
}

.mobile-submenu-link {
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
