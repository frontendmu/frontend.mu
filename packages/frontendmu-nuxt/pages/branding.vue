<script setup>
const title = 'Brand Assets'
const description = 'Brand resources for all things frontend.coders.mu'

const assets = ref([
  {
    name: 'Standard Blue with Text',
    description: '',
    filename: 'logo-with-text',
    versions: ['svg', 'png'],
  },
  {
    name: 'Spiral Green with Text',
    description: '',
    filename: 'logo-with-text-green',
    versions: ['svg', 'png'],
  },
  {
    name: 'Spiral Blue',
    description: '',
    filename: 'logo-spiral-blue',
    versions: ['svg', 'png'],
  },
  {
    name: 'Circle',
    description: '',
    filename: 'logo-circle',
    versions: ['svg', 'png'],
  },
  {
    name: 'Discord',
    description: '',
    filename: 'logo-discord',
    versions: ['svg', 'png'],
  },
  {
    name: 'Outside Blue',
    description: '',
    filename: 'logo-outside-blue',
    versions: ['svg', 'png'],
  },
  {
    name: 'Outside Red',
    description: '',
    filename: 'logo-outside-red',
    versions: ['svg', 'png'],
  },
  {
    name: 'Spiral Red',
    description: '',
    filename: 'logo-spiral-red',
    versions: ['svg', 'png'],
  },
])

const LayoutProps = {
  title,
  description,
}
</script>

<template>
  <div class="page-all-meetups py-12">
    <div>
      <div class="past-events-container pb-4 md:pb-16">
        <div class="contain mx-auto">
          <div class="py-4 flex flex-col gap-2">
            <h1
              class="text-4xl font-extrabold tracking-tight text-verse-900 dark:text-verse-200 sm:text-5xl md:text-4xl"
            >
              Brand & Assets
            </h1>
            <p class="text-verse-900 dark:text-verse-200 text-xl max-w-3xl leading-relaxed">
              Are you collaborating with Frontend Coders Mauritius? Grab our
              assets from here to use in marketing material related to our
              community.
            </p>
          </div>
          <div class="flex flex-col gap-16">
            <!-- Loop over assets -->
            <template v-for="asset in assets" :key="asset.filename">
              <CardsBrandingCard :asset="asset" />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media screen and (min-width: 650px) {
  .grid-container {
    --minmax: 500px;
  }
}

@media screen and (max-width: 650px) {
  .grid-container {
    --minmax: 100%;
  }
}

.grid-container {
  display: grid;
  /* grid-template-columns: repeat(auto-fill, minmax(var(--minmax), 1fr)); */
}
</style>
