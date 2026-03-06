import type { HttpContext } from '@adonisjs/core/http'
import Sponsor from '#models/sponsor'
import { toSponsor } from '#dtos/factories'

export default class SponsorsController {
  async index({ inertia }: HttpContext) {
    const dbSponsors = await Sponsor.query()
      .where('status', 'active')
      .orderBy('name', 'asc')

    const sponsors = dbSponsors.map(toSponsor)

    return inertia.render('sponsors', {
      sponsors,
    })
  }

  async show({ params, inertia }: HttpContext) {
    const dbSponsor = await Sponsor.findOrFail(params.id)

    const sponsor = toSponsor(dbSponsor)

    const events = await dbSponsor.related('events').query().orderBy('event_date', 'desc')

    const meetups = events.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.eventDate?.toISODate() || null,
      location: event.location,
      venue: event.venue,
      description: event.description,
    }))

    return inertia.render('sponsor', {
      sponsor,
      meetups,
    })
  }
}
