<script setup lang="ts">
import Menu from '~/components/layout/Menu.vue'
import ColorModeToggle from '~/components/shared/ColorModeToggle.vue'
</script>

<template>
  <Menu>
    <template #dock-right>
      <ColorModeToggle />
      <!-- AuthLoggedUser will be added later -->
    </template>
  </Menu>

  <div
    id="sticky-observer"
    class="bg-transparent z-0 h-4 w-full top-32 relative"
  />
</template>
