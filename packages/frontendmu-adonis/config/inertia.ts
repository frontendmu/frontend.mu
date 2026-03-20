import { defineConfig } from '@adonisjs/inertia'

const inertiaConfig = defineConfig({
  rootView: 'inertia_layout',

  ssr: {
    enabled: false,
  },
})

export default inertiaConfig
