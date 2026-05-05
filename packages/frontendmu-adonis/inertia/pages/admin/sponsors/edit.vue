<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'
import AdminShell from '~/components/admin/ui/AdminShell.vue'
import AdminButton from '~/components/admin/ui/AdminButton.vue'
import SponsorFormFields from '~/components/admin/SponsorFormFields.vue'

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

function handleSubmit() {
  form.put(`/admin/sponsors/${props.sponsor.id}`, { forceFormData: true })
}
</script>

<template>
  <Head :title="`${sponsor.name} · Admin`" />
  <AdminShell
    :title="sponsor.name"
    :description="
      sponsor.eventCount
        ? `Linked to ${sponsor.eventCount} event${sponsor.eventCount === 1 ? '' : 's'}.`
        : 'Sponsor profile and branding.'
    "
    :breadcrumbs="[
      { label: 'Admin', href: '/admin' },
      { label: 'Sponsors', href: '/admin/sponsors' },
      { label: sponsor.name },
    ]"
  >
    <template #media>
      <div
        :class="[
          'w-14 h-14 rounded-2xl flex items-center justify-center p-2 border border-verse-200 dark:border-verse-800',
          sponsor.logoBg ? '' : 'bg-white dark:bg-white',
        ]"
        :style="sponsor.logoBg ? { backgroundColor: sponsor.logoBg } : {}"
      >
        <img
          v-if="sponsor.logoUrl"
          :src="sponsor.logoUrl"
          :alt="sponsor.name"
          class="max-w-full max-h-full object-contain"
        />
        <span v-else class="text-verse-400 text-lg">{{ sponsor.name.charAt(0) }}</span>
      </div>
    </template>

    <form class="max-w-3xl space-y-6" @submit.prevent="handleSubmit">
      <SponsorFormFields
        :form="form"
        :current-logo-url="sponsor.logoUrl"
        :current-logomark-url="sponsor.logomarkUrl"
      />

      <div class="sticky bottom-3 z-10 flex justify-end gap-2 bg-white/85 dark:bg-verse-950/85 backdrop-blur-md p-3 rounded-xl border border-verse-200 dark:border-verse-800">
        <AdminButton href="/admin/sponsors" variant="secondary">Cancel</AdminButton>
        <AdminButton type="submit" variant="primary" :loading="form.processing">
          {{ form.processing ? 'Saving…' : 'Save changes' }}
        </AdminButton>
      </div>
    </form>
  </AdminShell>
</template>
