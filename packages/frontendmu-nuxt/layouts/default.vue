<script setup lang="ts">
defineOgImageComponent("Generic");
</script>

<template>
  <NuxtLoadingIndicator />
  <LayoutBackdrop>
    <SiteNavigation />
    <SiteLeftMenu />
    <slot />

    <HomeSponsorHighlight />

    <SiteFooter />
  </LayoutBackdrop>
</template>
