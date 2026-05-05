<script setup lang="ts">
interface Stat {
  label: string
  value: string | number
  hint?: string
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

withDefaults(
  defineProps<{
    stats: Stat[]
  }>(),
  {}
)

const toneClasses: Record<NonNullable<Stat['tone']>, string> = {
  default: 'text-verse-900 dark:text-verse-50',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400',
  info: 'text-coral-deep dark:text-coral-strong',
}
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="bg-white dark:bg-verse-900/50 squircle rounded-2xl border border-verse-200 dark:border-verse-800 px-4 py-4 sm:px-5 sm:py-5"
    >
      <div class="text-[11px] font-mono uppercase tracking-[0.14em] text-verse-500 dark:text-verse-300">
        {{ stat.label }}
      </div>
      <div
        :class="[
          'mt-1.5 text-3xl font-display tracking-tight',
          toneClasses[stat.tone ?? 'default'],
        ]"
      >
        {{ stat.value }}
      </div>
      <p v-if="stat.hint" class="mt-1 text-xs text-verse-500 dark:text-verse-300">
        {{ stat.hint }}
      </p>
    </div>
  </div>
</template>
