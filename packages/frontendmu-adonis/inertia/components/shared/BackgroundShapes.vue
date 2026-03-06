<template>
  <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-white dark:bg-verse-950">
    <!-- Grid pattern overlay -->
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzYyRDAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwdjIwSDBWMjBoMjB6bTIwIDB2MjBIMjBWMjBoMjB6TTAgMGgyMHYyMEgwVjB6bTIwIDBoMjB2MjBIMjBWMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40 dark:opacity-60"></div>

    <!-- Grain Texture Overlay -->
    <div class="absolute inset-0 opacity-[0.1] dark:opacity-[0.2] pointer-events-none bg-[url('/noise.svg')]"></div>
    
    <!-- Accent Line (Top) -->
    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-verse-500 via-transparent to-verse-500 opacity-20"></div>
  </div>
</template>

<style scoped>
/* No styles needed, using Tailwind */
</style>
