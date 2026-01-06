<script setup lang="ts">
import LayoutBackdrop from '~/components/layout/LayoutBackdrop.vue'
import SiteNavigation from '~/components/layout/Navigation.vue'
import SiteFooter from '~/components/layout/Footer.vue'
</script>

<template>
  <LayoutBackdrop>
    <SiteNavigation />
    <slot />
    <SiteFooter />
  </LayoutBackdrop>
</template>
