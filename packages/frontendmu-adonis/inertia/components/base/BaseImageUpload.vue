<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'

interface Props {
  modelValue: File | null
  currentUrl?: string | null
  accept?: string[]
  maxSize?: number
  error?: string
  darkPreview?: boolean
  urlFallback?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currentUrl: null,
  accept: () => ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'],
  maxSize: 2 * 1024 * 1024,
  error: '',
  darkPreview: false,
  urlFallback: true,
})

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
  'update:url': [url: string]
  'clear': []
}>()

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const localError = ref('')
const showUrlInput = ref(false)
const objectUrl = ref<string | null>(null)
const cleared = ref(false)

const acceptExtensions = computed(() =>
  props.accept
    .map((mime) => {
      const ext = mime.split('/')[1]
      if (ext === 'svg+xml') return '.svg'
      if (ext === 'jpeg') return '.jpg,.jpeg'
      return `.${ext}`
    })
    .join(',')
)

const previewSrc = computed(() => {
  if (cleared.value) return null
  return objectUrl.value || props.currentUrl || null
})

const maxSizeMB = computed(() => props.maxSize / (1024 * 1024))

function validateFile(file: File): string | null {
  if (!props.accept.includes(file.type)) {
    return 'File must be SVG, PNG, JPG, or WebP'
  }
  if (file.size > props.maxSize) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is ${maxSizeMB.value}MB`
  }
  return null
}

function handleFile(file: File) {
  const error = validateFile(file)
  if (error) {
    localError.value = error
    return
  }

  localError.value = ''
  cleared.value = false
  revokeObjectUrl()
  objectUrl.value = URL.createObjectURL(file)
  emit('update:modelValue', file)
  emit('update:url', '')
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  handleFile(file)
  input.value = ''
}

function onDrop(event: DragEvent) {
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) handleFile(file)
}

function clearFile() {
  revokeObjectUrl()
  cleared.value = true
  localError.value = ''
  emit('update:modelValue', null)
  emit('clear')
}

function revokeObjectUrl() {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }
}

onBeforeUnmount(() => revokeObjectUrl())
</script>

<template>
  <div>
    <!-- Drop zone -->
    <div
      :class="[
        'relative border-2 border-dashed rounded-lg transition-colors cursor-pointer',
        isDragOver
          ? 'border-verse-500 bg-verse-50 dark:bg-verse-800/50'
          : 'border-verse-300 dark:border-verse-600 hover:border-verse-400 dark:hover:border-verse-500',
      ]"
      @click="fileInput?.click()"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="onDrop"
    >
      <!-- Preview -->
      <div
        v-if="previewSrc"
        :class="[
          'w-full h-28 flex items-center justify-center p-3 rounded-lg',
          darkPreview ? 'bg-verse-800' : 'bg-white dark:bg-verse-900',
        ]"
      >
        <img :src="previewSrc" alt="Preview" class="max-w-full max-h-full object-contain" />
      </div>

      <!-- Placeholder -->
      <div v-else class="flex flex-col items-center justify-center py-6 px-4 text-center">
        <svg
          class="w-8 h-8 mb-2 text-verse-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 16V4m0 0l-4 4m4-4l4 4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"
          />
        </svg>
        <p class="text-sm text-verse-500 dark:text-verse-400">
          Drop image here or <span class="text-verse-700 dark:text-verse-200 font-medium">browse</span>
        </p>
        <p class="text-xs text-verse-400 dark:text-verse-500 mt-1">
          SVG, PNG, JPG, WebP up to {{ maxSizeMB }}MB
        </p>
      </div>

      <input
        ref="fileInput"
        type="file"
        :accept="acceptExtensions"
        class="hidden"
        @change="onFileChange"
      />
    </div>

    <!-- Remove button -->
    <button
      v-if="previewSrc"
      type="button"
      class="mt-1 text-xs text-red-500 hover:text-red-700"
      @click.stop="clearFile"
    >
      Remove image
    </button>

    <span v-if="previewSrc && urlFallback" class="mx-1 text-xs text-verse-400">·</span>

    <!-- URL fallback -->
    <template v-if="urlFallback">
      <button
        type="button"
        class="mt-2 text-xs text-verse-500 hover:text-verse-700 dark:hover:text-verse-300"
        @click="showUrlInput = !showUrlInput"
      >
        {{ showUrlInput ? 'Hide URL input' : 'or paste URL' }}
      </button>
      <input
        v-if="showUrlInput"
        type="text"
        placeholder="https://..."
        class="mt-1 w-full px-4 py-2 text-sm border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
        @input="emit('update:url', ($event.target as HTMLInputElement).value)"
      />
    </template>

    <!-- Errors -->
    <p v-if="localError" class="mt-1 text-sm text-red-500">{{ localError }}</p>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  </div>
</template>
