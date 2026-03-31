import { Logger } from '@adonisjs/core/logger'
import { HttpContext } from '@adonisjs/core/http'
import { BaseSerializer } from '@adonisjs/core/transformers'
import { type NextFn } from '@adonisjs/core/types/http'

class HttpContextSerializer extends BaseSerializer {
  wrap = undefined

  definePaginationMetaData(metaData: unknown) {
    return metaData
  }
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    serialize(data: unknown): Promise<unknown>
    serializeWithoutWrapping(data: unknown): Promise<unknown>
  }
}

/**
 * The container bindings middleware binds classes to their request
 * specific value using the container resolver.
 *
 * - We bind "HttpContext" class to the "ctx" object
 * - And bind "Logger" class to the "ctx.logger" object
 */
export default class ContainerBindingsMiddleware {
  handle(ctx: HttpContext, next: NextFn) {
    ctx.containerResolver.bindValue(HttpContext, ctx)
    ctx.containerResolver.bindValue(Logger, ctx.logger)

    const serializer = new HttpContextSerializer()
    ctx.serialize = (data) => serializer.serialize(data, ctx.containerResolver)
    ctx.serializeWithoutWrapping = (data) =>
      serializer.serializeWithoutWrapping(data, ctx.containerResolver)

    return next()
  }
}
