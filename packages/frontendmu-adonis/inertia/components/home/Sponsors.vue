<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import type { SponsorSummaryDto } from '~/types'

interface Props {
  sponsors: SponsorSummaryDto[]
}

const props = defineProps<Props>()

// Build honeycomb rows, distributing sponsors with empty gaps
const grid = computed(() => {
  const rowSizes = [9, 8, 9]
  const result: { sponsor: SponsorSummaryDto | null }[][] = []
  let idx = 0

  for (let r = 0; r < rowSizes.length; r++) {
    const row: { sponsor: SponsorSummaryDto | null }[] = []
    for (let c = 0; c < rowSizes[r]; c++) {
      // Spread sponsors across the grid with gaps
      const fill = (r + c) % 2 === 0 && idx < props.sponsors.length
      row.push({ sponsor: fill ? props.sponsors[idx++] : null })
    }
    result.push(row)
  }

  // If we still have sponsors, fill remaining empty cells
  for (let r = 0; r < result.length && idx < props.sponsors.length; r++) {
    for (let c = 0; c < result[r].length && idx < props.sponsors.length; c++) {
      if (!result[r][c].sponsor) {
        result[r][c].sponsor = props.sponsors[idx++]
      }
    }
  }

  return result
})
</script>

<template>
  <section v-if="sponsors.length > 0" class="relative py-16 overflow-hidden">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
      <div class="flex items-center justify-between">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">Trusted by</p>
        <Link href="/sponsors" class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 hover:text-verse-500 dark:hover:text-verse-400 transition-colors">
          View all
        </Link>
      </div>
    </div>

    <!-- Honeycomb Grid -->
    <div class="hex-grid">
      <div
        v-for="(row, rowIdx) in grid"
        :key="rowIdx"
        class="hex-row"
        :class="{ 'hex-row--offset': rowIdx % 2 === 1 }"
      >
        <template v-for="(cell, colIdx) in row" :key="colIdx">
          <Link
            v-if="cell.sponsor"
            :href="`/sponsor/${cell.sponsor.id}`"
            class="hex-cell hex-cell--filled"
            :class="cell.sponsor.darkbg ? 'hex-cell--dark' : ''"
          >
            <img
              v-if="cell.sponsor.logoUrl"
              :src="cell.sponsor.logoUrl"
              :alt="cell.sponsor.name"
              class="hex-logo"
            />
            <span v-else class="hex-name" :class="cell.sponsor.darkbg ? 'text-white' : ''">
              {{ cell.sponsor.name }}
            </span>
          </Link>
          <div v-else class="hex-cell hex-cell--empty" />
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hex-grid {
  --hex-size: 120px;
  --hex-gap: 6px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--hex-gap) - var(--hex-size) * 0.25);
}

.hex-row {
  display: flex;
  gap: var(--hex-gap);
}

.hex-row--offset {
  margin-top: calc(var(--hex-size) * -0.125);
}

.hex-cell {
  width: var(--hex-size);
  height: calc(var(--hex-size) * 1.1547);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.hex-cell--empty {
  background: #f5f5f5;
}

:is(.dark) .hex-cell--empty {
  background: rgba(255, 255, 255, 0.03);
}

.hex-cell--filled {
  background: white;
  cursor: pointer;
}

.hex-cell--filled:hover {
  transform: scale(1.08);
  z-index: 1;
}

.hex-cell--filled.hex-cell--dark {
  background: #111827;
}

:is(.dark) .hex-cell--filled:not(.hex-cell--dark) {
  background: white;
}

.hex-logo {
  max-width: 60%;
  max-height: 32px;
  object-fit: contain;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.hex-cell--filled:hover .hex-logo {
  opacity: 1;
}

.hex-name {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-align: center;
  padding: 0 8px;
  color: #111827;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.hex-cell--filled:hover .hex-name {
  opacity: 1;
}

/* Responsive hex sizing */
@media (max-width: 1024px) {
  .hex-grid {
    --hex-size: 100px;
  }
}

@media (max-width: 768px) {
  .hex-grid {
    --hex-size: 80px;
  }
}

@media (max-width: 480px) {
  .hex-grid {
    --hex-size: 64px;
  }

  .hex-logo {
    max-height: 20px;
  }

  .hex-name {
    font-size: 8px;
  }
}
</style>
