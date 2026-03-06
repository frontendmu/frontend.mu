import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import inertia from '@adonisjs/inertia/client'
import vue from '@vitejs/plugin-vue'
import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    inertia({ ssr: { enabled: false } }),
    vue(),
    tailwindcss(),
    adonisjs({ entrypoints: ['inertia/app/app.ts'], reload: ['resources/views/**/*.edge'] }),
  ],

  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./inertia', import.meta.url)),
    },
  },

  esbuild: {
    target: 'esnext',
  },

  build: {
    target: 'esnext',
  },

  server: {
    allowedHosts: ['chotadon.tail1d66.ts.net']
  },

  optimizeDeps: {
    exclude: ['@libsql/sqlite3', 'oracledb', 'knex-dynamic-connection'],
    esbuildOptions: {
      target: 'esnext',
    },
  },

  ssr: {
    external: ['@libsql/sqlite3', 'oracledb'],
  },
})
