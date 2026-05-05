<script setup lang="ts">
import AdminNav from './AdminNav.vue'
import AdminBreadcrumb from './AdminBreadcrumb.vue'
import AdminPageHeader from './AdminPageHeader.vue'

interface Crumb {
  label: string
  href?: string
}

withDefaults(
  defineProps<{
    title?: string
    description?: string
    breadcrumbs?: Crumb[]
    /** When true, the page header is omitted (page renders its own custom header inside the body). */
    bareHeader?: boolean
  }>(),
  {
    title: undefined,
    description: undefined,
    breadcrumbs: () => [],
    bareHeader: false,
  }
)
</script>

<template>
  <main class="relative min-h-screen pt-32 pb-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row lg:gap-10">
        <aside class="lg:w-56 lg:shrink-0">
          <div class="lg:sticky lg:top-32">
            <AdminNav />
          </div>
        </aside>

        <div class="flex-1 min-w-0 mt-6 lg:mt-0">
          <AdminBreadcrumb v-if="breadcrumbs.length" :trail="breadcrumbs" class="mb-5" />

          <AdminPageHeader v-if="!bareHeader && title" :title="title" :description="description">
            <template v-if="$slots.media" #media><slot name="media" /></template>
            <template v-if="$slots.meta" #meta><slot name="meta" /></template>
            <template v-if="$slots.actions" #actions><slot name="actions" /></template>
          </AdminPageHeader>

          <slot />
        </div>
      </div>
    </div>
  </main>
</template>
