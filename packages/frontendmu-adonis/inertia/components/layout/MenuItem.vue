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

const today = computed(() => {
  const date = new Date()
  const month = date.getMonth()
  // Only show date during December, otherwise show 1
  return month === 11 ? date.getDate() : 1
})
</script>

<template>
  <li
    class="nav-link hover:bg-white/10 rounded-md hover:dark:text-white"
    :class="[
      { 'nav-link-dropdown': links[item].children },
      links[item].class,
      currentPath.includes(links[item].href)
        ? 'dark:text-white'
        : 'text-verse-700 dark:text-verse-300',
    ]"
    :aria-haspopup="links[item].title === 'About' ? 'true' : undefined"
  >
    <Link
      v-if="!links[item].href.includes('https')"
      :class="[
        links[item].title === 'Advent Calendar' &&
          'hidden md:flex text-red-600 dark:text-green-500',
      ]"
      class="flex items-center"
      :href="links[item].href"
    >
      <span
        v-if="currentPath.includes(links[item].href)"
        class="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-verse-700 dark:bg-verse-100"
      />
      <span class="relative z-20 p-2">{{ links[item].title }}</span>
    </Link>

    <a
      v-else
      :class="[
        links[item].title === 'Advent Calendar' &&
          'hidden md:flex text-red-600 dark:text-green-500',
      ]"
      class="flex items-center"
      :href="links[item].href"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="relative z-20 p-2">{{ links[item].title }}</span>
      <svg
        class="w-4 h-4"
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 32 32"
      >
        <path
          fill="currentColor"
          d="M26 28H6a2.003 2.003 0 0 1-2-2V6a2.003 2.003 0 0 1 2-2h9v2H6v20h20v-9h2v9a2.003 2.003 0 0 1-2 2"
        />
        <path
          fill="currentColor"
          d="M21 2v2h5.586l-7.293 7.293l1.414 1.414L28 5.414V11h2V2z"
        />
      </svg>
    </a>

    <a
      v-if="links[item].title === 'Advent Calendar'"
      class="md:hidden text-green-600 relative flex justify-center items-center animate-bounce"
      :href="links[item].href"
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg
        class="w-8 h-8"
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 32 32"
      >
        <path
          fill="currentColor"
          d="M26 4h-4V2h-2v2h-8V2h-2v2H6c-1.1 0-2 .9-2 2v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 22H6V12h20zm0-16H6V6h4v2h2V6h8v2h2V6h4z"
        />
      </svg>
      <div class="text-xs text-red-600 dark:text-red-100 absolute top-1/3">
        {{ today }}
      </div>
    </a>

    <div
      v-if="links[item].children"
      class="menu-dropdown px-2 pb-2 bg-white rounded-md text-black"
    >
      <div class="menu-dropdown-item theme-dark">
        <ul class="flex flex-col gap-2">
          <template v-for="submenu in links[item].children" :key="submenu.href">
            <li :class="submenu.class">
              <Link
                v-if="!submenu.href.includes('https')"
                :href="submenu.href"
                class="hover:bg-verse-100 rounded-md block p-2"
              >
                <div class="flex items-center gap-2">
                  <div class="whitespace-nowrap">
                    {{ submenu.title }}
                  </div>
                </div>
              </Link>
              <a
                v-else
                :href="submenu.href"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:bg-verse-100 rounded-md block p-2"
              >
                <div class="flex items-center gap-2">
                  <div class="whitespace-nowrap">
                    {{ submenu.title }}
                  </div>
                  <svg
                    class="w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 32 32"
                  >
                    <path
                      fill="currentColor"
                      d="M26 28H6a2.003 2.003 0 0 1-2-2V6a2.003 2.003 0 0 1 2-2h9v2H6v20h20v-9h2v9a2.003 2.003 0 0 1-2 2"
                    />
                    <path
                      fill="currentColor"
                      d="M21 2v2h5.586l-7.293 7.293l1.414 1.414L28 5.414V11h2V2z"
                    />
                  </svg>
                </div>
              </a>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </li>
</template>

<style scoped>
.nav-link {
  position: relative;
}

.nav-link:focus-within .menu-dropdown,
.nav-link:hover .menu-dropdown {
  display: block;
  opacity: 1;
  clip-path: circle(100%);
  transform: translateY(0px);
  padding-top: 7px;
  transform-origin: left -100px;
}

.menu-dropdown {
  position: absolute;
  left: 0;
  top: 100%;
  clip-path: circle(0%);
  opacity: 0;
  transform: translateY(-5px);
  transition: 0.2s ease;
}
</style>
