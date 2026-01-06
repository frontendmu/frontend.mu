<script setup lang="ts">
import LayoutBackdrop from '~/components/layout/LayoutBackdrop.vue'
import SiteNavigation from '~/components/layout/Navigation.vue'
import SiteLeftMenu from '~/components/layout/LeftMenu.vue'
import SiteFooter from '~/components/layout/Footer.vue'
import SponsorHighlight from '~/components/home/SponsorHighlight.vue'
</script>

<template>
  <LayoutBackdrop>
    <SiteNavigation />
    <SiteLeftMenu />
    <slot />

    <SponsorHighlight />

    <SiteFooter />
  </LayoutBackdrop>
</template>
