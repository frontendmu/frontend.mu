<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  sessions: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div>
    <ul role="list" class="flex flex-col gap-8 py-8">
      <li v-for="(session, index) in sessions" :key="index" class="relative space-y-4 flex gap-10">
        <span class="sr-only">{{ session.Events_id.title }}</span>
        <div class="space-y-2">
          <div>
            <span class="text-gray-500 font-bold font-mono">
              {{ new Date(session.Events_id.Date).toDateString() }}
            </span>
            <h3 class="text-xs font-medium lg:text-xl text-verse-400">
              {{ session.Events_id.title }}
            </h3>
            <p class="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-verse-500 dark:text-verse-200">
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
        </div>
        <NuxtLink :href="`/meetup/${session.Events_id.id}`" class="absolute inset-0" />
      </li>
    </ul>
  </div>
</template>
