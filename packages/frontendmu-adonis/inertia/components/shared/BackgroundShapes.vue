<template>
  <div class="fixed w-[100dvw] h-auto bg-position">
    <div class="bg-animation animate-spin">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 800 800"
      >
        <defs>
          <linearGradient
            id="ccchaos-grad"
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
          >
            <stop stop-color="hsl(206, 75%, 49%)" stop-opacity="1" offset="0%" />
            <stop
              stop-color="hsl(331, 90%, 56%)"
              stop-opacity="1"
              offset="100%"
            />
          </linearGradient>
        </defs>
        <g
          stroke-width="2"
          stroke="url(#ccchaos-grad)"
          fill="none"
          stroke-linecap="round"
        >
          <circle cx="400" cy="400" r="200" opacity="0.1" />
          <circle cx="400" cy="400" r="250" opacity="0.15" />
          <circle cx="400" cy="400" r="300" opacity="0.2" />
          <circle cx="400" cy="400" r="350" opacity="0.25" />
        </g>
      </svg>
    </div>
  </div>
</template>

<style>
.bg-animation {
  opacity: 0.1;
  animation: spin 50s ease-in-out infinite;
}

.bg-position {
  left: -30%;
  top: -50%;
}

html.dark .bg-animation {
  opacity: 0.2;
}
</style>
