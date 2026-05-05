<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    padded?: boolean
    interactive?: boolean
  }>(),
  {
    title: undefined,
    description: undefined,
    padded: true,
    interactive: false,
  }
)
</script>

<template>
  <div
    :class="[
      'bg-white dark:bg-verse-900/50 squircle rounded-2xl border border-verse-200 dark:border-verse-800',
      interactive && 'hover:border-verse-300 dark:hover:border-verse-700 transition-colors',
    ]"
  >
    <div
      v-if="title || $slots.header"
      class="flex flex-wrap items-start justify-between gap-3 px-5 sm:px-6 pt-5 sm:pt-6"
      :class="!$slots.default && !padded ? 'pb-5 sm:pb-6' : ''"
    >
      <div class="min-w-0">
        <h2 v-if="title" class="text-base font-semibold text-verse-900 dark:text-verse-50">
          {{ title }}
        </h2>
        <p v-if="description" class="text-sm text-verse-500 dark:text-verse-400 mt-1">
          {{ description }}
        </p>
        <slot name="header" />
      </div>
      <div v-if="$slots.headerActions" class="shrink-0">
        <slot name="headerActions" />
      </div>
    </div>

    <div
      v-if="$slots.default"
      :class="[
        padded ? 'px-5 sm:px-6 pb-5 sm:pb-6' : '',
        (title || $slots.header) && padded ? 'pt-4' : padded ? 'pt-5 sm:pt-6' : '',
      ]"
    >
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-verse-100 dark:border-verse-800"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
