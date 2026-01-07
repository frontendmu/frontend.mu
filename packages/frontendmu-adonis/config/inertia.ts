import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'

const inertiaConfig = defineConfig({
  rootView: 'inertia_layout',

  sharedData: {
    errors: (ctx) => ctx.session!.flashMessages.get('errors'),
    auth: async (ctx) => {
      await ctx.auth.check()
      return {
        isAuthenticated: ctx.auth.isAuthenticated,
        user: ctx.auth.user || null,
        csrfToken: ctx.request.csrfToken,
      }
    },
  },

  ssr: {
    enabled: false,
    entrypoint: 'inertia/app/ssr.ts',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
