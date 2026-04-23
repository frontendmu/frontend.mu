import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

type ErrorWithStatus = {
  message?: string
  status?: number
}

type InertiaRenderer = {
  render: (component: string, props: Record<string, unknown>) => unknown
}

function shouldRenderJson(ctx: HttpContext) {
  const accept = ctx.request.header('accept') || ''

  return (
    ctx.request.method() !== 'GET' ||
    accept.includes('application/json') ||
    ctx.request.header('x-requested-with') === 'XMLHttpRequest'
  )
}

function getErrorStatus(error: unknown, fallback: number) {
  return (error as ErrorWithStatus)?.status || fallback
}

function getErrorMessage(error: unknown, fallback: string) {
  return (error as ErrorWithStatus)?.message || fallback
}

function renderStatusPage(
  component: string,
  fallbackStatus: number,
  fallbackMessage: string
): StatusPageRenderer {
  return (error, ctx) => {
    const status = getErrorStatus(error, fallbackStatus)

    if (shouldRenderJson(ctx)) {
      return ctx.response.status(status).json({
        message: getErrorMessage(error, fallbackMessage),
      })
    }

    const inertia = (ctx as HttpContext & { inertia?: InertiaRenderer }).inertia
    if (inertia) {
      return inertia.render(component, { error })
    }

    return ctx.response.status(status).send(getErrorMessage(error, fallbackMessage))
  }
}

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  protected renderStatusPages = app.inProduction

  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '403': renderStatusPage('errors/forbidden', 403, 'Forbidden'),
    '404': renderStatusPage('errors/not_found', 404, 'Not found'),
    '500..599': renderStatusPage('errors/server_error', 500, 'Internal server error'),
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
