import type { HttpContext } from '@adonisjs/core/http'
import Sponsor from '#models/sponsor'

export default class SponsorsController {
  /**
   * Display all sponsors
   */
  async index({ inertia }: HttpContext) {
    let sponsors: any[] = []

    try {
      const dbSponsors = await Sponsor.query()
        .where('status', 'active')
        .orderBy('name', 'asc')

      sponsors = dbSponsors.map((sponsor) => this.serializeSponsor(sponsor))
    } catch (error) {
      console.log('Database not available, using empty data')
    }

    return inertia.render('sponsors', {
      sponsors,
    })
  }

  /**
   * Serialize sponsor for frontend
   */
  private serializeSponsor(sponsor: Sponsor) {
    return {
      id: sponsor.id,
      name: sponsor.name,
      website: sponsor.website,
      logoUrl: sponsor.logoUrl,
      description: sponsor.description,
      sponsorTypes: sponsor.sponsorTypes,
      darkbg: sponsor.darkbg,
    }
  }
}
