import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'

export default class EventsController {
  /**
   * Display a list of all events grouped by year
   */
  async index({ inertia }: HttpContext) {
    let meetups: Event[] = []

    try {
      const events = await Event.query()
        .where('status', 'published')
        .orderBy('eventDate', 'desc')
        .preload('sessions', (query) => {
          query.preload('speakers')
        })

      meetups = events
    } catch (error) {
      console.log('Database not available, using empty data')
    }

    return inertia.render('meetups/index', {
      meetups,
    })
  }

  /**
   * Display a single event
   */
  async show({ inertia, params }: HttpContext) {
    let meetup: Event | null = null

    try {
      const event = await Event.query()
        .where('id', params.id)
        .where('status', 'published')
        .preload('sessions', (query) => {
          query.preload('speakers')
        })
        .preload('photos')
        .first()

      if (event) {
        meetup = event
      }
    } catch (error) {
      console.log('Database not available, using empty data')
    }

    return inertia.render('meetups/show', {
      meetup,
    })
  }
}
