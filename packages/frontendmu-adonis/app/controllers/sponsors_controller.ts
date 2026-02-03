import type { HttpContext } from '@adonisjs/core/http'
import Sponsor from '#models/sponsor'
import Event from '#models/event'

export default class SponsorsController {
  async index({ inertia }: HttpContext) {
    let sponsors: any[] = []

    try {
      const dbSponsors = await Sponsor.query().where('status', 'active').orderBy('name', 'asc')

      sponsors = dbSponsors.map((sponsor) => ({
        id: sponsor.id,
        name: sponsor.name,
        website: sponsor.website,
        description: sponsor.description,
        sponsorTypes: sponsor.sponsorTypes,
        darkbg: sponsor.darkbg,
      }))
    } catch (error) {
      console.log('Error loading sponsors:', error.message || error)
    }

    return inertia.render('sponsors', {
      sponsors,
    })
  }

  async show({ params, inertia }: HttpContext) {
    let sponsor: any = null
    let meetups: any[] = []

    try {
      const dbSponsor = await Sponsor.find(params.id)

      if (dbSponsor) {
        sponsor = {
          id: dbSponsor.id,
          name: dbSponsor.name,
          website: dbSponsor.website,
          description: dbSponsor.description,
          sponsorTypes: dbSponsor.sponsorTypes,
          darkbg: dbSponsor.darkbg,
        }

        // Load events linked to this sponsor
        const events = await dbSponsor.related('events').query().orderBy('event_date', 'desc')

        meetups = events.map((event) => ({
          id: event.id,
          title: event.title,
          date: event.eventDate?.toISODate() || null,
          location: event.location,
          venue: event.venue,
          description: event.description,
        }))
      }
    } catch (error) {
      console.log('Error loading sponsor:', error.message || error)
    }

    return inertia.render('sponsor', {
      sponsor,
      meetups,
    })
  }
}
