<script setup lang="ts">
import { getGithubUrl, vTransitionName } from '@/utils/helpers'
import type { Session } from '@/utils/types'

const props = defineProps({
  sessions: {
    type: Array as PropType<Array<Session>>,
    required: true,
  },
})

function getSpeakerPhoto(githubAccount: string) {
  return getGithubUrl(githubAccount)
}
</script>

<template>
  <div class="py-8 flex flex-col gap-3">
    <div class="text-base uppercase text-verse-900 dark:text-verse-300 font-semibold">
      Agenda
    </div>
    <ul role="list" class="flex flex-col gap-6">
      <li v-for="(session, index) in sessions" :key="index" class="flex flex-row items-center sm:items-start gap-5 lg:gap-10 relative">
        <img
          class="h-16 sm:h-20 w-16 sm:w-20 rounded-full lg:h-24 lg:w-24"
          :src="getSpeakerPhoto(session.Session_id.speakers.github_account)" :alt="session.Session_id.speakers.name"
          :title="session.Session_id.speakers.name" width="300" height="300"
          :style="vTransitionName(session?.Session_id.speakers?.name, 'photo')"
        >

        <div>
          <h3 class="font-heading text-xs font-medium sm:text-sm md:text-base lg:text-xl text-verse-500 dark:text-verse-400">
            {{ session.Session_id.speakers.name }}
          </h3>
          <p class="text-sm font-bold sm:text-base md:text-lg lg:text-2xl text-verse-800 dark:text-verse-200">
            {{ session.Session_id.title }}
          </p>
          <NuxtLink
            v-if="session.Session_id.deck"
            :href="session.Session_id.deck"
            target="_blank"
            rel="noopener noreferrer nofollow"
            class="w-fit flex flex-row items-center gap-1 py-2 sticky z-[1] text-xs sm:text-sm md:text-base lg:text-lg underline"
          >
            <Icon name="bx:slideshow" class="w-3 sm:w-4 lg:w-5 h-3 sm:h-4 lg:h-5" />
            View slides
          </NuxtLink>
        </div>

        <NuxtLink
          :href="`/speaker/${session.Session_id.speakers.id}`" class="absolute inset-0"
          :title="`Speaker name: ${session.Session_id.speakers.name}`"
        >
          <span class="sr-only">{{ session.Session_id.speakers.name }}</span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
