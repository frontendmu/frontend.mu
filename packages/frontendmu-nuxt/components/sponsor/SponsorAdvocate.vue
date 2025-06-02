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
    <div class="space-y-4">
      <BaseHeading :level="2" class="text-verse-700 dark:text-verse-200">
        Want to convince someone to sponsor us?
      </BaseHeading>
      <p class="text-xl text-verse-600 dark:text-verse-300">
        Use these templates to help make your case for sponsorship. Customize them for your needs!
      </p>
    </div>

    <div class="space-y-6">
      <div class="grid sm:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-verse-700 dark:text-verse-300">
            Company Name
          </label>
          <input
            v-model="companyName"
            type="text"
            placeholder="Enter company name"
            class="w-full px-4 py-2.5 rounded-lg border border-verse-200 dark:border-verse-700/50 bg-white/50 dark:bg-verse-800/50 text-verse-900 dark:text-verse-100 placeholder-verse-400 dark:placeholder-verse-500 focus:ring-2 focus:ring-verse-500/50 focus:border-verse-500 dark:focus:border-verse-500 transition-colors duration-200"
          >
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-verse-700 dark:text-verse-300">
            Template
          </label>
          <select
            v-model="selectedTemplate"
            class="w-full px-4 py-2.5 rounded-lg border border-verse-200 dark:border-verse-700/50 bg-white/50 dark:bg-verse-800/50 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500/50 focus:border-verse-500 dark:focus:border-verse-500 transition-colors duration-200"
          >
            <option
              v-for="template in templates"
              :key="template.id"
              :value="template.id"
              class="bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100"
            >
              {{ template.title }}
            </option>
          </select>
        </div>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-verse-700 dark:text-verse-300">
          Customized Message
        </label>
        <div class="relative">
          <textarea
            v-model="customText"
            :placeholder="sponsorshipTemplates[selectedTemplate].text"
            rows="10"
            class="w-full px-4 py-3 rounded-lg border border-verse-200 dark:border-verse-700/50 bg-white/50 dark:bg-verse-800/50 text-verse-900 dark:text-verse-100 placeholder-verse-400 dark:placeholder-verse-500 font-mono text-sm focus:ring-2 focus:ring-verse-500/50 focus:border-verse-500 dark:focus:border-verse-500 transition-colors duration-200"
          />
          <button
            class="absolute bottom-4 right-4 px-4 py-2 bg-verse-600 hover:bg-verse-700 dark:bg-verse-500 dark:hover:bg-verse-600 text-white rounded-lg shadow-lg shadow-verse-600/10 dark:shadow-verse-900/20 transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
            @click="copyText"
          >
            <span v-if="showCopied">Copied!</span>
            <span v-else>Copy Text</span>
          </button>
        </div>
      </div>

      <div class="prose dark:prose-invert max-w-none">
        <div class="bg-white dark:bg-verse-800/50 p-8 rounded-lg shadow-lg letter-container">
          <div class="preview-content">
            <div class="whitespace-pre-wrap font-mono text-sm text-verse-700 dark:text-verse-300">
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
}

.handwritten-text {
  font-family: 'Caveat', cursive;
  font-size: 1.4rem;
  line-height: 1.6;
  color: #2c3e50;
}

html.dark-mode .handwritten-text {
  color: #e2e8f0;
}

html.dark-mode .letter-container {
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
