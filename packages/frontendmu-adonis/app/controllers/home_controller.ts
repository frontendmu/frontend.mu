import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import User from '#models/user'
import Sponsor from '#models/sponsor'
import Rsvp from '#models/rsvp'
import EventTransformer from '#transformers/event_transformer'
import SpeakerTransformer from '#transformers/speaker_transformer'
import SponsorTransformer from '#transformers/sponsor_transformer'

export default class HomeController {
  async index({ inertia, auth }: HttpContext) {
    const dbEvents = await Event.query()
      .where('status', 'published')
      .orderBy('eventDate', 'desc')
      .preload('sessions', (query) => {
        query.preload('speakers')
      })
      .preload('sponsors')

    const events = EventTransformer.transform(dbEvents)

    let userRsvpEventIds: string[] = []
    if (auth.isAuthenticated && auth.user) {
      const rsvps = await Rsvp.query()
        .where('userId', auth.user.id)
        .whereIn('status', ['confirmed', 'waitlist'])
      userRsvpEventIds = rsvps.map((r) => r.eventId)
    }

    const dbSpeakers = await User.query().where('featured', true).orderBy('name', 'asc').limit(12)

    const featuredSpeakers = SpeakerTransformer.transform(dbSpeakers)

    const dbSponsors = await Sponsor.query().where('status', 'active').orderBy('name', 'asc')

    const sponsors = SponsorTransformer.transform(dbSponsors).useVariant('summary')

    const totalMeetups = await Event.query().where('status', 'published').count('* as total')
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
      userRsvpEventIds,
    })
  }
}
