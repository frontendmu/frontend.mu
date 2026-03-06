import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import User from '#models/user'
import Sponsor from '#models/sponsor'
import { toEventSummary, toSpeaker, toSponsorSummary } from '#dtos/factories'

export default class HomeController {
  async index({ inertia }: HttpContext) {
    const dbEvents = await Event.query()
      .where('status', 'published')
      .orderBy('eventDate', 'desc')
      .preload('sessions', (query) => {
        query.preload('speakers')
      })
      .preload('sponsors')

    const events = dbEvents.map(toEventSummary)

    const dbSpeakers = await User.query()
      .where('featured', true)
      .orderBy('name', 'asc')
      .limit(12)

    const featuredSpeakers = dbSpeakers.map(toSpeaker)

    const dbSponsors = await Sponsor.query()
      .where('status', 'active')
      .orderBy('name', 'asc')

    const sponsors = dbSponsors.map(toSponsorSummary)

    const totalMeetups = await Event.query()
      .where('status', 'published')
      .count('* as total')
    const totalSpeakers = await User.query()
      .whereHas('sessions', (query) => {
        query.whereNotNull('id')
      })
      .count('* as total')

    const stats = {
      meetups: Number(totalMeetups[0].$extras.total) || 0,
      speakers: Number(totalSpeakers[0].$extras.total) || 0,
      contributors: 30,
    }

    return inertia.render('home', {
      events,
      featuredSpeakers,
      sponsors,
      stats,
    })
  }
}
