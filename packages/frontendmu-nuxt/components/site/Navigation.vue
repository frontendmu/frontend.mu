<script setup lang="ts">
// import RandomColor from "../components/RandomColor.astro";
</script>

<template>
  <SiteMenu>
    <template #dock-right>
      <MiscColorModeToggle />
      <AuthLoggedUser />
    </template>
    <!-- <RandomColor slot="dock-right" /> -->
  </SiteMenu>

  <div
    id="sticky-observer"
    class="bg-transparent z-0 h-4 w-full top-32 relative"
  />
</template>

<!-- <script>
const logo = document.getElementById("logo");
if (logo) {
  logo.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    window.location.href = "/branding";
  });
}
</script> -->
