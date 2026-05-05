<script setup lang="ts">
interface Chip {
  key: string
  label: string
  count?: number
}

withDefaults(
  defineProps<{
    chips: Chip[]
    modelValue: string
    ariaLabel?: string
  }>(),
  {
    ariaLabel: 'Filter',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div :aria-label="ariaLabel" role="group" class="flex flex-wrap gap-1.5">
    <button
      v-for="chip in chips"
      :key="chip.key"
      type="button"
      :aria-pressed="modelValue === chip.key"
      :class="[
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
        modelValue === chip.key
          ? 'bg-verse-900 dark:bg-verse-50 border-verse-900 dark:border-verse-50 text-white dark:text-verse-900'
          : 'bg-white dark:bg-verse-900/40 border-verse-200 dark:border-verse-800 text-verse-700 dark:text-verse-200 hover:border-verse-400 dark:hover:border-verse-600',
      ]"
      @click="emit('update:modelValue', chip.key)"
    >
      <span>{{ chip.label }}</span>
      <span
        v-if="chip.count !== undefined"
        :class="[
          'inline-flex items-center justify-center min-w-[1.25rem] px-1 text-[10px] font-mono rounded-full',
          modelValue === chip.key
            ? 'bg-white/20 dark:bg-verse-900/20 text-white dark:text-verse-900'
            : 'bg-verse-100 dark:bg-verse-800 text-verse-500 dark:text-verse-300',
        ]"
      >
        {{ chip.count }}
      </span>
    </button>
  </div>
</template>
