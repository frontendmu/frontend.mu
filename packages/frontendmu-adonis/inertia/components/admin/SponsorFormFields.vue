<script setup lang="ts">
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminInput from '~/components/admin/ui/AdminInput.vue'
import AdminTextarea from '~/components/admin/ui/AdminTextarea.vue'
import AdminSelect from '~/components/admin/ui/AdminSelect.vue'
import BaseImageUpload from '~/components/base/BaseImageUpload.vue'

interface SponsorFormState {
  name: string
  website: string
  description: string
  logoUrl: string
  logomarkUrl: string
  logoFile: File | null
  logomarkFile: File | null
  clearLogo?: boolean
  clearLogomark?: boolean
  sponsorTypes: string[]
  logoBg: string
  status: 'active' | 'inactive'
}

const props = defineProps<{
  form: SponsorFormState & { errors: Record<string, string> }
  currentLogoUrl?: string | null
  currentLogomarkUrl?: string | null
}>()

const sponsorTypeOptions = [
  'venue',
  'food',
  'drinks',
  'swag',
  'gold',
  'silver',
  'bronze',
  'platinum',
]

const presetBackgrounds: Array<{ value: string; label: string; swatch: string }> = [
  { value: '', label: 'Transparent', swatch: 'transparent' },
  { value: '#ffffff', label: 'White', swatch: '#ffffff' },
  { value: '#111827', label: 'Black', swatch: '#111827' },
]

function toggleSponsorType(type: string) {
  const idx = props.form.sponsorTypes.indexOf(type)
  if (idx === -1) props.form.sponsorTypes.push(type)
  else props.form.sponsorTypes.splice(idx, 1)
}
</script>

<template>
  <div class="space-y-6">
    <AdminCard title="Basics">
      <div class="space-y-5">
        <AdminInput v-model="form.name" label="Name" required :error="form.errors.name" />
        <AdminInput
          v-model="form.website"
          label="Website"
          type="url"
          placeholder="https://…"
          :error="form.errors.website"
        />
        <AdminTextarea
          v-model="form.description"
          label="Description"
          :error="form.errors.description"
        />
      </div>
    </AdminCard>

    <AdminCard title="Logo & branding" description="Logo is the primary mark; logomark is a compact symbol used in tight spaces.">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <span class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-1.5">Logo</span>
          <BaseImageUpload
            v-model="form.logoFile"
            :current-url="currentLogoUrl ?? undefined"
            :dark-preview="!!form.logoBg"
            :error="form.errors.logoFile || form.errors.logoUrl"
            @update:url="(v) => { form.logoUrl = v; if ('clearLogo' in form) form.clearLogo = false }"
            @update:model-value="() => { if ('clearLogo' in form) form.clearLogo = false }"
            @clear="() => { if ('clearLogo' in form) form.clearLogo = true }"
          />
        </div>
        <div>
          <span class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-1.5">Logomark</span>
          <BaseImageUpload
            v-model="form.logomarkFile"
            :current-url="currentLogomarkUrl ?? undefined"
            :dark-preview="!!form.logoBg"
            :error="form.errors.logomarkFile || form.errors.logomarkUrl"
            @update:url="(v) => { form.logomarkUrl = v; if ('clearLogomark' in form) form.clearLogomark = false }"
            @update:model-value="() => { if ('clearLogomark' in form) form.clearLogomark = false }"
            @clear="() => { if ('clearLogomark' in form) form.clearLogomark = true }"
          />
        </div>
      </div>

      <div class="mt-6">
        <span class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
          Logo background
        </span>
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="preset in presetBackgrounds"
            :key="preset.label"
            type="button"
            :class="[
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
              form.logoBg === preset.value
                ? 'bg-verse-900 dark:bg-verse-50 border-verse-900 dark:border-verse-50 text-white dark:text-verse-900'
                : 'bg-white dark:bg-verse-900/40 border-verse-200 dark:border-verse-800 text-verse-700 dark:text-verse-200 hover:border-verse-400 dark:hover:border-verse-600',
            ]"
            @click="form.logoBg = preset.value"
          >
            <span
              class="w-3 h-3 rounded-full border border-verse-300 dark:border-verse-700"
              :style="{
                backgroundColor: preset.swatch === 'transparent' ? undefined : preset.swatch,
                backgroundImage:
                  preset.swatch === 'transparent'
                    ? 'linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 50%, #ddd 50%, #ddd 75%, transparent 75%)'
                    : undefined,
                backgroundSize: '6px 6px',
              }"
              aria-hidden="true"
            />
            {{ preset.label }}
          </button>
          <label
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border bg-white dark:bg-verse-900/40 border-verse-200 dark:border-verse-800 text-verse-700 dark:text-verse-200 cursor-pointer hover:border-verse-400 dark:hover:border-verse-600 transition-colors"
          >
            Custom
            <input
              type="color"
              :value="form.logoBg || '#ffffff'"
              class="w-5 h-5 rounded cursor-pointer border-0 p-0"
              @input="form.logoBg = ($event.target as HTMLInputElement).value"
            />
          </label>
          <span
            v-if="form.logoBg && !['#ffffff', '#111827', ''].includes(form.logoBg)"
            class="text-xs font-mono text-verse-500 dark:text-verse-400"
          >
            {{ form.logoBg }}
          </span>
        </div>
      </div>
    </AdminCard>

    <AdminCard title="Tags & status">
      <div class="space-y-5">
        <div>
          <span class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2">
            Sponsor types
          </span>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="type in sponsorTypeOptions"
              :key="type"
              type="button"
              :class="[
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize',
                form.sponsorTypes.includes(type)
                  ? 'bg-verse-900 dark:bg-verse-50 border-verse-900 dark:border-verse-50 text-white dark:text-verse-900'
                  : 'bg-white dark:bg-verse-900/40 border-verse-200 dark:border-verse-800 text-verse-700 dark:text-verse-200 hover:border-verse-400 dark:hover:border-verse-600',
              ]"
              @click="toggleSponsorType(type)"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <AdminSelect v-model="form.status" label="Status">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </AdminSelect>
      </div>
    </AdminCard>
  </div>
</template>
