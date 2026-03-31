import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  protected renderStatusPages = app.inProduction

  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '403': (error, { inertia }) => inertia.render('errors/forbidden', { error }),
    '404': (error, { inertia }) => inertia.render('errors/not_found', { error }),
    '500..599': (error, { inertia }) => inertia.render('errors/server_error', { error }),
  }

  async handle(error: unknown, ctx: HttpContext) {
    const err = error as any

    if (err?.code === 'E_AUTHORIZATION_FAILURE' && ctx.request.header('x-inertia')) {
      ctx.session?.flash('error', 'You are not authorized to perform this action.')
      return ctx.response.redirect().back()
    }

    return super.handle(error, ctx)
  }

  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
