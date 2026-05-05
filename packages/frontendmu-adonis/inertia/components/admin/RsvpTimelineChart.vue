<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface Props {
  rsvpedAtList: string[]
  rsvpOpenAt: string | null
  rsvpCloseAt: string | null
  eventAt: string | null
  seatsAvailable?: number | null
  bare?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  seatsAvailable: null,
  bare: false,
})

const HEIGHT = 220
const PADDING = { top: 16, right: 8, bottom: 32, left: 8 }
const FALLBACK_WIDTH = 800

const svgEl = ref<SVGSVGElement | null>(null)
const measuredWidth = ref(FALLBACK_WIDTH)

const WIDTH = computed(() => measuredWidth.value)
const plotWidth = computed(() => WIDTH.value - PADDING.left - PADDING.right)
const plotHeight = HEIGHT - PADDING.top - PADDING.bottom

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!svgEl.value || typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const w = entry.contentRect.width
      if (w > 0) measuredWidth.value = w
    }
  })
  resizeObserver.observe(svgEl.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

const series = computed(() => {
  const stamps = props.rsvpedAtList
    .map((iso) => new Date(iso).getTime())
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b)
  return stamps
})

const now = Date.now()

const domain = computed(() => {
  const candidates: number[] = [now]
  if (props.rsvpOpenAt) candidates.push(new Date(props.rsvpOpenAt).getTime())
  if (props.rsvpCloseAt) candidates.push(new Date(props.rsvpCloseAt).getTime())
  if (props.eventAt) candidates.push(new Date(props.eventAt).getTime())
  if (series.value.length) {
    candidates.push(series.value[0])
    candidates.push(series.value[series.value.length - 1])
  }
  if (!candidates.length) return null

  const min = Math.min(...candidates)
  const max = Math.max(...candidates)
  if (min === max) {
    const oneHour = 3600 * 1000
    return { min: min - oneHour, max: max + oneHour }
  }
  return { min, max }
})

const yMax = computed(() =>
  Math.max(1, series.value.length, props.seatsAvailable ?? 0)
)

function xFor(timestamp: number) {
  if (!domain.value) return PADDING.left
  const { min, max } = domain.value
  return PADDING.left + ((timestamp - min) / (max - min)) * plotWidth.value
}

function yFor(value: number) {
  return PADDING.top + plotHeight - (value / yMax.value) * plotHeight
}

const pastSeries = computed(() => series.value.filter((ts) => ts <= now))
const futureSeries = computed(() => series.value.filter((ts) => ts > now))

const linePastPath = computed(() => {
  if (!domain.value) return ''
  const startX = xFor(domain.value.min)
  const nowX = xFor(now)
  if (nowX <= startX) return ''
  const points: string[] = [`M ${startX} ${yFor(0)}`]
  let count = 0
  for (const ts of pastSeries.value) {
    const x = xFor(ts)
    points.push(`L ${x} ${yFor(count)}`)
    count += 1
    points.push(`L ${x} ${yFor(count)}`)
  }
  points.push(`L ${nowX} ${yFor(count)}`)
  return points.join(' ')
})

const lineFuturePath = computed(() => {
  if (!domain.value) return ''
  const nowX = xFor(now)
  const endX = xFor(domain.value.max)
  if (endX <= nowX) return ''
  let count = pastSeries.value.length
  const points: string[] = [`M ${nowX} ${yFor(count)}`]
  for (const ts of futureSeries.value) {
    const x = xFor(ts)
    points.push(`L ${x} ${yFor(count)}`)
    count += 1
    points.push(`L ${x} ${yFor(count)}`)
  }
  points.push(`L ${endX} ${yFor(count)}`)
  return points.join(' ')
})

const areaPath = computed(() => {
  if (!linePastPath.value || !domain.value) return ''
  const baseline = yFor(0)
  const startX = xFor(domain.value.min)
  const nowX = xFor(now)
  return `${linePastPath.value} L ${nowX} ${baseline} L ${startX} ${baseline} Z`
})

interface Marker {
  label: string
  timestamp: number
  color: string
  align: 'start' | 'end'
}

const markers = computed<Marker[]>(() => {
  const out: Marker[] = []
  if (props.rsvpCloseAt) {
    out.push({
      label: 'RSVP close',
      timestamp: new Date(props.rsvpCloseAt).getTime(),
      color: 'var(--color-coral-deep)',
      align: 'start',
    })
  }
  if (props.eventAt) {
    out.push({
      label: 'Event',
      timestamp: new Date(props.eventAt).getTime(),
      color: '#10b981',
      align: 'end',
    })
  }
  if (domain.value) {
    const midpoint = domain.value.min + (domain.value.max - domain.value.min) / 2
    out.push({
      label: 'Today',
      timestamp: now,
      color: 'var(--color-coral-strong)',
      align: now > midpoint ? 'end' : 'start',
    })
  }
  return out
})

function fmtAxisDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })
}

const yTicks = computed(() => {
  const max = yMax.value
  const stepCount = max <= 4 ? max : 4
  const step = Math.ceil(max / stepCount)
  const ticks: number[] = []
  for (let v = 0; v <= max; v += step) ticks.push(v)
  if (ticks[ticks.length - 1] !== max) ticks.push(max)
  return ticks
})

const xTicks = computed(() => {
  if (!domain.value) return []
  const { min, max } = domain.value
  return [min, min + (max - min) / 2, max]
})
</script>

<template>
  <div
    v-if="series.length || domain"
    :class="
      bare
        ? ''
        : 'bg-white dark:bg-verse-800/50 squircle rounded-xl border border-verse-200 dark:border-verse-700 p-4 mb-6'
    "
  >
    <div class="flex items-start justify-between mb-3 flex-wrap gap-x-4 gap-y-2">
      <h3
        v-if="!bare"
        class="text-sm font-semibold text-verse-900 dark:text-verse-100"
      >
        RSVP timeline
      </h3>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-gray-500 dark:text-gray-300">
        <span
          v-for="m in markers"
          :key="m.label"
          class="inline-flex items-center gap-1.5"
        >
          <span
            class="inline-block w-2 h-2 rounded-full"
            :style="{ backgroundColor: m.color }"
          />
          {{ m.label }}
        </span>
      </div>
    </div>

    <svg
      ref="svgEl"
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      class="w-full block h-56"
      role="img"
      aria-label="Cumulative RSVPs over time"
    >
      <!-- Y-axis grid + inline labels -->
      <g class="text-gray-400 dark:text-verse-300" font-size="9" font-family="var(--font-mono)" letter-spacing="1.2">
        <g v-for="tick in yTicks" :key="`y-${tick}`">
          <line
            :x1="PADDING.left"
            :x2="WIDTH - PADDING.right"
            :y1="yFor(tick)"
            :y2="yFor(tick)"
            stroke="currentColor"
            stroke-opacity="0.12"
          />
          <text
            :x="PADDING.left + 2"
            :y="yFor(tick) - 4"
            text-anchor="start"
            fill="currentColor"
            opacity="0.7"
          >
            {{ tick }}
          </text>
        </g>
      </g>

      <!-- X-axis baseline -->
      <line
        :x1="PADDING.left"
        :x2="WIDTH - PADDING.right"
        :y1="HEIGHT - PADDING.bottom"
        :y2="HEIGHT - PADDING.bottom"
        class="text-gray-300 dark:text-verse-600"
        stroke="currentColor"
        stroke-width="1"
      />

      <!-- X-axis tick labels -->
      <g class="text-gray-500 dark:text-gray-300" font-size="9" font-family="var(--font-mono)" letter-spacing="1.2">
        <text
          v-for="(tick, i) in xTicks"
          :key="`x-${tick}`"
          :x="xFor(tick)"
          :y="HEIGHT - PADDING.bottom + 16"
          :text-anchor="i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'"
          fill="currentColor"
        >
          {{ fmtAxisDate(tick).toUpperCase() }}
        </text>
      </g>

      <!-- Capacity line -->
      <g v-if="seatsAvailable && seatsAvailable > 0">
        <line
          :x1="PADDING.left"
          :x2="WIDTH - PADDING.right"
          :y1="yFor(seatsAvailable)"
          :y2="yFor(seatsAvailable)"
          stroke="var(--color-coral-deep)"
          stroke-width="1"
          stroke-dasharray="2 4"
          opacity="0.55"
        />
        <text
          :x="WIDTH - PADDING.right - 4"
          :y="yFor(seatsAvailable) - 3"
          text-anchor="end"
          font-size="9"
          font-family="var(--font-mono)"
          letter-spacing="1.2"
          fill="var(--color-coral-deep)"
          font-weight="600"
          opacity="0.75"
        >
          CAPACITY · {{ seatsAvailable }}
        </text>
      </g>

      <!-- Area fill under line -->
      <path
        v-if="areaPath"
        :d="areaPath"
        fill="var(--color-verse-500)"
        fill-opacity="0.12"
      />

      <!-- Past line (solid) -->
      <path
        v-if="linePastPath"
        :d="linePastPath"
        fill="none"
        stroke="var(--color-verse-500)"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />

      <!-- Future line (dashed, faded — projection from now to end) -->
      <path
        v-if="lineFuturePath"
        :d="lineFuturePath"
        fill="none"
        stroke="var(--color-verse-500)"
        stroke-width="1.25"
        stroke-dasharray="4 4"
        stroke-linejoin="round"
        stroke-linecap="round"
        opacity="0.45"
      />

      <!-- Markers -->
      <g v-for="m in markers" :key="`marker-${m.label}`">
        <line
          :x1="xFor(m.timestamp)"
          :x2="xFor(m.timestamp)"
          :y1="PADDING.top"
          :y2="HEIGHT - PADDING.bottom"
          :stroke="m.color"
          stroke-width="1"
          :stroke-dasharray="m.label === 'Today' ? '0' : '3 3'"
          opacity="0.7"
        />
        <text
          :transform="`translate(${xFor(m.timestamp) + (m.align === 'start' ? 14 : -6)}, ${HEIGHT - PADDING.bottom - 6}) rotate(-90)`"
          text-anchor="start"
          font-size="9"
          font-family="var(--font-mono)"
          letter-spacing="1.2"
          :fill="m.color"
          font-weight="600"
        >
          {{ m.label.toUpperCase() }}
        </text>
      </g>
    </svg>

    <p
      v-if="!series.length"
      class="text-center text-xs text-verse-500 dark:text-verse-300 mt-2"
    >
      No RSVPs yet — markers shown for reference.
    </p>
  </div>
</template>
