<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: string
  }>(),
  {
    description: undefined,
    icon: undefined,
  }
)
</script>

<template>
  <div class="px-6 py-16 text-center">
    <div
      v-if="icon || $slots.icon"
      class="mx-auto mb-4 w-12 h-12 rounded-2xl bg-verse-100 dark:bg-verse-800 flex items-center justify-center text-verse-400"
    >
      <slot name="icon">
        <svg
          v-if="icon"
          class="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="icon" />
        </svg>
      </slot>
    </div>
    <h3 class="text-base font-semibold text-verse-900 dark:text-verse-100">{{ title }}</h3>
    <p
      v-if="description"
      class="mt-1.5 text-sm text-verse-500 dark:text-verse-300 max-w-md mx-auto"
    >
      {{ description }}
    </p>
    <div v-if="$slots.actions" class="mt-5 flex flex-wrap justify-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
