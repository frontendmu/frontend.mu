import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Event from '#models/event'
import EventTransformer from '#transformers/event_transformer'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const CACHE_CONTROL = 'public, max-age=60, stale-while-revalidate=300'

export default class PublicMeetupsController {
  async index(ctx: HttpContext) {
    const { response, serializeWithoutWrapping: serialize } = ctx

    const events = await Event.query()
      .where('status', 'published')
      .orderBy('eventDate', 'desc')
      .preload('sessions', (query) => query.preload('speakers'))
      .preload('sponsors')

    response.header('Cache-Control', CACHE_CONTROL)
    return response.json(await serialize(EventTransformer.transform(events)))
  }

  async show(ctx: HttpContext) {
    const { params, response, serializeWithoutWrapping: serialize } = ctx
    const column = UUID_REGEX.test(params.idOrSlug) ? 'id' : 'slug'

    const event = await Event.query()
      .where(column, params.idOrSlug)
      .where('status', 'published')
      .preload('sessions', (query) => query.preload('speakers'))
      .preload('sponsors')
      .preload('photos')
      .firstOrFail()

    response.header('Cache-Control', CACHE_CONTROL)
    return response.json(await serialize(EventTransformer.transform(event).useVariant('detail')))
  }

  async next(ctx: HttpContext) {
    const { response, serializeWithoutWrapping: serialize } = ctx

    const event = await Event.query()
      .where('status', 'published')
      .where('eventDate', '>=', DateTime.now().toSQLDate()!)
      .orderBy('eventDate', 'asc')
      .preload('sessions', (query) => query.preload('speakers'))
      .preload('sponsors')
      .preload('photos')
      .first()

    if (!event) {
      return response.notFound({ error: 'No upcoming meetup' })
    }

    response.header('Cache-Control', CACHE_CONTROL)
    return response.json(await serialize(EventTransformer.transform(event).useVariant('detail')))
  }
}
