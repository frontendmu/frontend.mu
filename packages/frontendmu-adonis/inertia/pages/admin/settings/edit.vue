<script setup lang="ts">
import { ref } from 'vue'
import { Head, useForm } from '@inertiajs/vue3'
import AdminShell from '~/components/admin/ui/AdminShell.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminButton from '~/components/admin/ui/AdminButton.vue'
import AdminCheckbox from '~/components/admin/ui/AdminCheckbox.vue'

interface Settings {
  calendarFeedEnabled: boolean
  calendarAutoIncludeNewEvents: boolean
  calendarIncludePastEvents: boolean
}

const props = defineProps<{
  settings: Settings
  calendarFeedUrl: string
}>()

const form = useForm({
  calendarFeedEnabled: props.settings.calendarFeedEnabled,
  calendarAutoIncludeNewEvents: props.settings.calendarAutoIncludeNewEvents,
  calendarIncludePastEvents: props.settings.calendarIncludePastEvents,
})

function handleSubmit() {
  form.put('/admin/settings', { preserveScroll: true })
}

const copied = ref(false)
async function copyFeedUrl() {
  await navigator.clipboard.writeText(props.calendarFeedUrl)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <Head title="Settings · Admin" />
  <AdminShell
    title="Settings"
    description="Configure site-wide feature behaviour."
    :breadcrumbs="[{ label: 'Admin', href: '/admin' }, { label: 'Settings' }]"
  >
    <form class="space-y-6 max-w-3xl" @submit.prevent="handleSubmit">
      <AdminCard
        title="Calendar feed"
        description="A public .ics subscription feed lets anyone add Frontend.mu meetups to Google Calendar (or any calendar app) once, then get new and updated events automatically."
      >
        <div class="space-y-5">
          <div class="flex items-center gap-2 rounded-lg border border-verse-200 dark:border-verse-800 bg-verse-50 dark:bg-verse-900 px-3 py-2">
            <code class="text-sm truncate flex-1">{{ calendarFeedUrl }}</code>
            <AdminButton type="button" size="sm" variant="secondary" @click="copyFeedUrl">
              {{ copied ? 'Copied!' : 'Copy' }}
            </AdminButton>
          </div>

          <AdminCheckbox
            v-model="form.calendarFeedEnabled"
            label="Enable calendar feed"
            description="Master switch. When off, the feed is served empty regardless of the settings below."
          />
          <AdminCheckbox
            v-model="form.calendarAutoIncludeNewEvents"
            label="Auto-include new events"
            description="New events appear in the feed by default, unless an admin explicitly hides them on the event."
          />
          <AdminCheckbox
            v-model="form.calendarIncludePastEvents"
            label="Include past events"
            description="Show events whose date has already passed."
          />
        </div>
      </AdminCard>

      <div class="sticky bottom-3 z-10 flex justify-end gap-2 bg-white/85 dark:bg-verse-950/85 backdrop-blur-md p-3 rounded-xl border border-verse-200 dark:border-verse-800">
        <AdminButton type="submit" variant="primary" :loading="form.processing">
          {{ form.processing ? 'Saving…' : 'Save settings' }}
        </AdminButton>
      </div>
    </form>
  </AdminShell>
</template>
