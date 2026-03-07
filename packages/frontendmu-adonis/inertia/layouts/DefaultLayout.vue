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

watch(
  () => page.props.flash,
  (val) => {
    if (val?.success || val?.error) {
      flash.value = val
      showFlash.value = true
      setTimeout(() => {
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
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="showFlash && (flash.success || flash.error)" class="fixed top-4 right-4 z-[100] max-w-sm">
        <div
          v-if="flash.success"
          class="px-4 py-3 rounded-xl border shadow-lg bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm font-medium"
        >
          {{ flash.success }}
        </div>
        <div
          v-if="flash.error"
          class="px-4 py-3 rounded-xl border shadow-lg bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm font-medium"
        >
          {{ flash.error }}
        </div>
      </div>
    </Transition>

    <slot />

    <SiteFooter />
  </LayoutBackdrop>
</template>
