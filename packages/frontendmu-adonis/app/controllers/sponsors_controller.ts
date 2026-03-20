import type { HttpContext } from '@adonisjs/core/http'
import Sponsor from '#models/sponsor'
import EventTransformer from '#transformers/event_transformer'
import SponsorTransformer from '#transformers/sponsor_transformer'

export default class SponsorsController {
  async index({ inertia }: HttpContext) {
    const dbSponsors = await Sponsor.query().where('status', 'active').orderBy('name', 'asc')

    const sponsors = SponsorTransformer.transform(dbSponsors)

    return inertia.render('sponsors', {
      sponsors,
    })
  }

  async show({ params, inertia }: HttpContext) {
    const dbSponsor = await Sponsor.findOrFail(params.id)

    const sponsor = SponsorTransformer.transform(dbSponsor)

    const events = await dbSponsor.related('events').query().orderBy('event_date', 'desc')

    const meetups = EventTransformer.transform(events)

    return inertia.render('sponsor', {
      sponsor,
      meetups,
    })
  }
}
