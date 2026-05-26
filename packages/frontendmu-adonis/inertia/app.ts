/// <reference path="../adonisrc.ts" />
/// <reference path="../app/middleware/inertia_middleware.ts" />

import './css/app.css'
import { createApp, h } from 'vue'
import type { DefineComponent } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import DefaultLayout from '~/layouts/DefaultLayout.vue'

createInertiaApp({
  progress: { color: '#3B82F6' },

  // Match the server-side TITLE_SUFFIX in app/utils/seo.ts so the title
  // stays consistent across the SSR HTML → hydration handoff. Pages that
  // already include the brand in their own <Head title=…> are checked
  // here to avoid double-suffixing.
  title: (title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return 'coders.mu'
    if (/coders\.mu|frontend\.mu/i.test(trimmed)) return trimmed
    return `${trimmed} · coders.mu`
  },

  resolve: async (name: string) => {
    const page = await resolvePageComponent(
      `./pages/${name}.vue`,
      import.meta.glob<DefineComponent>('./pages/**/*.vue')
    )
    page.default.layout = page.default.layout || DefaultLayout
    return page
  },

  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
})
