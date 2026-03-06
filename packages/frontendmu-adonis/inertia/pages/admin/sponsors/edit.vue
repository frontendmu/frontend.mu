<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
import BaseImageUpload from '~/components/base/BaseImageUpload.vue'

interface Sponsor {
  id: string
  name: string
  website: string | null
  description: string | null
  logoUrl: string | null
  logomarkUrl: string | null
  sponsorTypes: string[]
  logoBg: string | null
  status: 'active' | 'inactive'
  eventCount: number
}

interface Props {
  sponsor: Sponsor
}

const props = defineProps<Props>()

const sponsorTypeOptions = ['venue', 'food', 'drinks', 'swag', 'gold', 'silver', 'bronze', 'platinum']

const form = useForm({
  name: props.sponsor.name,
  website: props.sponsor.website || '',
  description: props.sponsor.description || '',
  logoUrl: props.sponsor.logoUrl || '',
  logomarkUrl: props.sponsor.logomarkUrl || '',
  logoFile: null as File | null,
  logomarkFile: null as File | null,
  clearLogo: false,
  clearLogomark: false,
  sponsorTypes: [...(props.sponsor.sponsorTypes || [])],
  logoBg: props.sponsor.logoBg || '',
  status: props.sponsor.status,
})

function toggleSponsorType(type: string) {
  const index = form.sponsorTypes.indexOf(type)
  if (index === -1) {
    form.sponsorTypes.push(type)
  } else {
    form.sponsorTypes.splice(index, 1)
  }
}

function handleSubmit() {
  form.put(`/admin/sponsors/${props.sponsor.id}`, {
    forceFormData: true,
  })
}
</script>

<template>
  <Head :title="`Edit: ${sponsor.name}`" />
  <main class="relative min-h-screen pt-40 pb-20">
      <ContentBlock>
        <div class="max-w-2xl mx-auto">
        <!-- Breadcrumb -->
        <nav class="mb-6 flex items-center gap-2 text-sm">
          <Link href="/admin" class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200">
            Admin
          </Link>
          <span class="text-verse-400">/</span>
          <Link href="/admin/sponsors" class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200">
            Sponsors
          </Link>
          <span class="text-verse-400">/</span>
          <span class="text-verse-900 dark:text-verse-100">{{ sponsor.name }}</span>
        </nav>

        <!-- Header -->
        <div class="flex items-center gap-4 mb-8">
          <div
            v-if="sponsor.logoUrl"
            :class="['w-16 h-16 squircle rounded-lg flex items-center justify-center p-2', sponsor.logoBg ? '' : 'bg-white dark:bg-white border border-verse-200']"
            :style="sponsor.logoBg ? { backgroundColor: sponsor.logoBg } : {}"
          >
            <img :src="sponsor.logoUrl" :alt="sponsor.name" class="max-w-full max-h-full object-contain" />
          </div>
          <div>
            <BaseHeading :level="1">Edit Sponsor</BaseHeading>
            <p class="text-verse-600 dark:text-verse-400">
              {{ sponsor.name }}
              <span v-if="sponsor.eventCount" class="text-sm">
                ({{ sponsor.eventCount }} event{{ sponsor.eventCount !== 1 ? 's' : '' }})
              </span>
            </p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              Name <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
            <p v-if="form.errors.name" class="mt-1 text-sm text-red-500">{{ form.errors.name }}</p>
          </div>

          <!-- Website -->
          <div>
            <label for="website" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              Website
            </label>
            <input
              id="website"
              v-model="form.website"
              type="url"
              placeholder="https://..."
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
            <p v-if="form.errors.website" class="mt-1 text-sm text-red-500">{{ form.errors.website }}</p>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
            <p v-if="form.errors.description" class="mt-1 text-sm text-red-500">{{ form.errors.description }}</p>
          </div>

          <!-- Logo Upload -->
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
                Logo
              </label>
              <BaseImageUpload
                v-model="form.logoFile"
                :current-url="sponsor.logoUrl"
                :dark-preview="!!form.logoBg"
                :error="form.errors.logoFile || form.errors.logoUrl"
                @update:url="(v) => { form.logoUrl = v; form.clearLogo = false }"
                @update:model-value="() => { form.clearLogo = false }"
                @clear="form.clearLogo = true"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
                Logomark
              </label>
              <BaseImageUpload
                v-model="form.logomarkFile"
                :current-url="sponsor.logomarkUrl"
                :dark-preview="!!form.logoBg"
                :error="form.errors.logomarkFile || form.errors.logomarkUrl"
                @update:url="(v) => { form.logomarkUrl = v; form.clearLogomark = false }"
                @update:model-value="() => { form.clearLogomark = false }"
                @clear="form.clearLogomark = true"
              />
            </div>
          </div>

          <!-- Sponsor Types -->
          <div>
            <label class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              Sponsor Types
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="type in sponsorTypeOptions"
                :key="type"
                type="button"
                @click="toggleSponsorType(type)"
                :class="[
                  'px-3 py-1.5 squircle rounded-lg text-sm font-medium transition-colors capitalize',
                  form.sponsorTypes.includes(type)
                    ? 'bg-verse-600 text-white'
                    : 'bg-verse-100 dark:bg-verse-700 text-verse-700 dark:text-verse-300 hover:bg-verse-200 dark:hover:bg-verse-600'
                ]"
              >
                {{ type }}
              </button>
            </div>
          </div>

          <!-- Logo Background -->
          <div>
            <label class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              Logo Background
            </label>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                @click="form.logoBg = ''"
                :class="[
                  'px-3 py-1.5 squircle rounded-lg text-sm font-medium transition-colors',
                  !form.logoBg
                    ? 'bg-verse-600 text-white'
                    : 'bg-verse-100 dark:bg-verse-700 text-verse-700 dark:text-verse-300 hover:bg-verse-200 dark:hover:bg-verse-600'
                ]"
              >
                Transparent
              </button>
              <button
                type="button"
                @click="form.logoBg = '#ffffff'"
                :class="[
                  'px-3 py-1.5 squircle rounded-lg text-sm font-medium transition-colors',
                  form.logoBg === '#ffffff'
                    ? 'bg-verse-600 text-white'
                    : 'bg-verse-100 dark:bg-verse-700 text-verse-700 dark:text-verse-300 hover:bg-verse-200 dark:hover:bg-verse-600'
                ]"
              >
                White
              </button>
              <button
                type="button"
                @click="form.logoBg = '#111827'"
                :class="[
                  'px-3 py-1.5 squircle rounded-lg text-sm font-medium transition-colors',
                  form.logoBg === '#111827'
                    ? 'bg-verse-600 text-white'
                    : 'bg-verse-100 dark:bg-verse-700 text-verse-700 dark:text-verse-300 hover:bg-verse-200 dark:hover:bg-verse-600'
                ]"
              >
                Black
              </button>
              <div class="flex items-center gap-2">
                <input
                  type="color"
                  :value="form.logoBg || '#ffffff'"
                  @input="form.logoBg = ($event.target as HTMLInputElement).value"
                  class="w-8 h-8 rounded cursor-pointer border border-verse-300 dark:border-verse-600"
                />
                <span v-if="form.logoBg && !['#ffffff', '#111827', ''].includes(form.logoBg)" class="text-xs font-mono text-verse-500">
                  {{ form.logoBg }}
                </span>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div>
            <label for="status" class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
              Status
            </label>
            <select
              id="status"
              v-model="form.status"
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 squircle rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <!-- Submit -->
          <div class="flex justify-end gap-4 pt-4">
            <Link
              href="/admin/sponsors"
              class="px-6 py-2 text-verse-700 dark:text-verse-300 hover:bg-verse-100 dark:hover:bg-verse-700 squircle rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              :disabled="form.processing"
              class="px-6 py-2 bg-verse-600 hover:bg-verse-700 text-white font-medium squircle rounded-lg transition-colors disabled:opacity-50"
            >
              <span v-if="form.processing">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </ContentBlock>
  </main>
</template>
