<script setup lang="ts">
import { computed, ref } from 'vue'
import { Head, useForm, usePage, Link } from '@inertiajs/vue3'
import type { Data } from '@generated/data'
import AdminShell from '~/components/admin/ui/AdminShell.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminButton from '~/components/admin/ui/AdminButton.vue'
import AdminInput from '~/components/admin/ui/AdminInput.vue'
import AdminTextarea from '~/components/admin/ui/AdminTextarea.vue'
import AdminCheckbox from '~/components/admin/ui/AdminCheckbox.vue'
import AdminBadge from '~/components/admin/ui/AdminBadge.vue'
import AdminAvatar from '~/components/admin/ui/AdminAvatar.vue'

type SharedProps = Data.SharedProps

interface Rsvp {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string | null
  status: string
}

type AdminRole = Data.Role.Variants['forAdminEdit']
type AdminUser = Data.AdminUser.Variants['forAdminEdit'] & { rsvps: Rsvp[] }

interface Props {
  user: AdminUser
  allRoles: AdminRole[]
}

const props = defineProps<Props>()
const page = usePage<SharedProps>()
const currentUser = computed(() => page.props.auth.user)
const isEditingSelf = computed(() => props.user.id === currentUser.value?.id)

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
  title: props.user.title || '',
})

function handleSubmit() {
  form.put(`/admin/users/${props.user.id}`)
}

function toggleRole(roleId: number) {
  const index = form.roleIds.indexOf(roleId)
  if (index === -1) {
    form.roleIds.push(roleId)
  } else if (form.roleIds.length > 1) {
    form.roleIds.splice(index, 1)
  }
}

function isRoleSelected(roleId: number) {
  return form.roleIds.includes(roleId)
}

function toggleExpandRole(roleId: number) {
  expandedRole.value = expandedRole.value === roleId ? null : roleId
}

const effectivePermissions = computed(() => {
  const permissions = new Set<string>()
  for (const role of props.allRoles) {
    if (form.roleIds.includes(role.id)) {
      for (const perm of role.permissions) permissions.add(perm.name)
    }
  }
  return Array.from(permissions).sort()
})

const isTryingToRemoveSuperadmin = computed(() => {
  if (!isEditingSelf.value) return false
  const superadminRole = props.allRoles.find((r) => r.name === 'superadmin')
  if (!superadminRole) return false
  const hadSuperadmin = props.user.roles.some((r) => r.name === 'superadmin')
  const hasSuperadmin = form.roleIds.includes(superadminRole.id)
  return hadSuperadmin && !hasSuperadmin
})

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
    if (!groups[category]) groups[category] = []
    groups[category].push(perm)
  }
  return groups
})

function roleTone(name: string) {
  switch (name) {
    case 'superadmin':
      return 'danger'
    case 'organizer':
      return 'accent'
    case 'member':
      return 'info'
    case 'viewer':
      return 'muted'
    default:
      return 'neutral'
  }
}
</script>

<template>
  <Head :title="`${user.name} · Admin`" />
  <AdminShell
    :title="user.name"
    :description="
      isEditingSelf ? 'You are editing your own account.' : 'Account, roles and permissions.'
    "
    :breadcrumbs="[
      { label: 'Admin', href: '/admin' },
      { label: 'Users', href: '/admin/users' },
      { label: user.name },
    ]"
  >
    <template #media>
      <AdminAvatar :src="user.avatarUrl" :name="user.name" size="xl" rounded="2xl" />
    </template>
    <template #meta>
      <div class="flex flex-wrap gap-1.5">
        <AdminBadge v-for="role in user.roles" :key="role.id" :tone="roleTone(role.name)">
          {{ role.name }}
        </AdminBadge>
      </div>
    </template>

    <form class="space-y-6 max-w-3xl" @submit.prevent="handleSubmit">
      <AdminCard title="Basic info">
        <div class="space-y-5">
          <AdminInput v-model="form.name" label="Name" required :error="form.errors.name" />
          <AdminInput v-model="form.email" label="Email" type="email" :error="form.errors.email" />
          <AdminInput
            v-model="form.githubUsername"
            label="GitHub username"
            leading-text="@"
            hint="Used to fetch the avatar from GitHub"
          />
          <AdminInput
            v-model="form.title"
            label="Title"
            placeholder="e.g. Lead Organiser, Software Engineer"
            hint="Shown on the team page under the user's name"
          />
          <AdminTextarea v-model="form.bio" label="Bio" :rows="3" />
        </div>
      </AdminCard>

      <AdminCard
        title="Roles & permissions"
        description="Assign one or more roles. Permissions are derived from the selected roles."
      >
        <div class="space-y-2">
          <div
            v-for="role in allRoles"
            :key="role.id"
            :class="[
              'rounded-xl border transition-colors overflow-hidden',
              isRoleSelected(role.id)
                ? 'border-verse-400 dark:border-verse-600 bg-verse-50/50 dark:bg-verse-900/40'
                : 'border-verse-200 dark:border-verse-800',
            ]"
          >
            <div class="flex items-center gap-3 p-3.5">
              <input
                type="checkbox"
                :checked="isRoleSelected(role.id)"
                :disabled="
                  isEditingSelf && role.name === 'superadmin' && isRoleSelected(role.id)
                "
                class="h-4 w-4 text-verse-600 focus:ring-verse-500 border-verse-300 dark:border-verse-700 rounded cursor-pointer"
                :aria-labelledby="`role-${role.id}-label`"
                @change="toggleRole(role.id)"
              />
              <div class="flex-1 min-w-0">
                <div :id="`role-${role.id}-label`" class="flex items-center gap-2 flex-wrap">
                  <AdminBadge :tone="roleTone(role.name)">{{ role.name }}</AdminBadge>
                  <span class="text-sm text-verse-600 dark:text-verse-300">
                    {{ role.description }}
                  </span>
                </div>
              </div>
              <button
                type="button"
                class="p-1 rounded-md text-verse-400 hover:text-verse-700 dark:hover:text-verse-200"
                :aria-label="expandedRole === role.id ? 'Hide permissions' : 'Show permissions'"
                @click="toggleExpandRole(role.id)"
              >
                <svg
                  :class="['w-4 h-4 transition-transform', expandedRole === role.id ? 'rotate-180' : '']"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
            <div
              v-if="expandedRole === role.id"
              class="px-3.5 pb-3.5 pt-1 border-t border-verse-200 dark:border-verse-800"
            >
              <p class="text-[11px] font-mono uppercase tracking-wide text-verse-500 dark:text-verse-300 mb-2">
                Permissions in this role
              </p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="perm in role.permissions"
                  :key="perm.id"
                  class="px-2 py-0.5 text-xs font-mono bg-verse-100 dark:bg-verse-800 text-verse-700 dark:text-verse-200 rounded"
                >
                  {{ perm.name }}
                </span>
                <span
                  v-if="role.permissions.length === 0"
                  class="text-xs text-verse-400 italic"
                >No permissions</span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="isTryingToRemoveSuperadmin"
          class="mt-4 px-3.5 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 text-sm text-amber-800 dark:text-amber-200"
        >
          You cannot remove the superadmin role from yourself.
        </div>

        <p v-if="form.errors.roleIds" class="mt-2 text-sm text-red-600 dark:text-red-400">
          {{ form.errors.roleIds }}
        </p>
      </AdminCard>

      <AdminCard
        title="Effective permissions"
        :description="`${effectivePermissions.length} permission${effectivePermissions.length === 1 ? '' : 's'} based on the selected roles.`"
      >
        <div v-if="effectivePermissions.length > 0" class="space-y-3">
          <div v-for="(perms, category) in groupedPermissions" :key="category">
            <p class="text-[11px] font-mono uppercase tracking-wide text-verse-500 dark:text-verse-300 mb-1.5">
              {{ category }}
            </p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="perm in perms"
                :key="perm"
                class="px-2 py-0.5 text-xs font-mono bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded"
              >
                {{ perm }}
              </span>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-verse-500 dark:text-verse-300 italic">
          No permissions. Select at least one role.
        </p>
      </AdminCard>

      <AdminCard title="Social links">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminInput v-model="form.linkedinUrl" label="LinkedIn" type="url" placeholder="https://linkedin.com/in/…" />
          <AdminInput v-model="form.twitterUrl" label="Twitter" type="url" placeholder="https://twitter.com/…" />
          <AdminInput v-model="form.websiteUrl" label="Website" type="url" placeholder="https://…" />
        </div>
      </AdminCard>

      <AdminCard title="Display flags" description="Where this person appears on the public site.">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <AdminCheckbox
            v-model="form.featured"
            label="Featured"
            description="Shown prominently on the speakers page."
          />
          <AdminCheckbox
            v-model="form.isOrganizer"
            label="Organizer"
            description="Listed as an organizer on the team page."
          />
          <AdminCheckbox
            v-model="form.isCommunityMember"
            label="Community member"
            description="Listed as a community member on the team page."
          />
        </div>
      </AdminCard>

      <AdminCard
        v-if="user.sessions.length"
        :title="`Sessions (${user.sessions.length})`"
        description="Read-only — manage assignments from the event edit page."
      >
        <div class="space-y-2">
          <div
            v-for="session in user.sessions"
            :key="session.id"
            class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-verse-50 dark:bg-verse-900/40 border border-verse-200 dark:border-verse-800"
          >
            <div class="min-w-0">
              <p class="font-medium text-verse-900 dark:text-verse-100 truncate">{{ session.title }}</p>
              <p v-if="session.eventTitle" class="text-xs text-verse-500 dark:text-verse-300 truncate">
                {{ session.eventTitle }}
                <span v-if="session.eventDate"> · {{ session.eventDate }}</span>
              </p>
            </div>
            <Link
              v-if="session.eventId"
              :href="`/admin/events/${session.eventId}/edit`"
              class="text-xs font-medium text-verse-700 dark:text-verse-300 hover:text-verse-900 dark:hover:text-white whitespace-nowrap"
            >
              View event →
            </Link>
          </div>
        </div>
      </AdminCard>

      <AdminCard
        v-if="user.rsvps.length"
        :title="`RSVPs (${user.rsvps.length})`"
        description="History of events this user has signed up for."
      >
        <div class="space-y-2">
          <div
            v-for="rsvp in user.rsvps"
            :key="rsvp.id"
            class="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-verse-50 dark:bg-verse-900/40 border border-verse-200 dark:border-verse-800"
          >
            <div class="min-w-0">
              <p class="font-medium text-verse-900 dark:text-verse-100 truncate">{{ rsvp.eventTitle }}</p>
              <p v-if="rsvp.eventDate" class="text-xs text-verse-500 dark:text-verse-300">
                {{ rsvp.eventDate }}
              </p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <AdminBadge
                :tone="
                  rsvp.status === 'confirmed'
                    ? 'success'
                    : rsvp.status === 'waitlist'
                      ? 'warning'
                      : 'danger'
                "
                dot
              >
                {{ rsvp.status }}
              </AdminBadge>
              <Link
                :href="`/admin/events/${rsvp.eventId}/edit`"
                class="text-xs font-medium text-verse-700 dark:text-verse-300 hover:text-verse-900 dark:hover:text-white whitespace-nowrap"
              >
                View →
              </Link>
            </div>
          </div>
        </div>
      </AdminCard>

      <div class="sticky bottom-3 z-10 flex justify-end gap-2 bg-white/85 dark:bg-verse-950/85 backdrop-blur-md p-3 rounded-xl border border-verse-200 dark:border-verse-800">
        <AdminButton href="/admin/users" variant="secondary">Cancel</AdminButton>
        <AdminButton
          type="submit"
          variant="primary"
          :loading="form.processing"
          :disabled="isTryingToRemoveSuperadmin || form.roleIds.length === 0"
        >
          {{ form.processing ? 'Saving…' : 'Save changes' }}
        </AdminButton>
      </div>
    </form>
  </AdminShell>
</template>
