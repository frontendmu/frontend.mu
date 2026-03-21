import { computed } from 'vue'
import { usePage } from '@inertiajs/vue3'
import type { Data } from '@generated/data'

export function useAuth() {
  const page = usePage<Data.SharedProps>()

  const user = computed(() => page.props.auth.user)
  const isAuthenticated = computed(() => page.props.auth.isAuthenticated)
  const hasRole = (roleName: string) =>
    user.value?.roles.some((role) => role.name === roleName) ?? false
  const isSuperadmin = computed(() => hasRole('superadmin'))
  const isAdmin = computed(() => hasRole('superadmin') || hasRole('organizer'))

  return { user, isAuthenticated, isSuperadmin, isAdmin }
}
