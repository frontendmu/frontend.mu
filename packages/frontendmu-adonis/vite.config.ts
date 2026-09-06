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

  ssr: {
    external: ['@libsql/sqlite3', 'oracledb'],
  },
})
