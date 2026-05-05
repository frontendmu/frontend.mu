<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

interface Props {
  open: boolean
  loading?: boolean
  error?: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [phone: string]
  close: []
}>()

const phone = ref('')
const dialog = ref<HTMLElement | null>(null)
const phoneInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      phone.value = ''
      await nextTick()
      phoneInput.value?.focus()
    }
  }
)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !props.loading) {
    event.preventDefault()
    emit('close')
  }
}

function onBackdropClick() {
  if (!props.loading) emit('close')
}

function onSubmit() {
  const trimmed = phone.value.trim()
  if (!trimmed || props.loading) return
  emit('submit', trimmed)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[80] flex items-end md:items-center justify-center"
        @keydown="onKeydown"
      >
        <button
          type="button"
          class="absolute inset-0 w-full h-full bg-black/55 backdrop-blur-sm cursor-default"
          aria-label="Close dialog"
          @click="onBackdropClick"
        />

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-8 opacity-0 md:translate-y-4 md:scale-95"
          enter-to-class="translate-y-0 opacity-100 md:scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100 md:scale-100"
          leave-to-class="translate-y-8 opacity-0 md:translate-y-4 md:scale-95"
          appear
        >
          <div
            v-if="open"
            ref="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rsvp-phone-title"
            aria-describedby="rsvp-phone-desc"
            class="relative w-full md:max-w-md md:mx-4 bg-white dark:bg-verse-950 border border-gray-200 dark:border-verse-800 rounded-t-2xl md:rounded-2xl shadow-2xl"
            style="padding-bottom: env(safe-area-inset-bottom)"
          >
            <div class="px-5 pt-5 pb-4 md:p-6">
              <!-- Mobile drag handle -->
              <div
                aria-hidden="true"
                class="md:hidden mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-200 dark:bg-verse-800"
              />

              <h2
                id="rsvp-phone-title"
                class="text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                One last thing
              </h2>
              <p
                id="rsvp-phone-desc"
                class="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed"
              >
                The organizers require your phone number to contact you via Whatsapp message if the event details change.
              </p>

              <form @submit.prevent="onSubmit" class="mt-5 space-y-4">
                <div class="space-y-1.5">
                  <label
                    for="rsvp-phone-input"
                    class="block text-xs font-medium text-gray-600 dark:text-gray-400"
                  >
                    Phone number
                  </label>
                  <input
                    id="rsvp-phone-input"
                    ref="phoneInput"
                    v-model="phone"
                    type="tel"
                    inputmode="tel"
                    autocomplete="tel"
                    required
                    minlength="7"
                    maxlength="20"
                    pattern="^\+?[0-9 \-()]+$"
                    placeholder="+230 5 123 4567"
                    :disabled="loading"
                    class="w-full px-4 py-3 bg-white dark:bg-verse-900/60 border border-gray-200 dark:border-verse-800 rounded-xl text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-verse-500/40 focus:border-verse-500 disabled:opacity-60 transition-colors"
                  />
                  <p
                    v-if="error"
                    role="alert"
                    class="text-xs text-red-600 dark:text-red-400"
                  >
                    {{ error }}
                  </p>
                  <p v-else class="text-[11px] text-gray-400 dark:text-gray-500">
                    You can edit this anytime from your profile.
                  </p>
                </div>

                <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
                  <button
                    type="button"
                    :disabled="loading"
                    class="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-verse-900 hover:bg-gray-200 dark:hover:bg-verse-800 rounded-xl transition-colors disabled:opacity-50"
                    @click="$emit('close')"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="loading || !phone.trim()"
                    class="px-4 py-2.5 text-sm font-semibold text-white bg-verse-600 hover:bg-verse-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ loading ? 'Saving…' : 'Save and RSVP' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
