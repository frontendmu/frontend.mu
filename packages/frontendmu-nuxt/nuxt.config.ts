// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  css: [
    '~/styles/global.css',
    '~/styles/tailwind.css',
  ],

  typescript: {
    tsConfig: {
      compilerOptions: {
        baseUrl: '.',
      },
    },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxtjs/seo',
    'shadcn-nuxt',
    '@nuxt/image',
    '@nuxt/content',
    '@pinia/nuxt',
  ],

  eslint: {
    config: {
      standalone: false,
    },
  },

  tailwindcss: {
    configPath: './tailwind.config.js',
  },

  alias: {
    '@/*': './*',
    '#astro': '../frontendmu-astro/src/',
    '#data': '../frontendmu-data/data/',
  },

  vite: {
    server: {
      hmr: {
        clientPort: 3000,
      },
    },
  },

  app: {

    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.png',
        },
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/favicon.svg',
        },
      ],
    },
  },

  site: {
    url: 'https://frontend.mu',
    name: 'Front-End Coders Mauritius',
    description: 'A community around frontend, tech and development in general based in Mauritius. We also organise monthly meetups free for anyone interested to attend.',
    defaultLocale: 'en', // not needed if you have @nuxtjs/i18n installed
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui',
  },

  experimental: {
    viewTransition: true,
  },

  image: {
    quality: 80,
    domains: ['raw.githubusercontent.com', 'avatars.githubusercontent.com'],
  },

  compatibilityDate: '2024-08-02',
})
