<script setup lang="ts">
import type { Meetup } from '../utils/types'

interface Props {
  month: string
  meetup: Meetup | null
  isInFuture: boolean
}

const props = defineProps<Props>()

const hasSponsor = computed(() =>
  props.meetup?.sponsors && props.meetup.sponsors.length > 0,
)

const sponsor = computed(() =>
  hasSponsor.value ? props.meetup?.sponsors[0].Sponsor_id : null,
)

const hasMeetup = computed(() =>
  props.meetup !== null,
)

const hasMeetupInFuture = computed(() =>
  props.isInFuture && props.meetup !== null,
)

const disabledMonth = computed(() =>
  !hasMeetup.value,
)

const sponsorCTA = computed(() =>
  props.isInFuture && !hasSponsor.value && hasMeetup.value,

)
</script>

<template>
  <div
    class="relative h-full flex flex-col rounded-lg border border-verse-200 dark:border-verse-700 overflow-hidden"
    :class="{
      'cursor-pointer hover:border-verse-400 dark:hover:border-verse-500': hasMeetup || hasMeetupInFuture,
      'bg-verse-50 dark:bg-verse-800': !hasMeetup,
      'opacity-50': disabledMonth,
      'border-red-400': sponsorCTA,
    }"
  >
    <div
      class="p-3 bg-verse-100 dark:bg-verse-700 text-sm font-medium text-center" :class="{
        'bg-red-50 text-red-400': sponsorCTA,
      }"
    >
      {{ props.month }}
    </div>
    <div class="flex-1 grid place-items-center text-center">
      <template v-if="props.meetup && hasSponsor">
        <div class="flex items-center justify-center">
          <img
            :src="`https://directus.coders.mu/assets/${sponsor?.logomark.id}`"
            :alt="sponsor?.Name"
            class="w-full h-full object-contain"
            :class="sponsor?.darkbg ? 'dark:bg-verse-900 bg-gray-500' : 'bg-white'"
          >
          <!-- <template v-else>
            <span class="text-sm text-red-500">
              No Sponsors
            </span>
          </template> -->
        </div>
        <NuxtLink
          :to="`/meetup/${props.meetup.id}`"
          class="absolute inset-0 h-full grid place-items-center text-xs text-center bg-primary-500 hover:bg-primary-600 text-white rounded"
        >
          <span class="sr-only">View meetup</span>
        </NuxtLink>
      </template>
      <template v-else-if="!sponsorCTA">
        <div class="h-full grid place-items-center text-xs text-center bg-primary-500 hover:bg-primary-600 dark:bg-verse-500 dark:hover:bg-verse-600 text-verse-500 rounded">
          No meetup
        </div>
      </template>

      <template v-if="sponsorCTA">
        <div class="h-full grid place-items-center text-xs text-center bg-primary-500 hover:bg-primary-600 dark:bg-verse-500 dark:hover:bg-verse-600 text-verse-500 rounded">
          Sponsor this meetup
        </div>
        <NuxtLink
          to="/sponsor-us#sponsor-cta"
          class="absolute inset-0 "
        >
          <span class="sr-only">Sponsor this meetup</span>
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
