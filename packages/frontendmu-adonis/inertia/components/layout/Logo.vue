<script setup lang="ts">
interface Props {
  loading?: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="[{ spin: !!loading }]">
    <svg
      width="100%"
      viewBox="0 0 874 875"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M859.531 437.446C859.531 670.711 670.358 859.812 436.996 859.812C203.635 859.812 14.461 670.711 14.461 437.446C14.461 204.182 203.635 15.0801 436.996 15.0801C670.358 15.0801 859.531 204.182 859.531 437.446Z"
        stroke="currentColor"
        stroke-width="30"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M366.465 176.049H457.133L344.931 440.435L344.907 440.492L242.953 682.966H152.312L366.465 176.049ZM510.002 230.04L721.787 441.878L339.608 633.855L388.574 517.196L586.487 423.5L475.465 310.902L510.002 230.04Z"
        fill="currentColor"
      />
    </svg>
  </div>
</template>

<style scoped>
.spin {
  animation: spin 0.4s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
