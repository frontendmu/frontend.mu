import { computed } from 'vue'
import { usePage } from '@inertiajs/vue3'
import type { Data } from '@generated/data'

export function useAuth() {
  const page = usePage<Data.SharedProps>()

  const user = computed(() => page.props.auth.user)
  const isAuthenticated = computed(() => page.props.auth.isAuthenticated)
  const isSuperadmin = computed(() => user.value?.role === 'superadmin')
  const isAdmin = computed(() => ['superadmin', 'organizer'].includes(user.value?.role ?? ''))

  return { user, isAuthenticated, isSuperadmin, isAdmin }
}
