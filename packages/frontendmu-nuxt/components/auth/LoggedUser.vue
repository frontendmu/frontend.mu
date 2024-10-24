<script setup lang="ts">
import { onMounted } from "vue";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import useAuth, { getClient } from "../../auth-utils/useAuth";
import useAuthRedirect from "@/auth-utils/useAuthRedirect";

const { user, logout, isLoggedIn, checkIfLoggedIn, avatarUrl } = useAuth(
  getClient()
);

const { setUrl } = useAuthRedirect();

onMounted(() => {
  checkIfLoggedIn();
});
</script>

<template>
  <div class="dark:text-zinc-200 dark:ring-white/10 pl-4">
    <BaseButton
      v-if="!isLoggedIn"
      href="/login"
      color="primary"
      class="font-medium hidden md:block"
      @click="setUrl()"
    >
      Log In
    </BaseButton>
    <BaseButton
      v-if="!isLoggedIn"
      href="/login"
      color="primary"
      class="font-medium block md:hidden"
      size="sm"
      @click="setUrl()"
    >
      Log In
    </BaseButton>
    <div v-else class="flex gap-2 items-center">
      <Menu as="div" class="relative inline-block text-left">
        <div>
          <MenuButton
            class="inline-flex items-center w-full justify-center gap-x-1.5 rounded-full text-sm font-semibold text-verse-900 dark:text-verse-100 shadow-sm ring-gray-300 hover:bg-gray-50"
          >
            <div v-if="avatarUrl">
              <img
                class="w-10 aspect-square rounded-full"
                :src="avatarUrl"
                alt="User Avatar"
              />
            </div>
          </MenuButton>
        </div>

        <transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <MenuItems
            class="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100/10 rounded-md bg-zinc-500/20 dark:bg-verse-500/20 backdrop-blur-2xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <div class="py-1">
              <MenuItem v-slot="{ active }">
                <NuxtLink
                  href="/user/me"
                  class="block px-4 py-2 text-sm"
                  :class="[
                    active
                      ? 'bg-gray-400/10 text-verse-900 dark:text-verse-100'
                      : 'text-verse-900 dark:text-verse-100',
                  ]"
                >
                  My Profile
                </NuxtLink>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <NuxtLink
                  class="block px-4 py-2 text-sm cursor-pointer"
                  :class="[
                    active
                      ? 'bg-gray-400/10 text-verse-900 dark:text-verse-100'
                      : 'text-verse-900 dark:text-verse-100',
                  ]"
                  @click="logout()"
                >
                  Logout
                </NuxtLink>
              </MenuItem>
            </div>
            <div class="text-verse-900 dark:text-verse-100 p-4 text-sm">
              <div class="flex flex-col items-center justify-center gap-2">
                <div v-if="avatarUrl">
                  <img
                    class="w-16 aspect-square rounded-full"
                    :src="avatarUrl"
                  />
                </div>

                {{ user?.full_name }}
              </div>
            </div>
          </MenuItems>
        </transition>
      </Menu>
    </div>
  </div>
</template>
