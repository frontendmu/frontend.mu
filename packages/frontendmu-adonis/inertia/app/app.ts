/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css'
import { createApp, h } from 'vue'
import type { DefineComponent } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import DefaultLayout from '~/layouts/DefaultLayout.vue'

const appName = import.meta.env.VITE_APP_NAME || 'frontend.mu'

createInertiaApp({
  progress: { color: '#3B82F6' },

  title: (title: string) => `${title} - ${appName}`,

  resolve: async (name: string) => {
    const page = await resolvePageComponent(
      `../pages/${name}.vue`,
      import.meta.glob<DefineComponent>('../pages/**/*.vue')
    )
    page.default.layout = page.default.layout || DefaultLayout
    return page
  },

  // @ts-expect-error -- setup params are inferred by createInertiaApp at runtime
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
})
