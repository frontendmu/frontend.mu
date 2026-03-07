<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePage } from '@inertiajs/vue3'
import LayoutBackdrop from '~/components/layout/LayoutBackdrop.vue'
import SiteNavigation from '~/components/layout/Navigation.vue'
import SiteFooter from '~/components/layout/Footer.vue'
import type { SharedProps } from '~/types'

const page = usePage<SharedProps>()
const flash = ref<{ success?: string; error?: string }>({})
const showFlash = ref(false)
let flashTimer: ReturnType<typeof setTimeout> | null = null

function dismiss() {
  showFlash.value = false
}

watch(
  () => page.props.flash,
  (val) => {
    if (val?.success || val?.error) {
      flash.value = val
      showFlash.value = true
      if (flashTimer) clearTimeout(flashTimer)
      flashTimer = setTimeout(() => {
        showFlash.value = false
      }, 5000)
    }
  },
  { immediate: true }
)
</script>

<template>
  <LayoutBackdrop>
    <SiteNavigation />

    <!-- Flash notifications -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div v-if="showFlash && (flash.success || flash.error)" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
          <div
            class="flex items-center gap-3 pl-4 pr-2 py-2.5 rounded-lg border text-sm shadow-sm"
            :class="flash.success
              ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100'
              : 'bg-white dark:bg-gray-900 border-red-300 dark:border-red-900 text-gray-900 dark:text-gray-100'"
          >
            <!-- Icon -->
            <svg v-if="flash.success" class="w-4 h-4 shrink-0 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>

            <span class="whitespace-nowrap">{{ flash.success || flash.error }}</span>

            <button @click="dismiss" class="ml-1 p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Dismiss">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <slot />

    <SiteFooter />
  </LayoutBackdrop>
</template>
