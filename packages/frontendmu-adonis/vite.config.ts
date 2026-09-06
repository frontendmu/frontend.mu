import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    adonisjs({ entryPoints: ['inertia/app.ts'], reload: ['resources/views/**/*.edge'] }),
  ],

  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./inertia', import.meta.url)),
    },
  },

  build: {
    target: 'esnext',
  },

  server: {
    allowedHosts: ['chotadon.tail1d66.ts.net'],
  },

  optimizeDeps: {
    exclude: ['@libsql/sqlite3', 'oracledb', 'knex-dynamic-connection'],
  },

  // Vite 8 builds every defined environment by default, and both write to
  // public/assets, so the ssr pass overwrites the browser bundle and its
  // manifest with externalised, bare-specifier output. Inertia SSR is off
  // (config/inertia.ts) and no serverEntryPoints are configured, so build
  // the client environment only.
  builder: {
    async buildApp(builder) {
      await builder.build(builder.environments.client)
    },
  },
})
