<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'
import AdminShell from '~/components/admin/ui/AdminShell.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminButton from '~/components/admin/ui/AdminButton.vue'
import AdminInput from '~/components/admin/ui/AdminInput.vue'
import AdminTextarea from '~/components/admin/ui/AdminTextarea.vue'
import AdminSelect from '~/components/admin/ui/AdminSelect.vue'
import AdminCheckbox from '~/components/admin/ui/AdminCheckbox.vue'

const form = useForm({
  title: '',
  eventDate: '',
  description: '',
  location: '',
  venue: '',
  startTime: '',
  endTime: '',
  seatsAvailable: null as number | null,
  acceptingRsvp: false,
  rsvpClosingDate: '',
  parkingLocation: '',
  mapUrl: '',
  status: 'draft' as 'draft' | 'published' | 'cancelled',
})

function handleSubmit() {
  form.post('/admin/events', { preserveScroll: true })
}
</script>

<template>
  <Head title="New event · Admin" />
  <AdminShell
    title="New event"
    description="Set the basic details now — you can add sessions and sponsors after creation."
    :breadcrumbs="[
      { label: 'Admin', href: '/admin' },
      { label: 'Events', href: '/admin/events' },
      { label: 'New event' },
    ]"
  >
    <form class="space-y-6 max-w-3xl" @submit.prevent="handleSubmit">
      <AdminCard title="Basics" description="The essentials that define your event.">
        <div class="space-y-5">
          <AdminInput
            v-model="form.title"
            label="Title"
            required
            placeholder="e.g. The October Meetup"
            :error="form.errors.title"
          />
          <AdminInput
            v-model="form.eventDate"
            label="Event date"
            type="date"
            required
            :error="form.errors.eventDate"
          />
          <AdminTextarea
            v-model="form.description"
            label="Description"
            placeholder="What is this meetup about? Who is it for?"
            :error="form.errors.description"
          />
        </div>
      </AdminCard>

      <AdminCard title="Where & when">
        <div class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              v-model="form.location"
              label="Location"
              placeholder="e.g. Port Louis, Mauritius"
            />
            <AdminInput
              v-model="form.venue"
              label="Venue"
              placeholder="e.g. Caudan Arts Centre"
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput v-model="form.startTime" label="Start time" type="time" />
            <AdminInput v-model="form.endTime" label="End time" type="time" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput v-model="form.mapUrl" label="Map URL" type="url" placeholder="https://maps.google.com/…" />
            <AdminInput
              v-model="form.parkingLocation"
              label="Parking URL"
              type="url"
              placeholder="https://maps.google.com/…"
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard title="RSVPs" description="Open RSVPs only when you're ready to receive them.">
        <div class="space-y-5">
          <AdminCheckbox
            v-model="form.acceptingRsvp"
            label="Accept RSVPs"
            description="Members can sign up for this event right away."
          />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              v-model="form.seatsAvailable"
              label="Seats available"
              type="number"
              min="0"
              hint="Leave empty for unlimited"
            />
            <AdminInput
              v-model="form.rsvpClosingDate"
              label="RSVP closing date"
              type="date"
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Visibility">
        <AdminSelect
          v-model="form.status"
          label="Status"
          hint="Draft events stay hidden from the public."
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="cancelled">Cancelled</option>
        </AdminSelect>
      </AdminCard>

      <div class="sticky bottom-3 z-10 flex justify-end gap-2 bg-white/85 dark:bg-verse-950/85 backdrop-blur-md p-3 rounded-xl border border-verse-200 dark:border-verse-800">
        <AdminButton href="/admin/events" variant="secondary">Cancel</AdminButton>
        <AdminButton type="submit" variant="primary" :loading="form.processing">
          {{ form.processing ? 'Creating…' : 'Create event' }}
        </AdminButton>
      </div>
    </form>
  </AdminShell>
</template>
