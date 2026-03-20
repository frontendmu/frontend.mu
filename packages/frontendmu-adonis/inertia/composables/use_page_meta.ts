import { usePage } from '@inertiajs/vue3'
import { computed } from 'vue'
import type { Data } from '@generated/data'

/**
 * Composable for accessing page metadata and shared data
 */
export function usePageMeta() {
  const page = usePage<Data.SharedProps>()

  const url = computed(() => page.url)
  const props = computed(() => page.props)

  // Access auth from shared data
  const auth = computed(() => page.props.auth || null)
  const isAuthenticated = computed(() => !!auth.value?.user)
  const user = computed(() => auth.value?.user || null)

  // Access errors from shared data
  const errors = computed(() => page.props.errors || {})

  return {
    url,
    props,
    auth,
    isAuthenticated,
    user,
    errors,
  }
}
