import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import featureFlags from './feature_flags.js'

const inertiaConfig = defineConfig({
  rootView: 'inertia_layout',

  sharedData: {
    errors: (ctx) => ctx.session!.flashMessages.get('errors'),
    flash: (ctx) => ({
      success: ctx.session?.flashMessages.get('success') as string | undefined,
      error: ctx.session?.flashMessages.get('error') as string | undefined,
    }),
    auth: async (ctx) => {
      await ctx.auth.check()
      const user = ctx.auth.user
      return {
        isAuthenticated: ctx.auth.isAuthenticated,
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              avatarUrl: user.avatarUrl,
              githubUsername: user.githubUsername,
              role: user.role,
            }
          : null,
        csrfToken: ctx.request.csrfToken,
      }
    },
    featureFlags: () => featureFlags,
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
