<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
  }>(),
  {
    description: undefined,
  }
)
</script>

<template>
  <header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-8">
    <div class="min-w-0 flex items-start gap-4">
      <div v-if="$slots.media" class="shrink-0">
        <slot name="media" />
      </div>
      <div class="min-w-0">
        <h1
          class="font-display text-3xl sm:text-4xl text-verse-900 dark:text-verse-50 leading-tight tracking-tight"
        >
          {{ title }}
        </h1>
        <p v-if="description" class="text-verse-500 dark:text-verse-400 mt-2 max-w-2xl">
          {{ description }}
        </p>
        <div v-if="$slots.meta" class="mt-3">
          <slot name="meta" />
        </div>
      </div>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap gap-2 shrink-0">
      <slot name="actions" />
    </div>
  </header>
</template>
