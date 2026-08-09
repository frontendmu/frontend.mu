import type { HttpContext } from '@adonisjs/core/http'
import CalendarFeedService from '#services/calendar_feed_service'

export default class CalendarController {
  async feed({ response }: HttpContext) {
    const ics = await CalendarFeedService.build()

    response.header('Content-Type', 'text/calendar; charset=utf-8')
    response.header('Content-Disposition', 'inline; filename="frontendmu-events.ics"')
    response.header('Cache-Control', 'public, max-age=900')
    return response.send(ics)
  }
}
