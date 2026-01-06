import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'

const inertiaConfig = defineConfig({
  rootView: 'inertia_layout',

  sharedData: {
    errors: (ctx) => ctx.session!.flashMessages.get('errors'),
    auth: (ctx) => {
      if (!ctx.auth || !ctx.auth.isAuthenticated) {
        return {
          isAuthenticated: false,
          user: null,
        }
      }
      return {
        isAuthenticated: true,
        user: ctx.auth.user,
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

declare module '@adonisjs/core/http' {
  interface HttpContext {
    auth: {
      isAuthenticated: boolean
      user?: unknown
    }
  }
}
