<script setup lang="ts">
const { links, item } = defineProps<Props>()

const currentPath = computed(() => useRoute().path)

const today = computed(() => {
  const date = new Date()
  const month = date.getMonth()
  // Only show date during December, otherwise show 1
  return month === 11 ? date.getDate() : 1
})

interface TMenuItem {
  title: string
  href: string
  class?: string
  children?: TMenuItem[]
}

interface TMenu {
  [key: string]: TMenuItem
}

interface Props {
  links: TMenu
  item: string
}
</script>

<template>
  <li class="nav-link hover:bg-white/10 rounded-md hover:dark:text-white " :class="[
    { 'nav-link-dropdown': links[item].children },
    links[item].class,
    currentPath.includes(links[item].href) ? 'dark:text-white' : 'text-verse-700 dark:text-verse-300',
  ]" :aria-haspopup="links[item].title === 'About' ? 'true' : undefined">
    <NuxtLink :class="[links[item].title === 'Advent Calendar' && 'hidden md:flex text-red-600 dark:text-green-500']"
      class="flex items-center" :href="links[item].href"
      :target="!!links[item].href.includes(&quot;https&quot;) ? &quot;_blank&quot; : &quot;_self&quot;">
      <span v-if="currentPath.includes(links[item].href)" :style="vTransitionName('menu-border', 'global')"
        class="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-verse-700 dark:bg-verse-100" />

      <span class="relative z-20  p-2">{{ links[item].title }}</span>

      <Icon v-if="!!links[item].href.includes(&quot;https&quot;)" name="carbon:launch" height="1em" />
    </NuxtLink>

    <NuxtLink v-if="links[item].title === 'Advent Calendar'"
      class="md:hidden text-green-600 relative flex justify-center items-center animate-bounce" :href="links[item].href"
      :target="!!links[item].href.includes(&quot;https&quot;) ? &quot;_blank&quot; : &quot;_self&quot;">
      <Icon name="carbon:calendar" class="w-8 h-8" />
      <div class="text-xs text-red-600 dark:text-red-100 absolute top-1/3 ">
        {{ today }}
      </div>
    </NuxtLink>
    <div v-if="links[item].children" class="menu-dropdown px-2 pb-2 bg-white rounded-md text-black">
      <div class="menu-dropdown-item  theme-dark">
        <ul class="flex flex-col gap-2">
          <template v-for="submenu in links[item].children" :key="submenu">
            <li class:list="[submenu.class]">
              <NuxtLink :href="submenu.href"
                :target="!!submenu.href.includes(&quot;https&quot;) ? &quot;_blank&quot; : &quot;_self&quot;"
                class="hover:bg-verse-100 rounded-md block p-2">
                <div class="flex items-center gap-2">
                  <div class="whitespace-nowrap">
                    {{ submenu.title }}
                  </div>
                  <Icon v-if="!!submenu.href.includes(&quot;https&quot;)" name="carbon:launch" class="w-4 h-4" />
                </div>
              </NuxtLink>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </li>
</template>

<style scoped lang="postcss">
.nav-link {
  position: relative;

  &:focus-within,
  &:hover {

    .menu-dropdown {
      display: block;
      opacity: 1;
      clip-path: circle(100%);
      transform: translateY(0px);
      padding-top: 7px;
      transform-origin: left -100px;
    }
  }

  .menu-dropdown {
    position: absolute;
    left: 0;
    top: 100%;
    clip-path: circle(0%);
    /* left: 50%; */
    opacity: 0;
    transform: translateY(-5px);
    transition: 0.2s ease;
  }
}
</style>
