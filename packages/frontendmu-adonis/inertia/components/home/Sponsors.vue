<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import type { Data } from '@generated/data'

interface Props {
  sponsors: Data.Sponsor.Variants['summary'][]
}

const props = defineProps<Props>()

// Build honeycomb rows wide enough to fill the viewport
const grid = computed(() => {
  const cols = 15
  const rowSizes = [cols, cols - 1, cols]
  const result: { sponsor: Data.Sponsor.Variants['summary'] | null }[][] = []
  let idx = 0

  for (let r = 0; r < rowSizes.length; r++) {
    const row: { sponsor: Data.Sponsor.Variants['summary'] | null }[] = []
    for (let c = 0; c < rowSizes[r]; c++) {
      const fill = (r + c) % 2 === 0 && idx < props.sponsors.length
      row.push({ sponsor: fill ? props.sponsors[idx++] : null })
    }
    result.push(row)
  }

  // Fill remaining empty cells with leftover sponsors
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
  <section v-if="sponsors.length > 0" class="relative py-16 overflow-x-clip">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
      <div class="flex items-center justify-between">
        <p class="text-xs font-semibold text-gray-400 dark:text-gray-500">Trusted by</p>
        <Link
          href="/sponsors"
          class="text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-verse-500 dark:hover:text-verse-400 transition-colors"
        >
          View all
        </Link>
      </div>
    </div>

    <!-- Honeycomb Grid -->
    <div class="hex-grid">
      <div v-for="(row, rowIdx) in grid" :key="rowIdx" class="hex-row">
        <template v-for="(cell, colIdx) in row" :key="colIdx">
          <Link
            v-if="cell.sponsor"
            :href="`/sponsor/${cell.sponsor.id}`"
            class="hex-cell hex-cell--filled hex-wave"
            :style="
              { '--hex-fill': cell.sponsor.logoBg || undefined, '--wave-i': rowIdx + colIdx } as any
            "
          >
            <img
              v-if="cell.sponsor.logoUrl"
              :src="cell.sponsor.logoUrl"
              :alt="cell.sponsor.name"
              class="hex-logo"
            />
            <span
              v-else
              class="hex-name"
              :class="cell.sponsor.logoBg && cell.sponsor.logoBg !== '#ffffff' ? 'text-white' : ''"
            >
              {{ cell.sponsor.name }}
            </span>
          </Link>
          <div
            v-else
            class="hex-cell hex-cell--empty hex-wave"
            :style="{ '--wave-i': rowIdx + colIdx } as any"
          />
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hex-grid {
  --hex-size: 140px;
  --hex-gap: 6px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  width: 100vw;
  margin-left: 50%;
  transform: translateX(-50%);
}

.hex-row {
  display: flex;
  gap: calc(var(--hex-size) * 0.12);
}

.hex-row + .hex-row {
  margin-top: calc(var(--hex-size) * -0.14);
}

.hex-cell {
  width: var(--hex-size);
  height: calc(var(--hex-size) * 1.1547);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.hex-cell--empty {
  background: #f0f0f0;
}

:is(.dark) .hex-cell--empty {
  background: rgba(255, 255, 255, 0.03);
}

.hex-cell--filled {
  background: rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.hex-cell--filled::after {
  content: '';
  position: absolute;
  inset: 1px;
  background: var(--hex-fill, #f7f7f7);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  z-index: -1;
}

:is(.dark) .hex-cell--filled {
  background: rgba(255, 255, 255, 0.1);
}

:is(.dark) .hex-cell--filled::after {
  background: var(--hex-fill, rgba(255, 255, 255, 0.04));
}

.hex-cell--filled:hover {
  z-index: 1;
}

.hex-logo {
  width: 70%;
  height: 40%;
  object-fit: contain;
}

.hex-name {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-align: center;
  padding: 0 8px;
  color: #111827;
}

/* Wave animation */
.hex-wave {
  animation: hex-wave 6s ease-in-out infinite;
  animation-delay: calc(var(--wave-i) * 0.15s);
  transition: transform 0.4s ease;
}

@keyframes hex-wave {
  0%,
  100% {
    transform: translateY(0);
  }
  15% {
    transform: translateY(-4px);
  }
  30% {
    transform: translateY(0);
  }
}

.hex-grid:hover .hex-wave {
  animation: hex-wave-hard 3s ease-in-out infinite;
  animation-delay: calc(var(--wave-i) * 0.1s);
}

@keyframes hex-wave-hard {
  0%,
  100% {
    transform: translateY(0);
  }
  15% {
    transform: translateY(-10px);
  }
  30% {
    transform: translateY(0);
  }
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
