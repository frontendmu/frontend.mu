<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'
import AdminShell from '~/components/admin/ui/AdminShell.vue'
import AdminButton from '~/components/admin/ui/AdminButton.vue'
import SponsorFormFields from '~/components/admin/SponsorFormFields.vue'

const form = useForm({
  name: '',
  website: '',
  description: '',
  logoUrl: '',
  logomarkUrl: '',
  logoFile: null as File | null,
  logomarkFile: null as File | null,
  sponsorTypes: [] as string[],
  logoBg: '',
  status: 'active' as 'active' | 'inactive',
})

function handleSubmit() {
  form.post('/admin/sponsors', { forceFormData: true })
}
</script>

<template>
  <Head title="Add sponsor · Admin" />
  <AdminShell
    title="Add sponsor"
    description="Sponsors can be attached to events and shown across the public site."
    :breadcrumbs="[
      { label: 'Admin', href: '/admin' },
      { label: 'Sponsors', href: '/admin/sponsors' },
      { label: 'Add sponsor' },
    ]"
  >
    <form class="max-w-3xl space-y-6" @submit.prevent="handleSubmit">
      <SponsorFormFields :form="form" />

      <div class="sticky bottom-3 z-10 flex justify-end gap-2 bg-white/85 dark:bg-verse-950/85 backdrop-blur-md p-3 rounded-xl border border-verse-200 dark:border-verse-800">
        <AdminButton href="/admin/sponsors" variant="secondary">Cancel</AdminButton>
        <AdminButton type="submit" variant="primary" :loading="form.processing">
          {{ form.processing ? 'Creating…' : 'Create sponsor' }}
        </AdminButton>
      </div>
    </form>
  </AdminShell>
</template>
