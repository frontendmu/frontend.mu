<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef, watch } from 'vue';
import useAuth, { getClient } from '../../auth-utils/useAuth';
import BaseButton from '@components/base/BaseButton.vue';
import { base64Url, findObjectByValue } from '@utils/helpers';
import SideInfo from './SideInfo.vue'
import { foodOptions, transportOptions, professionOptions, showMeAsAttendingOptions } from './constants';
import FormLabel from './FormLabel.vue';
import FormRadio from '@components/auth/FormRadio.vue';
import { RadioGroup, RadioGroupLabel } from "@headlessui/vue";

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
    avatarUrl
} = useAuth(getClient());

const userDetails = reactive({
    email: '',
    full_name: '',
    phone: '',
    github_username: '',
    profile_picture: '',
})

function setUserDetails() {
    userDetails.email = user.value?.email || '';
    userDetails.full_name = user.value?.full_name || '';
    userDetails.phone = user.value?.phone || '';
    userDetails.github_username = user.value?.github_username || '';
    userDetails.profile_picture = user.value?.profile_picture || '';

    let mealValue = rawUser.value?.meal || foodOptions[0].value;
    foodSelection.value = findObjectByValue(mealValue, foodOptions)

    let transportValue = rawUser.value?.transport || transportOptions[0].value;
    transportSelection.value = findObjectByValue(transportValue, transportOptions)

    let professionValue = rawUser.value?.occupation || professionOptions[0].value;
    professionSelection.value = findObjectByValue(professionValue, professionOptions)

    // let showMeAsAttendingValue = rawUser.value?.occupation || showMeAsAttendingOptions[0].value;
    // showMeAsAttendingSelection.value = findObjectByValue(showMeAsAttendingValue, showMeAsAttendingOptions)


}

onMounted(async () => {
    if (await checkIfLoggedIn()) {
        setUserDetails();
    }
});

// Food Preferences

const foodSelection = shallowRef(foodOptions[1]);

// Transport Preferences

const transportSelection = shallowRef(transportOptions[1]);

// Profession Preferences

const professionSelection = shallowRef(professionOptions[0]);

// Show me as attending

const showMeAsAttendingSelection = shallowRef(showMeAsAttendingOptions[0]);


function updateProfile() {
    let extractEditableFields = {
        phone: userDetails.phone,
        full_name: userDetails.full_name,
        github_username: userDetails.github_username,
        occupation: professionSelection.value.value,
        meal: foodSelection.value.value,
        transport: transportSelection.value.value,
    }

    updateUserProfile({
        profile_updates: extractEditableFields,
    });
}
</script>


<template>
    <div class="contain py-10 sm:py-32">
        <div class="divide-y divide-white/5 dark:text-white">
            <template v-if="isLoggedIn">
                <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                    <SideInfo title="Personal Information">
                        Minimum information required to maintain a profile on
                        Frontend Coders Mauritius.
                    </SideInfo>



                    <form class="md:col-span-2 pb-16">
                        <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
                            <div class="col-span-full flex items-center gap-x-8" v-if="avatarUrl">
                                <img :src="avatarUrl || ''" alt=""
                                    class="h-28 w-28 flex-none rounded-lg bg-gray-800 object-cover" />
                            </div>

                            <div class="col-span-full">
                                <label for="email" class="block text-lg font-medium leading-6">Email address</label>
                                <div class="mt-2">
                                    <input disabled id="email" name="email" v-model="userDetails.email" type="email"
                                        autocomplete="email"
                                        class="block w-full pl-2 rounded-md border-0 bg-white/5 py-1.5 shadow-sm ring-1 ring-inset dark:ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-lg sm:leading-6" />
                                </div>
                            </div>

                            <div class="col-span-full">
                                <label for="fullname" class="block text-lg font-medium leading-6">Full name</label>
                                <div class="mt-2">
                                    <div
                                        class="flex rounded-md bg-white/5 ring-1 ring-inset dark:ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                                        <input type="text" v-model="userDetails.full_name" name="fullname" id="fullname"
                                            autocomplete="username"
                                            class="flex-1 border-0 bg-transparent py-1.5 pl-2 focus:ring-0 sm:text-lg sm:leading-6" />
                                    </div>
                                </div>
                            </div>


                            <div class="col-span-full">
                                <label for="github_username" class="block text-lg font-medium leading-6">GitHub
                                    Username</label>
                                <div class="mt-2">
                                    <div
                                        class="flex rounded-md bg-white/5 ring-1 ring-inset dark:ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                                        <input type="text" v-model="userDetails.github_username" name="github_username"
                                            id="github_username" autocomplete="username"
                                            class="flex-1 border-0 bg-transparent py-1.5 pl-2 focus:ring-0 sm:text-lg sm:leading-6" />
                                    </div>
                                </div>
                            </div>

                            <div class="col-span-full">
                                <label for="phone" class="block text-lg font-medium leading-6">Phone</label>
                                <div class="mt-2">
                                    <div
                                        class="flex rounded-md bg-white/5 ring-1 ring-inset dark:ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                                        <input v-model="userDetails.phone" name="phone" id="phone"
                                            autocomplete="phone"
                                            class="flex-1 border-0 bg-transparent py-1.5 pl-2 focus:ring-0 sm:text-lg sm:leading-6"
                                            placeholder="57654321" />
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
                            <template v-for="event in rawUser?.Events" :key="event.id">
                                <template v-if="(typeof event.Events_id !== 'string')">
                                    <div>
                                        <a :href="`/meetup/${event.Events_id.id}`" class="text-lg font-medium">{{
                                            event.Events_id.title }}</a>
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
                                <RadioGroupLabel class="sr-only">Transport</RadioGroupLabel>
                                <div class="flex gap-4 flex-wrap">
                                    <FormRadio :disabled="isLoading" :options="transportOptions" />
                                </div>
                            </RadioGroup>
                        </FormLabel>

                        <FormLabel label="Meal">
                            <RadioGroup v-model="foodSelection">
                                <RadioGroupLabel class="sr-only">Meal</RadioGroupLabel>
                                <div class="flex gap-4 flex-wrap">
                                    <FormRadio :disabled="isLoading" :options="foodOptions" />
                                </div>
                            </RadioGroup>
                        </FormLabel>

                        <FormLabel label="Profession">
                            <RadioGroup v-model="professionSelection">
                                <RadioGroupLabel class="sr-only">Profession</RadioGroupLabel>
                                <div class="flex gap-4 flex-wrap">
                                    <FormRadio :disabled="isLoading" :options="professionOptions" />
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
                        You've signed up on frontend.mu using this provider.
                    </SideInfo>

                    <form class="md:col-span-2">
                        <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
                            <div class="col-span-full">
                                <div class="mt-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="272" height="92">
                                        <path fill="#EA4335"
                                            d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" />
                                        <path fill="#FBBC05"
                                            d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" />
                                        <path fill="#4285F4"
                                            d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" />
                                        <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z" />
                                        <path fill="#EA4335"
                                            d="m262.02 54.48 7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98 19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" />
                                        <path fill="#4285F4"
                                            d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div class="mt-8 flex">
                            <button type="submit" @click.prevent="logout()"
                                class="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                                Log me out
                            </button>
                        </div>
                    </form>
                </div>
            </template>
            <template v-else>
                <div class="grid place-items-center gap-8">
                    <div class="text-2xl">You are not logged in.</div>

                    <BaseButton href="/login" :color="'primary'">
                        Login to RSVP
                    </BaseButton>
                </div>
            </template>
        </div>
    </div>
</template>