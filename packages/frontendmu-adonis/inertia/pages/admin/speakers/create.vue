<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'
import AdminShell from '~/components/admin/ui/AdminShell.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminButton from '~/components/admin/ui/AdminButton.vue'
import AdminInput from '~/components/admin/ui/AdminInput.vue'
import AdminTextarea from '~/components/admin/ui/AdminTextarea.vue'
import AdminCheckbox from '~/components/admin/ui/AdminCheckbox.vue'

const form = useForm({
  name: '',
  email: '',
  githubUsername: '',
  bio: '',
  linkedinUrl: '',
  twitterUrl: '',
  websiteUrl: '',
  featured: false,
})

function handleSubmit() {
  form.post('/admin/speakers')
}
</script>

<template>
  <Head title="Add speaker · Admin" />
  <AdminShell
    title="Add speaker"
    description="Speakers can be linked to sessions on any event."
    :breadcrumbs="[
      { label: 'Admin', href: '/admin' },
      { label: 'Speakers', href: '/admin/speakers' },
      { label: 'Add speaker' },
    ]"
  >
    <form class="space-y-6 max-w-3xl" @submit.prevent="handleSubmit">
      <AdminCard title="Basic info">
        <div class="space-y-5">
          <AdminInput
            v-model="form.name"
            label="Name"
            required
            :error="form.errors.name"
          />
          <AdminInput
            v-model="form.email"
            label="Email"
            type="email"
            :error="form.errors.email"
          />
          <AdminInput
            v-model="form.githubUsername"
            label="GitHub username"
            leading-text="@"
            hint="Used to fetch the avatar from GitHub"
            :error="form.errors.githubUsername"
          />
          <AdminTextarea
            v-model="form.bio"
            label="Bio"
            :rows="4"
            :error="form.errors.bio"
          />
        </div>
      </AdminCard>

      <AdminCard title="Social links">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminInput
            v-model="form.linkedinUrl"
            label="LinkedIn"
            type="url"
            placeholder="https://linkedin.com/in/…"
          />
          <AdminInput
            v-model="form.twitterUrl"
            label="Twitter"
            type="url"
            placeholder="https://twitter.com/…"
          />
          <AdminInput
            v-model="form.websiteUrl"
            label="Website"
            type="url"
            placeholder="https://…"
          />
        </div>
      </AdminCard>

      <AdminCard title="Visibility">
        <AdminCheckbox
          v-model="form.featured"
          label="Featured speaker"
          description="Featured speakers are highlighted on the speakers page."
        />
      </AdminCard>

      <div class="sticky bottom-3 z-10 flex justify-end gap-2 bg-white/85 dark:bg-verse-950/85 backdrop-blur-md p-3 rounded-xl border border-verse-200 dark:border-verse-800">
        <AdminButton href="/admin/speakers" variant="secondary">Cancel</AdminButton>
        <AdminButton type="submit" variant="primary" :loading="form.processing">
          {{ form.processing ? 'Creating…' : 'Create speaker' }}
        </AdminButton>
      </div>
    </form>
  </AdminShell>
</template>
