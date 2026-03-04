<script setup lang="ts">
import { Head, useForm, Link } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'

interface Props {
  user: {
    id: string
    name: string
    email: string | null
    role: string
    roles?: { id: number; name: string }[]
    bio: string | null
    githubUsername: string | null
    twitterUrl: string | null
    linkedinUrl: string | null
    websiteUrl: string | null
    avatarUrl: string | null
    isOrganizer: boolean
    isCommunityMember: boolean
  } | null
}

const props = defineProps<Props>()

const form = useForm({
  name: props.user?.name || '',
  bio: props.user?.bio || '',
  twitterUrl: props.user?.twitterUrl || '',
  linkedinUrl: props.user?.linkedinUrl || '',
  websiteUrl: props.user?.websiteUrl || '',
})

function handleSubmit() {
  form.put('/profile')
}

// Get user's roles display
function getUserRoles() {
  if (props.user?.roles && props.user.roles.length > 0) {
    return props.user.roles
  }
  // Fallback to legacy role field
  if (props.user?.role) {
    return [{ id: 0, name: props.user.role }]
  }
  return []
}

function getRoleBadgeClass(roleName: string) {
  switch (roleName) {
    case 'superadmin':
      return 'bg-red-500/10 text-red-600 border-red-500/20'
    case 'organizer':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    case 'member':
      return 'bg-verse-500/10 text-verse-600 border-verse-500/20'
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
  }
}
</script>

<template>
  <Head title="Profile" />
  <DefaultLayout>
    <main class="relative min-h-screen pt-40 pb-24">
      <div class="contain relative z-10">
        <template v-if="user">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            <!-- Left Column: Profile Preview -->
            <div class="lg:col-span-5 space-y-8">
              <div class="bg-white dark:bg-verse-950/80 backdrop-blur-2xl border border-verse-100 dark:border-verse-800 rounded-[3rem] p-8 shadow-2xl shadow-black/10 text-center lg:text-left">
                <div class="flex flex-col lg:flex-row items-center gap-8 mb-8">
                  <div class="relative group">
                    <div class="absolute inset-0 bg-verse-500 rounded-3xl rotate-6 opacity-20 transition-transform group-hover:rotate-12"></div>
                    <img v-if="user.avatarUrl"
                      :src="user.avatarUrl"
                      class="relative w-32 h-32 rounded-3xl border-4 border-white dark:border-verse-950 object-cover shadow-xl"
                    />
                    <div v-else class="relative w-32 h-32 rounded-3xl bg-verse-500 flex items-center justify-center text-4xl font-black text-white shadow-xl">
                      {{ user.name.charAt(0) }}
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <h1 class="text-3xl md:text-4xl font-black tracking-tighter dark:text-white leading-none">
                      {{ user.name }}
                    </h1>
                    <p class="text-sm font-bold text-gray-400 truncate">{{ user.email }}</p>
                  </div>
                </div>

                <div class="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
                  <span
                    v-for="role in getUserRoles()"
                    :key="role.id"
                    :class="[
                      'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
                      getRoleBadgeClass(role.name),
                    ]"
                  >
                    {{ role.name }}
                  </span>
                </div>

                <div v-if="user.bio" class="mb-8 p-6 bg-gray-50 dark:bg-verse-900/40 rounded-2xl italic text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                  "{{ user.bio }}"
                </div>

                <div class="flex flex-wrap justify-center lg:justify-start gap-4">
                  <a v-if="user.githubUsername" :href="`https://github.com/${user.githubUsername}`" target="_blank" class="p-3 bg-gray-100 dark:bg-verse-900/60 rounded-xl text-gray-500 hover:text-verse-500 transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                  <a v-if="user.twitterUrl" :href="user.twitterUrl" target="_blank" class="p-3 bg-gray-100 dark:bg-verse-900/60 rounded-xl text-gray-500 hover:text-verse-500 transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a v-if="user.linkedinUrl" :href="user.linkedinUrl" target="_blank" class="p-3 bg-gray-100 dark:bg-verse-900/60 rounded-xl text-gray-500 hover:text-verse-500 transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                </div>
              </div>

              <!-- Danger Zone -->
              <div class="p-8 bg-red-500/5 border border-red-500/10 rounded-[3rem]">
                <h3 class="text-sm font-black uppercase tracking-widest text-red-600 mb-4">Account Security</h3>
                <form method="POST" action="/logout">
                  <button type="submit" class="w-full py-4 bg-red-500 text-white font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-500/20">
                    Sign Out
                  </button>
                </form>
              </div>
            </div>

            <!-- Right Column: Edit Form -->
            <div class="lg:col-span-7 space-y-12">
              <div class="space-y-6">
                <div class="flex items-center gap-3">
                  <span class="h-px w-8 bg-verse-500"></span>
                  <h2 class="text-sm font-black uppercase tracking-[0.3em] text-verse-500">Account Settings</h2>
                </div>
                
                <form @submit.prevent="handleSubmit" class="space-y-8">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-2">
                      <label for="name" class="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Full Name</label>
                      <input id="name" v-model="form.name" type="text" required class="w-full px-6 py-4 bg-white dark:bg-verse-900/60 border border-verse-100 dark:border-verse-800 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:border-verse-500 transition-colors" />
                      <p v-if="form.errors.name" class="text-xs text-red-500 ml-4">{{ form.errors.name }}</p>
                    </div>
                    
                    <div class="space-y-2">
                      <label for="websiteUrl" class="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Personal Website</label>
                      <input id="websiteUrl" v-model="form.websiteUrl" type="url" placeholder="https://" class="w-full px-6 py-4 bg-white dark:bg-verse-900/60 border border-verse-100 dark:border-verse-800 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:border-verse-500 transition-colors" />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label for="bio" class="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Biography</label>
                    <textarea id="bio" v-model="form.bio" rows="4" class="w-full px-6 py-4 bg-white dark:bg-verse-900/60 border border-verse-100 dark:border-verse-800 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:border-verse-500 transition-colors"></textarea>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-2">
                      <label for="twitterUrl" class="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Twitter Profile</label>
                      <input id="twitterUrl" v-model="form.twitterUrl" type="url" placeholder="https://twitter.com/..." class="w-full px-6 py-4 bg-white dark:bg-verse-900/60 border border-verse-100 dark:border-verse-800 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:border-verse-500 transition-colors" />
                    </div>
                    <div class="space-y-2">
                      <label for="linkedinUrl" class="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">LinkedIn Profile</label>
                      <input id="linkedinUrl" v-model="form.linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." class="w-full px-6 py-4 bg-white dark:bg-verse-900/60 border border-verse-100 dark:border-verse-800 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:border-verse-500 transition-colors" />
                    </div>
                  </div>

                  <div class="flex justify-end pt-4">
                    <button type="submit" :disabled="form.processing" class="px-12 py-5 bg-verse-500 text-white font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-verse-500/20 disabled:opacity-50">
                      {{ form.processing ? 'Saving...' : 'Update Profile' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="text-center py-32 space-y-8">
            <div class="w-24 h-24 bg-verse-50 dark:bg-verse-900/20 rounded-full flex items-center justify-center mx-auto">
              <svg class="w-12 h-12 text-verse-500 dark:text-verse-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 class="text-4xl font-black tracking-tight dark:text-white">Authentication required.</h2>
            <Link href="/login" class="inline-flex items-center gap-4 px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all">
              Sign In to View
            </Link>
          </div>
        </template>
      </div>
    </main>
  </DefaultLayout>
</template>
