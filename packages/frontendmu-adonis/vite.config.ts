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

  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
})
