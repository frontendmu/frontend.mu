<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

interface Crumb {
  label: string
  href?: string
}

defineProps<{
  trail: Crumb[]
}>()
</script>

<template>
  <nav aria-label="Breadcrumb" class="mono-eyebrow flex flex-wrap items-center gap-2">
    <template v-for="(crumb, index) in trail" :key="`${index}-${crumb.label}`">
      <Link
        v-if="crumb.href && index < trail.length - 1"
        :href="crumb.href"
        class="hover:text-verse-700 dark:hover:text-verse-200 transition-colors"
      >
        {{ crumb.label }}
      </Link>
      <span v-else class="text-verse-700 dark:text-verse-200">{{ crumb.label }}</span>
      <span v-if="index < trail.length - 1" class="sep" aria-hidden="true">/</span>
    </template>
  </nav>
</template>
