import { ref } from 'vue'
import { router } from '@inertiajs/vue3'

export function useDeleteConfirmation<T extends { id: string }>() {
  const showModal = ref(false)
  const itemToDelete = ref<T | null>(null) as { value: T | null }
  const isDeleting = ref(false)

  function confirmDelete(item: T) {
    itemToDelete.value = item
    showModal.value = true
  }

  function cancelDelete() {
    showModal.value = false
    itemToDelete.value = null
  }

  function executeDelete(deleteUrl: string) {
    if (!itemToDelete.value) return

    isDeleting.value = true
    router.delete(deleteUrl, {
      onFinish: () => {
        isDeleting.value = false
        showModal.value = false
        itemToDelete.value = null
      },
    })
  }

  return {
    showModal,
    itemToDelete,
    isDeleting,
    confirmDelete,
    cancelDelete,
    executeDelete,
  }
}
