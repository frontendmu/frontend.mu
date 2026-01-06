import { usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

/**
 * Composable for accessing page metadata and shared data
 */
export function usePageMeta() {
  const page = usePage()

  const url = computed(() => page.url)
  const props = computed(() => page.props)
  
  // Access auth from shared data if available
  const auth = computed(() => (page.props as any)?.auth || null)
  const isAuthenticated = computed(() => !!auth.value?.user)
  const user = computed(() => auth.value?.user || null)

  // Access errors from shared data
  const errors = computed(() => (page.props as any)?.errors || {})

  return {
    url,
    props,
    auth,
    isAuthenticated,
    user,
    errors,
  }
}

export default usePageMeta
