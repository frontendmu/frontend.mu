<script setup lang="ts">
import { onMounted } from 'vue'
import { DISCORD_URL, GITHUB_URL, INSTAGRAM_URL, LINKEDIN_URL, TWITTER_URL, WHATSAPP_URL } from '@/constants'

const router = useRouter()

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
</script>

<template>
  <div class="menu-wrapper w-full flex sticky top-0 z-30 h-20 items-center">
    <div class="menu theme-light w-full">
      <div class="flex justify-between items-center contain">
        <div class="flex">
          <NuxtLink
            href="/" class="flex gap-2 text-verse-500 dark:text-verse-200" title="frontend.mu"
            @contextmenu="handleRightClick"
          >
            <SiteLogo class="w-10" />
            <span class="hidden text-lg font-bold leading-none tracking-tighter md:text-3xl md:block">
              frontend.mu
            </span>
          </NuxtLink>
        </div>
        <nav>
          <ul class="nav-links text-sm md:text-sm lg:text-base flex md:gap-4 gap-2 font-medium font-heading">
            <template v-for="item of Object.keys(links)" :key="item">
              <SiteMenuItem :links="links" :item="item" />
            </template>
          </ul>
        </nav>
        <div>
          <div class="flex items-center gap-2">
            <!-- <a target="_blank" href="https://github.com/frontendmu/frontend.mu/">
              <span class="sr-only">GitHub Repository</span>
              <Icon name="carbon:logo-github" class="w-4 h-4 text-verse-600 dark:text-verse-100" />
            </a> -->
            <slot name="dock-right" />
          </div>
        </div>
        <div class="absolute right-10 top-10 rounded-lg px-4 bg-white/20 shadow-[0px_0px_2px_var(--color-verse-500)]">
          <slot name="dock-right-bottom" />
        </div>
      </div>
    </div>
  </div>
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
</style>
