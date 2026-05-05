import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import { googleOauthEnabled } from '#config/ally'
import featureFlags from '#config/feature_flags'

async function getSharedAuthUser(ctx: HttpContext) {
  const user = ctx.auth.user

  if (!user) {
    return null
  }

  const roles = await user
    .related('roles')
    .query()
    .select('roles.id', 'roles.name')
    .orderBy('roles.name')

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    githubUsername: user.githubUsername,
    roles: roles.map((role) => ({ id: role.id, name: role.name })),
    role: user.role,
  }
}

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  async share(ctx: HttpContext) {
    await ctx.auth.check()

    return {
      errors: ctx.inertia.always(this.getValidationErrors(ctx)),
      flash: ctx.inertia.always({
        error: ctx.session.flashMessages.get('error') as string | undefined,
        success: ctx.session.flashMessages.get('success') as string | undefined,
      }),
      auth: ctx.inertia.always({
        isAuthenticated: ctx.auth.isAuthenticated,
        user: await getSharedAuthUser(ctx),
        providers: {
          google: googleOauthEnabled,
        },
        registrationEnabled: featureFlags.registrationEnabled,
        csrfToken: ctx.request.csrfToken ?? '',
      }),
      featureFlags,
    }
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.init(ctx)

    const output = await next()

    this.dispose(ctx)

    return output
  }
}

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<InertiaMiddleware> {}
}
