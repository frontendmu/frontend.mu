import type { HttpContext } from '@adonisjs/core/http'
import Sponsor from '#models/sponsor'
import EventTransformer from '#transformers/event_transformer'
import SponsorTransformer from '#transformers/sponsor_transformer'
import { setSeoMeta } from '#utils/seo'

export default class SponsorsController {
  async index(ctx: HttpContext) {
    const { inertia } = ctx
    setSeoMeta(ctx, {
      title: 'Sponsors',
      description:
        'Companies that help keep coders.mu meetups running — sponsoring venues, food, and equipment.',
      canonical: '/sponsors',
    })

    const dbSponsors = await Sponsor.query().where('status', 'active').orderBy('name', 'asc')

    const sponsors = SponsorTransformer.transform(dbSponsors)

    return inertia.render('sponsors', {
      sponsors,
    })
  }

  async show(ctx: HttpContext) {
    const { params, inertia } = ctx
    const dbSponsor = await Sponsor.findOrFail(params.id)

    const sponsor = SponsorTransformer.transform(dbSponsor)

    const events = await dbSponsor.related('events').query().orderBy('event_date', 'desc')

    const meetups = EventTransformer.transform(events)

    setSeoMeta(ctx, {
      title: dbSponsor.name,
      description: `${dbSponsor.name} sponsors coders.mu. View their support history and learn more about them.`,
      canonical: `/sponsor/${dbSponsor.id}`,
      ogType: 'profile',
    })

    return inertia.render('sponsor', {
      sponsor,
      meetups,
    })
  }
}
