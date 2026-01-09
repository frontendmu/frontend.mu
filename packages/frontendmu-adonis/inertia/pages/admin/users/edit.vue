<script setup lang="ts">
import { computed, ref } from 'vue'
import { Head, Link, useForm, usePage } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

interface Permission {
  id: number
  name: string
  description?: string | null
}

interface Role {
  id: number
  name: string
  description: string | null
  permissions: Permission[]
}

interface User {
  id: string
  name: string
  email: string | null
  roles: Role[]
  permissions: string[] // Current effective permissions
  githubUsername: string | null
  bio: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  websiteUrl: string | null
  featured: boolean
  isOrganizer: boolean
  isCommunityMember: boolean
  avatarUrl: string | null
}

interface Props {
  user: User
  allRoles: Role[]
}

const props = defineProps<Props>()
const page = usePage()
const currentUser = computed(() => page.props.auth.user as any)
const isEditingSelf = computed(() => props.user.id === currentUser.value?.id)

// Track which role is expanded for permission viewing
const expandedRole = ref<number | null>(null)

const form = useForm({
  name: props.user.name,
  email: props.user.email || '',
  roleIds: props.user.roles.map((r) => r.id),
  githubUsername: props.user.githubUsername || '',
  bio: props.user.bio || '',
  linkedinUrl: props.user.linkedinUrl || '',
  twitterUrl: props.user.twitterUrl || '',
  websiteUrl: props.user.websiteUrl || '',
  featured: props.user.featured,
  isOrganizer: props.user.isOrganizer,
  isCommunityMember: props.user.isCommunityMember,
})

function handleSubmit() {
  form.put(`/admin/users/${props.user.id}`)
}

function toggleRole(roleId: number) {
  const index = form.roleIds.indexOf(roleId)
  if (index === -1) {
    form.roleIds.push(roleId)
  } else {
    // Don't allow removing the last role
    if (form.roleIds.length > 1) {
      form.roleIds.splice(index, 1)
    }
  }
}

function isRoleSelected(roleId: number) {
  return form.roleIds.includes(roleId)
}

function toggleExpandRole(roleId: number) {
  expandedRole.value = expandedRole.value === roleId ? null : roleId
}

// Compute effective permissions based on selected roles
const effectivePermissions = computed(() => {
  const permissions = new Set<string>()
  for (const role of props.allRoles) {
    if (form.roleIds.includes(role.id)) {
      for (const perm of role.permissions) {
        permissions.add(perm.name)
      }
    }
  }
  return Array.from(permissions).sort()
})

// Check if superadmin is trying to remove their own superadmin role
const isTryingToRemoveSuperadmin = computed(() => {
  if (!isEditingSelf.value) return false
  const superadminRole = props.allRoles.find((r) => r.name === 'superadmin')
  if (!superadminRole) return false
  const hadSuperadmin = props.user.roles.some((r) => r.name === 'superadmin')
  const hasSuperadmin = form.roleIds.includes(superadminRole.id)
  return hadSuperadmin && !hasSuperadmin
})

// Role badge colors
function getRoleBadgeClass(roleName: string) {
  switch (roleName) {
    case 'superadmin':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'organizer':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'member':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'viewer':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    default:
      return 'bg-verse-100 text-verse-800 dark:bg-verse-700 dark:text-verse-200'
  }
}

// Permission category grouping
function getPermissionCategory(permName: string) {
  if (permName.includes('event')) return 'Events'
  if (permName.includes('rsvp')) return 'RSVPs'
  if (permName.includes('user') || permName.includes('role')) return 'Users'
  if (permName.includes('speaker')) return 'Speakers'
  if (permName.includes('session')) return 'Sessions'
  if (permName.includes('sponsor')) return 'Sponsors'
  if (permName.includes('admin') || permName.includes('analytics') || permName.includes('settings'))
    return 'Admin'
  return 'Other'
}

const groupedPermissions = computed(() => {
  const groups: Record<string, string[]> = {}
  for (const perm of effectivePermissions.value) {
    const category = getPermissionCategory(perm)
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(perm)
  }
  return groups
})
</script>

<template>
  <Head :title="`Edit User: ${user.name}`" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20 max-w-3xl mx-auto">
        <!-- Breadcrumb -->
        <nav class="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/admin"
            class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200"
          >
            Admin
          </Link>
          <span class="text-verse-400">/</span>
          <Link
            href="/admin/users"
            class="text-verse-600 hover:text-verse-800 dark:text-verse-400 dark:hover:text-verse-200"
          >
            Users
          </Link>
          <span class="text-verse-400">/</span>
          <span class="text-verse-900 dark:text-verse-100">{{ user.name }}</span>
        </nav>

        <!-- Header with Avatar -->
        <div class="flex items-center gap-4 mb-8">
          <img
            v-if="user.avatarUrl"
            :src="user.avatarUrl"
            :alt="user.name"
            class="w-20 h-20 rounded-full object-cover"
          />
          <div
            v-else
            class="w-20 h-20 rounded-full bg-verse-200 dark:bg-verse-700 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10 text-verse-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div>
            <BaseHeading :level="1">Edit User</BaseHeading>
            <p class="text-verse-600 dark:text-verse-400">
              {{ user.name }}
              <span v-if="isEditingSelf" class="text-sm text-verse-500">(Your account)</span>
            </p>
            <!-- Current roles badges -->
            <div class="flex flex-wrap gap-1 mt-2">
              <span
                v-for="role in user.roles"
                :key="role.id"
                :class="['px-2 py-0.5 text-xs font-medium rounded-full', getRoleBadgeClass(role.name)]"
              >
                {{ role.name }}
              </span>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Basic Info Section -->
          <div class="bg-white dark:bg-verse-800 rounded-lg border border-verse-200 dark:border-verse-700 p-6">
            <h2 class="text-lg font-semibold text-verse-900 dark:text-verse-100 mb-4">
              Basic Information
            </h2>

            <div class="space-y-4">
              <!-- Name -->
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
                >
                  Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
                />
                <p v-if="form.errors.name" class="mt-1 text-sm text-red-500">
                  {{ form.errors.name }}
                </p>
              </div>

              <!-- Email -->
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
                />
                <p v-if="form.errors.email" class="mt-1 text-sm text-red-500">
                  {{ form.errors.email }}
                </p>
              </div>

              <!-- GitHub Username -->
              <div>
                <label
                  for="githubUsername"
                  class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
                >
                  GitHub Username
                </label>
                <div class="flex">
                  <span
                    class="inline-flex items-center px-3 border border-r-0 border-verse-300 dark:border-verse-600 rounded-l-lg bg-verse-50 dark:bg-verse-700 text-verse-500 dark:text-verse-400"
                  >
                    @
                  </span>
                  <input
                    id="githubUsername"
                    v-model="form.githubUsername"
                    type="text"
                    class="flex-1 px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-r-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
                  />
                </div>
                <p class="mt-1 text-xs text-verse-500 dark:text-verse-400">
                  Used to fetch avatar from GitHub
                </p>
              </div>

              <!-- Bio -->
              <div>
                <label
                  for="bio"
                  class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  v-model="form.bio"
                  rows="3"
                  class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <!-- Roles Section -->
          <div class="bg-white dark:bg-verse-800 rounded-lg border border-verse-200 dark:border-verse-700 p-6">
            <h2 class="text-lg font-semibold text-verse-900 dark:text-verse-100 mb-2">
              Roles & Permissions
            </h2>
            <p class="text-sm text-verse-600 dark:text-verse-400 mb-4">
              Assign one or more roles to this user. Permissions are derived from the selected roles.
            </p>

            <div class="space-y-3">
              <div
                v-for="role in allRoles"
                :key="role.id"
                :class="[
                  'border rounded-lg overflow-hidden transition-all',
                  isRoleSelected(role.id)
                    ? 'border-verse-500 bg-verse-50 dark:bg-verse-700/50'
                    : 'border-verse-200 dark:border-verse-700',
                ]"
              >
                <!-- Role Header -->
                <div
                  class="flex items-center gap-3 p-4 cursor-pointer"
                  @click="toggleRole(role.id)"
                >
                  <input
                    type="checkbox"
                    :checked="isRoleSelected(role.id)"
                    :disabled="isEditingSelf && role.name === 'superadmin' && isRoleSelected(role.id)"
                    class="h-5 w-5 text-verse-600 focus:ring-verse-500 border-verse-300 rounded"
                    @click.stop="toggleRole(role.id)"
                  />
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <span
                        :class="[
                          'px-2 py-0.5 text-xs font-semibold rounded-full',
                          getRoleBadgeClass(role.name),
                        ]"
                      >
                        {{ role.name }}
                      </span>
                      <span class="text-sm text-verse-600 dark:text-verse-400">
                        {{ role.description }}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="p-1 text-verse-400 hover:text-verse-600 dark:hover:text-verse-200"
                    @click.stop="toggleExpandRole(role.id)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      :class="['h-5 w-5 transition-transform', expandedRole === role.id ? 'rotate-180' : '']"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                <!-- Role Permissions (Expandable) -->
                <div
                  v-if="expandedRole === role.id"
                  class="border-t border-verse-200 dark:border-verse-600 bg-verse-50 dark:bg-verse-800 p-4"
                >
                  <p class="text-xs font-medium text-verse-500 dark:text-verse-400 mb-2">
                    Permissions included in this role:
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="perm in role.permissions"
                      :key="perm.id"
                      class="px-2 py-0.5 text-xs bg-verse-200 dark:bg-verse-600 text-verse-700 dark:text-verse-300 rounded"
                    >
                      {{ perm.name }}
                    </span>
                    <span
                      v-if="role.permissions.length === 0"
                      class="text-xs text-verse-400 italic"
                    >
                      No permissions
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Warning for self-edit -->
            <div
              v-if="isTryingToRemoveSuperadmin"
              class="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg"
            >
              <p class="text-sm text-amber-800 dark:text-amber-200">
                You cannot remove the superadmin role from yourself.
              </p>
            </div>

            <p v-if="form.errors.roleIds" class="mt-2 text-sm text-red-500">
              {{ form.errors.roleIds }}
            </p>
          </div>

          <!-- Effective Permissions Preview -->
          <div class="bg-verse-50 dark:bg-verse-900 rounded-lg border border-verse-200 dark:border-verse-700 p-6">
            <h3 class="text-sm font-semibold text-verse-700 dark:text-verse-300 mb-3">
              Effective Permissions ({{ effectivePermissions.length }})
            </h3>
            <div v-if="effectivePermissions.length > 0" class="space-y-3">
              <div v-for="(perms, category) in groupedPermissions" :key="category">
                <p class="text-xs font-medium text-verse-500 dark:text-verse-400 mb-1">
                  {{ category }}
                </p>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="perm in perms"
                    :key="perm"
                    class="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded"
                  >
                    {{ perm }}
                  </span>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-verse-500 dark:text-verse-400 italic">
              No permissions. Select at least one role.
            </p>
          </div>

          <!-- Social Links -->
          <div class="bg-white dark:bg-verse-800 rounded-lg border border-verse-200 dark:border-verse-700 p-6">
            <h2 class="text-lg font-semibold text-verse-900 dark:text-verse-100 mb-4">
              Social Links
            </h2>
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label
                  for="linkedinUrl"
                  class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
                >
                  LinkedIn
                </label>
                <input
                  id="linkedinUrl"
                  v-model="form.linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  for="twitterUrl"
                  class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
                >
                  Twitter
                </label>
                <input
                  id="twitterUrl"
                  v-model="form.twitterUrl"
                  type="url"
                  placeholder="https://twitter.com/..."
                  class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  for="websiteUrl"
                  class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-2"
                >
                  Website
                </label>
                <input
                  id="websiteUrl"
                  v-model="form.websiteUrl"
                  type="url"
                  placeholder="https://..."
                  class="w-full px-4 py-2 border border-verse-300 dark:border-verse-600 rounded-lg bg-white dark:bg-verse-800 text-verse-900 dark:text-verse-100 focus:ring-2 focus:ring-verse-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <!-- Flags -->
          <div class="bg-white dark:bg-verse-800 rounded-lg border border-verse-200 dark:border-verse-700 p-6">
            <h2 class="text-lg font-semibold text-verse-900 dark:text-verse-100 mb-4">
              Display Flags
            </h2>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <input
                  id="featured"
                  v-model="form.featured"
                  type="checkbox"
                  class="h-4 w-4 text-verse-600 focus:ring-verse-500 border-verse-300 rounded"
                />
                <label for="featured" class="text-sm text-verse-700 dark:text-verse-300">
                  Featured user
                </label>
              </div>
              <div class="flex items-center gap-3">
                <input
                  id="isOrganizer"
                  v-model="form.isOrganizer"
                  type="checkbox"
                  class="h-4 w-4 text-verse-600 focus:ring-verse-500 border-verse-300 rounded"
                />
                <label for="isOrganizer" class="text-sm text-verse-700 dark:text-verse-300">
                  Show as organizer on team page
                </label>
              </div>
              <div class="flex items-center gap-3">
                <input
                  id="isCommunityMember"
                  v-model="form.isCommunityMember"
                  type="checkbox"
                  class="h-4 w-4 text-verse-600 focus:ring-verse-500 border-verse-300 rounded"
                />
                <label for="isCommunityMember" class="text-sm text-verse-700 dark:text-verse-300">
                  Show as community member
                </label>
              </div>
            </div>
          </div>

          <!-- Submit -->
          <div class="flex justify-end gap-4 pt-4">
            <Link
              href="/admin/users"
              class="px-6 py-2 text-verse-700 dark:text-verse-300 hover:bg-verse-100 dark:hover:bg-verse-700 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              :disabled="form.processing || isTryingToRemoveSuperadmin || form.roleIds.length === 0"
              class="px-6 py-2 bg-verse-600 hover:bg-verse-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="form.processing">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
