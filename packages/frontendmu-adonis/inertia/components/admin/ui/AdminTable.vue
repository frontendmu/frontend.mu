<script setup lang="ts">
withDefaults(
  defineProps<{
    columns: { label: string; align?: 'left' | 'right' | 'center'; class?: string }[]
  }>(),
  {}
)
</script>

<template>
  <div
    class="bg-white dark:bg-verse-900/50 squircle rounded-2xl border border-verse-200 dark:border-verse-800 overflow-hidden"
  >
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-verse-50/60 dark:bg-verse-900/70 border-b border-verse-200 dark:border-verse-800">
          <tr>
            <th
              v-for="col in columns"
              :key="col.label"
              :class="[
                'px-5 py-2.5 text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-verse-500 dark:text-verse-300',
                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                col.class,
              ]"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-verse-100 dark:divide-verse-800">
          <slot />
        </tbody>
      </table>
    </div>
    <slot name="footer" />
  </div>
</template>
