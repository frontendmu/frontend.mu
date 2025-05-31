<script setup lang="ts">
import { onMounted, reactive, shallowRef } from 'vue'
import { RadioGroup, RadioGroupLabel } from '@headlessui/vue'
import SideInfo from './SideInfo.vue'
import { foodOptions, professionOptions, showMeAsAttendingOptions, transportOptions } from './constants'
import FormLabel from './FormLabel.vue'
import useAuth, { getClient } from '@/auth-utils/useAuth'
import { findObjectByValue } from '@/utils/helpers'
import FormRadio from '@/components/auth/FormRadio.vue'

const {
  user,
  rawUser,
  logout,
  isLoading,
  isLoggedIn,
  getCurrentUser,
  responseFromServer,
  checkIfLoggedIn,
  updateUserProfile,
  oAuthLogin,
  avatarUrl,
} = useAuth(getClient())

const userDetails = reactive({
  email: '',
  full_name: '',
  phone: '',
  github_username: '',
  profile_picture: '',
})

// Food Preferences

const foodSelection = shallowRef(foodOptions[1])

// Transport Preferences

const transportSelection = shallowRef(transportOptions[1])

// Profession Preferences

const professionSelection = shallowRef(professionOptions[0])

// Show me as attending

const showMeAsAttendingSelection = shallowRef(showMeAsAttendingOptions[0])

function setUserDetails() {
  userDetails.email = user.value?.email || ''
  userDetails.full_name = user.value?.full_name || ''
  userDetails.phone = user.value?.phone || ''
  userDetails.github_username = user.value?.github_username || ''
  userDetails.profile_picture = user.value?.profile_picture || ''

  const mealValue = rawUser.value?.meal || foodOptions[0].value
  foodSelection.value = findObjectByValue(mealValue, foodOptions)

  const transportValue = rawUser.value?.transport || transportOptions[0].value
  transportSelection.value = findObjectByValue(transportValue, transportOptions)

  const professionValue = rawUser.value?.occupation || professionOptions[0].value
  professionSelection.value = findObjectByValue(professionValue, professionOptions)

  // let showMeAsAttendingValue = rawUser.value?.occupation || showMeAsAttendingOptions[0].value;
  // showMeAsAttendingSelection.value = findObjectByValue(showMeAsAttendingValue, showMeAsAttendingOptions)
}

onMounted(async () => {
  if (await checkIfLoggedIn()) {
    setUserDetails()
  }
})

function updateProfile() {
  const extractEditableFields = {
    phone: userDetails.phone,
    full_name: userDetails.full_name,
    github_username: userDetails.github_username,
    occupation: professionSelection.value.value,
    meal: foodSelection.value.value,
    transport: transportSelection.value.value,
  }

  updateUserProfile({
    profile_updates: extractEditableFields,
  })
}
</script>

<template>
  <div class="contain py-10 sm:py-32">
    <div class="divide-y divide-white/5 dark:text-white">
      <template v-if="isLoggedIn">
        <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
          <SideInfo title="Personal Information">
            Minimum information required to maintain a profile on
            coders.mu.
          </SideInfo>

          <form class="md:col-span-2 pb-16">
            <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div
                v-if="avatarUrl"
                class="col-span-full flex items-center gap-x-8"
              >
                <img
                  :src="avatarUrl || ''"
                  alt=""
                  class="h-28 w-28 flex-none rounded-lg bg-gray-800 object-cover"
                >
              </div>

              <div class="col-span-full">
                <label
                  for="email"
                  class="block text-lg font-medium leading-6"
                >Email address</label>
                <div class="mt-2">
                  <input
                    id="email"
                    v-model="userDetails.email"
                    disabled
                    name="email"
                    type="email"
                    autocomplete="email"
                    class="block w-full pl-2 rounded-md border-0 bg-white/5 py-1.5 shadow-sm ring-1 ring-inset dark:ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-lg sm:leading-6"
                  >
                </div>
              </div>

              <div class="col-span-full">
                <label
                  for="fullname"
                  class="block text-lg font-medium leading-6"
                >Full name</label>
                <div class="mt-2">
                  <div
                    class="flex rounded-md bg-white/5 ring-1 ring-inset dark:ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500"
                  >
                    <input
                      id="fullname"
                      v-model="userDetails.full_name"
                      type="text"
                      name="fullname"
                      autocomplete="username"
                      class="flex-1 border-0 bg-transparent py-1.5 pl-2 focus:ring-0 sm:text-lg sm:leading-6"
                    >
                  </div>
                </div>
              </div>

              <div class="col-span-full">
                <label
                  for="github_username"
                  class="block text-lg font-medium leading-6"
                >GitHub
                  Username</label>
                <div class="mt-2">
                  <div
                    class="flex rounded-md bg-white/5 ring-1 ring-inset dark:ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500"
                  >
                    <input
                      id="github_username"
                      v-model="userDetails.github_username"
                      type="text"
                      name="github_username"
                      autocomplete="username"
                      class="flex-1 border-0 bg-transparent py-1.5 pl-2 focus:ring-0 sm:text-lg sm:leading-6"
                    >
                  </div>
                </div>
              </div>

              <div class="col-span-full">
                <label
                  for="phone"
                  class="block text-lg font-medium leading-6"
                >Phone</label>
                <div class="mt-2">
                  <div
                    class="flex rounded-md bg-white/5 ring-1 ring-inset dark:ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500"
                  >
                    <input
                      id="phone"
                      v-model="userDetails.phone"
                      name="phone"
                      autocomplete="phone"
                      class="flex-1 border-0 bg-transparent py-1.5 pl-2 focus:ring-0 sm:text-lg sm:leading-6"
                      placeholder="57654321"
                    >
                  </div>
                </div>
              </div>

              <div>
                <BaseButton @click="updateProfile">
                  {{ isLoading ? 'Loading...' : 'Update' }}
                </BaseButton>
              </div>
            </div>
          </form>
        </div>

        <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 py-16 md:grid-cols-3">
          <SideInfo title="Meetups registered">
            You have RSVP'd to these meetups.
          </SideInfo>

          <div>
            <div class="flex flex-col">
              <template
                v-for="event in rawUser?.Events"
                :key="(event.Events_id as DirectusEvent).id"
              >
                <template v-if="(typeof event.Events_id !== 'string')">
                  <div>
                    <NuxtLink
                      :href="`/meetup/${event.Events_id.id}`"
                      class="text-lg font-medium"
                    >
                      {{
                        event.Events_id.title }}
                    </NuxtLink>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </div>

        <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 py-16 md:grid-cols-3">
          <SideInfo title="RSVP details">
            We will use these details to prefill your Meetup RSVP whenever
            you decide to attend an upcoming meetup.
          </SideInfo>

          <div class="flex flex-col gap-8 col-span-2">
            <FormLabel label="Transport">
              <RadioGroup v-model="transportSelection">
                <RadioGroupLabel class="sr-only">
                  Transport
                </RadioGroupLabel>
                <div class="flex gap-4 flex-wrap">
                  <FormRadio
                    :disabled="isLoading"
                    :options="transportOptions"
                  />
                </div>
              </RadioGroup>
            </FormLabel>

            <FormLabel label="Meal">
              <RadioGroup v-model="foodSelection">
                <RadioGroupLabel class="sr-only">
                  Meal
                </RadioGroupLabel>
                <div class="flex gap-4 flex-wrap">
                  <FormRadio
                    :disabled="isLoading"
                    :options="foodOptions"
                  />
                </div>
              </RadioGroup>
            </FormLabel>

            <FormLabel label="Profession">
              <RadioGroup v-model="professionSelection">
                <RadioGroupLabel class="sr-only">
                  Profession
                </RadioGroupLabel>
                <div class="flex gap-4 flex-wrap">
                  <FormRadio
                    :disabled="isLoading"
                    :options="professionOptions"
                  />
                </div>
              </RadioGroup>
            </FormLabel>

            <div>
              <BaseButton @click="updateProfile">
                {{ isLoading ? 'Loading...' : 'Update' }}
              </BaseButton>
            </div>
          </div>
        </div>

        <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 py-16 md:grid-cols-3">
          <SideInfo title="Authentication provider">
            You've signed up on coders.mu using this provider.
          </SideInfo>

          <form class="md:col-span-2">
            <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div class="col-span-full">
                <div class="mt-2">
                  <div v-if="user?.provider === 'default'">
                    <Icon
                      class="w-[100px] h-[100px]"
                      name="fluent:animal-rabbit-24-regular"
                    />
                  </div>
                  <div v-else>
                    <Icon
                      :name="`logos:${user?.provider}`"
                      class="w-[200px] h-[100px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-8 flex">
              <button
                type="submit"
                class="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                @click.prevent="logout()"
              >
                Log me out
              </button>
            </div>
          </form>
        </div>
      </template>
      <template v-else>
        <div class="grid place-items-center gap-8">
          <div class="text-2xl">
            You are not logged in.
          </div>

          <BaseButton
            href="/login"
            color="primary"
          >
            Login to RSVP
          </BaseButton>
        </div>
      </template>
    </div>
  </div>
</template>
