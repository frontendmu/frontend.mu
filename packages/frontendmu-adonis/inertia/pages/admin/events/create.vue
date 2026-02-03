<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

// Form state
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
  form.post('/admin/events', {
    preserveScroll: true,
  })
}
</script>

<template>
  <Head title="Create Event" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20 max-w-4xl mx-auto">
        <!-- Breadcrumb -->
        <nav class="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/meetups"
            class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200"
          >
            Meetups
          </Link>
          <span class="text-verse-400">/</span>
          <span class="text-verse-500 dark:text-verse-400">Create Event</span>
        </nav>

        <BaseHeading :level="1" class="mb-8">Create New Event</BaseHeading>

        <!-- Create Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Title -->
          <div>
            <label
              for="title"
              class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
            >
              Title *
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              placeholder="e.g., The October Meetup"
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
            <p v-if="form.errors.title" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ form.errors.title }}
            </p>
          </div>

          <!-- Event Date -->
          <div>
            <label
              for="eventDate"
              class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
            >
              Event Date *
            </label>
            <input
              id="eventDate"
              v-model="form.eventDate"
              type="date"
              required
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
            <p v-if="form.errors.eventDate" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ form.errors.eventDate }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <label
              for="description"
              class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              placeholder="Describe the event..."
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            />
            <p v-if="form.errors.description" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ form.errors.description }}
            </p>
          </div>

          <!-- Location & Venue -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="location"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Location
              </label>
              <input
                id="location"
                v-model="form.location"
                type="text"
                placeholder="e.g., Port Louis, Mauritius"
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                for="venue"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Venue
              </label>
              <input
                id="venue"
                v-model="form.venue"
                type="text"
                placeholder="e.g., Caudan Arts Centre"
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Start Time & End Time -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="startTime"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Start Time
              </label>
              <input
                id="startTime"
                v-model="form.startTime"
                type="time"
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                for="endTime"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                End Time
              </label>
              <input
                id="endTime"
                v-model="form.endTime"
                type="time"
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- RSVP Settings -->
          <div class="p-4 bg-verse-50 dark:bg-verse-800/50 rounded-lg border border-verse-200 dark:border-verse-700">
            <h3 class="text-lg font-medium text-verse-900 dark:text-verse-100 mb-4">
              RSVP Settings
            </h3>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <input
                  id="acceptingRsvp"
                  v-model="form.acceptingRsvp"
                  type="checkbox"
                  class="w-4 h-4 text-verse-600 border-verse-300 rounded focus:ring-verse-500"
                />
                <label for="acceptingRsvp" class="text-sm text-verse-700 dark:text-verse-300">
                  Accepting RSVPs
                </label>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    for="seatsAvailable"
                    class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
                  >
                    Seats Available
                  </label>
                  <input
                    id="seatsAvailable"
                    v-model.number="form.seatsAvailable"
                    type="number"
                    min="0"
                    placeholder="Leave empty for unlimited"
                    class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    for="rsvpClosingDate"
                    class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
                  >
                    RSVP Closing Date
                  </label>
                  <input
                    id="rsvpClosingDate"
                    v-model="form.rsvpClosingDate"
                    type="date"
                    class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Map & Parking -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                for="mapUrl"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Map URL
              </label>
              <input
                id="mapUrl"
                v-model="form.mapUrl"
                type="url"
                placeholder="https://maps.google.com/..."
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                for="parkingLocation"
                class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
              >
                Parking Location URL
              </label>
              <input
                id="parkingLocation"
                v-model="form.parkingLocation"
                type="url"
                placeholder="https://maps.google.com/..."
                class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Status -->
          <div>
            <label
              for="status"
              class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
            >
              Status
            </label>
            <select
              id="status"
              v-model="form.status"
              class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <p class="mt-1 text-sm text-verse-500 dark:text-verse-400">
              Draft events are not visible to the public.
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-4 pt-4">
            <button
              type="submit"
              :disabled="form.processing"
              class="px-6 py-2.5 bg-verse-600 hover:bg-verse-700 disabled:bg-verse-400 text-white font-medium rounded-lg transition-colors"
            >
              <span v-if="form.processing">Creating...</span>
              <span v-else>Create Event</span>
            </button>
            <Link
              href="/meetups"
              class="px-6 py-2.5 border border-verse-300 dark:border-verse-600 text-verse-700 dark:text-verse-300 hover:bg-verse-50 dark:hover:bg-verse-800 font-medium rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
