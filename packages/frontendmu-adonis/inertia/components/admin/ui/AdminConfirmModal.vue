<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    confirmVariant?: 'primary' | 'danger'
    loading?: boolean
  }>(),
  {
    description: undefined,
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    confirmVariant: 'danger',
    loading: false,
  }
)

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()

const confirmButton = ref<HTMLButtonElement | null>(null)

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open && !props.loading) emit('cancel')
}

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) {
      nextTick(() => confirmButton.value?.focus())
    }
  }
)

onMounted(() => {
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div
          class="absolute inset-0 bg-verse-950/60 backdrop-blur-sm"
          @click="!loading && emit('cancel')"
        />
        <div
          class="relative w-full sm:max-w-md bg-white dark:bg-verse-900 squircle rounded-2xl border border-verse-200 dark:border-verse-800 shadow-xl"
        >
          <div class="p-5 sm:p-6">
            <h3 class="text-lg font-semibold text-verse-900 dark:text-verse-50">{{ title }}</h3>
            <div
              v-if="description || $slots.default"
              class="mt-2 text-sm text-verse-600 dark:text-verse-300"
            >
              <p v-if="description">{{ description }}</p>
              <slot />
            </div>
          </div>
          <div
            class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-5 sm:px-6 pb-5 sm:pb-6"
          >
            <button
              type="button"
              :disabled="loading"
              class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-verse-200 dark:border-verse-700 text-verse-700 dark:text-verse-200 hover:bg-verse-50 dark:hover:bg-verse-800 transition-colors disabled:opacity-50"
              @click="emit('cancel')"
            >
              {{ cancelLabel }}
            </button>
            <button
              ref="confirmButton"
              type="button"
              :disabled="loading"
              :class="[
                'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-verse-900',
                confirmVariant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500/60'
                  : 'bg-verse-900 hover:bg-verse-800 dark:bg-verse-50 dark:text-verse-900 dark:hover:bg-white focus-visible:ring-verse-500/60',
              ]"
              @click="emit('confirm')"
            >
              <span v-if="loading">Working...</span>
              <span v-else>{{ confirmLabel }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
