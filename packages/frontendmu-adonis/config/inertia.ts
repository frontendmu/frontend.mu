import { defineConfig } from '@adonisjs/inertia'

const inertiaConfig = defineConfig({
  rootView: 'inertia_layout',
  assetsVersion: '1',

  ssr: {
    enabled: false,
  },
})

export default inertiaConfig
