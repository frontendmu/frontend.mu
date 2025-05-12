<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { sponsorshipTemplates } from '@/utils/sponsorshipTemplates'

const companyName = ref('')
const selectedTemplate = ref('ceo')
const customText = ref(sponsorshipTemplates[selectedTemplate.value].text)
const showCopied = ref(false)

// Update custom text when template changes
watch(selectedTemplate, (newTemplate) => {
  customText.value = sponsorshipTemplates[newTemplate].text
})

const templates = Object.entries(sponsorshipTemplates).map(([key, template]) => ({
  id: key,
  ...template,
}))

const processedText = computed(() => {
  const template = customText.value || sponsorshipTemplates[selectedTemplate.value].text
  return template.replace(/\{\{companyName\}\}/g, companyName.value || '[Company Name]')
})

async function copyText() {
  try {
    await navigator.clipboard.writeText(processedText.value)
    showCopied.value = true
    setTimeout(() => {
      showCopied.value = false
    }, 2000)
  }
  catch (err) {
    console.error('Failed to copy text:', err)
  }
}
</script>

<template>
  <section class="w-full flex flex-col gap-8">
    <BaseHeading :level="2">
      Want to convince someone to sponsor us?
    </BaseHeading>

    <div class="flex flex-col gap-6">
      <p class="text-xl text-verse-600 dark:text-verse-300">
        Use these templates to help make your case for sponsorship. Customize them for your needs!
      </p>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-1">
              Company Name
            </label>
            <input
              v-model="companyName"
              type="text"
              placeholder="Enter company name"
              class="w-full px-4 py-2 rounded-md border border-verse-200 dark:border-verse-700 bg-white dark:bg-verse-800 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            >
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-1">
              Template
            </label>
            <select
              v-model="selectedTemplate"
              class="w-full px-4 py-2 rounded-md border border-verse-200 dark:border-verse-700 bg-white dark:bg-verse-800 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            >
              <option
                v-for="template in templates"
                :key="template.id"
                :value="template.id"
              >
                {{ template.title }}
              </option>
            </select>
          </div>
        </div>

        <div class="relative">
          <label class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-1">
            Customized Message
          </label>
          <textarea
            v-model="customText"
            :placeholder="sponsorshipTemplates[selectedTemplate].text"
            rows="10"
            class="w-full px-4 py-2 rounded-md border border-verse-200 dark:border-verse-700 bg-white dark:bg-verse-800 focus:ring-2 focus:ring-verse-500 focus:border-transparent font-mono text-sm"
          />
          <button
            class="absolute bottom-4 right-4 px-4 py-2 bg-verse-600 dark:bg-verse-400 text-white rounded-md hover:bg-verse-700 dark:hover:bg-verse-500 transition-colors flex items-center gap-2"
            @click="copyText"
          >
            <span v-if="showCopied">Copied!</span>
            <span v-else>Copy Text</span>
          </button>
        </div>

        <div class="prose dark:prose-invert max-w-none">
          <div class="bg-white dark:bg-verse-800/50 p-8 rounded-lg shadow-lg letter-container">
            <h3 class="text-lg font-medium text-verse-900 dark:text-verse-100 mb-4">
              Preview
            </h3>
            <div class="whitespace-pre-wrap handwritten-text letter-content">
              {{ processedText }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');

.letter-container {
  position: relative;
  background-image: linear-gradient(#fff8 2px, transparent 2px),
                  linear-gradient(90deg, #fff8 2px, transparent 2px),
                  linear-gradient(#f4f4f4 1px, transparent 1px),
                  linear-gradient(90deg, #f4f4f4 1px, transparent 1px);
  background-size: 50px 50px, 50px 50px, 10px 10px, 10px 10px;
  background-position: -2px -2px, -2px -2px, -1px -1px, -1px -1px;
  border: 1px solid #e5e5e5;
}

.letter-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 40px;
  right: 40px;
  height: 1px;
  background: #f0f0f0;
}

.handwritten-text {
  font-family: 'Caveat', cursive;
  font-size: 1.4rem;
  line-height: 1.6;
  color: #2c3e50;
}

.dark .handwritten-text {
  color: #e2e8f0;
}

.dark .letter-container {
  background-image: linear-gradient(#ffffff15 2px, transparent 2px),
                  linear-gradient(90deg, #ffffff15 2px, transparent 2px),
                  linear-gradient(#ffffff08 1px, transparent 1px),
                  linear-gradient(90deg, #ffffff08 1px, transparent 1px);
  border-color: #374151;
}

.letter-content {
  position: relative;
  z-index: 1;
}
</style>
