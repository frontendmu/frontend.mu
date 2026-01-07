import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import Rsvp from '#models/rsvp'
import User from '#models/user'
import { rsvpToEvent, cancelRsvp } from '#abilities/main'

export default class RsvpsController {
  /**
   * Create a new RSVP for the authenticated user
   */
  async store({ auth, bouncer, params, response }: HttpContext) {
    const user = auth.user as User
    const event = await Event.findOrFail(params.eventId)

    // Check if user is authorized to RSVP to this event
    if (await bouncer.denies(rsvpToEvent, event)) {
      return response.forbidden({
        message: 'This event is not accepting RSVPs at this time.',
      })
    }

    // Check if user already has an RSVP for this event
    const existingRsvp = await Rsvp.query()
      .where('userId', user.id)
      .where('eventId', event.id)
      .first()

    if (existingRsvp) {
      // If cancelled, reactivate it
      if (existingRsvp.status === 'cancelled') {
        existingRsvp.status = 'confirmed'
        await existingRsvp.save()
        return response.ok({
          message: 'Your RSVP has been reactivated.',
          rsvp: existingRsvp,
        })
      }

      return response.conflict({
        message: 'You have already RSVPd to this event.',
        rsvp: existingRsvp,
      })
    }

    // Check if event has seat limit
    let status: 'confirmed' | 'waitlist' = 'confirmed'
    if (event.seatsAvailable) {
      const confirmedCount = await Rsvp.query()
        .where('eventId', event.id)
        .where('status', 'confirmed')
        .count('* as total')
        .first()

      const totalConfirmed = Number(confirmedCount?.$extras.total || 0)
      if (totalConfirmed >= event.seatsAvailable) {
        status = 'waitlist'
      }
    }

    // Create the RSVP
    const rsvp = await Rsvp.create({
      userId: user.id,
      eventId: event.id,
      status,
    })

    const message =
      status === 'confirmed'
        ? 'You have successfully RSVPd to this event!'
        : 'The event is full. You have been added to the waitlist.'

    return response.created({
      message,
      rsvp,
    })
  }

  /**
   * Cancel the authenticated user's RSVP
   */
  async destroy({ auth, bouncer, params, response }: HttpContext) {
    const user = auth.user as User

    const rsvp = await Rsvp.query()
      .where('userId', user.id)
      .where('eventId', params.eventId)
      .first()

    if (!rsvp) {
      return response.notFound({
        message: 'RSVP not found.',
      })
    }

    // Check if user is authorized to cancel this RSVP
    if (await bouncer.denies(cancelRsvp, rsvp)) {
      return response.forbidden({
        message: 'You are not authorized to cancel this RSVP.',
      })
    }

    // Soft cancel by updating status
    rsvp.status = 'cancelled'
    await rsvp.save()

    // Check if there are people on waitlist to promote
    const event = await Event.findOrFail(params.eventId)
    if (event.seatsAvailable) {
      const waitlistRsvp = await Rsvp.query()
        .where('eventId', event.id)
        .where('status', 'waitlist')
        .orderBy('createdAt', 'asc')
        .first()

      if (waitlistRsvp) {
        waitlistRsvp.status = 'confirmed'
        await waitlistRsvp.save()
        // TODO: Send notification to promoted user
      }
    }

    return response.ok({
      message: 'Your RSVP has been cancelled.',
    })
  }

  /**
   * Get RSVP status for the authenticated user for a specific event
   */
  async status({ auth, params, response }: HttpContext) {
    const user = auth.user as User | undefined

    if (!user) {
      return response.ok({
        hasRsvp: false,
        rsvp: null,
      })
    }

    const rsvp = await Rsvp.query()
      .where('userId', user.id)
      .where('eventId', params.eventId)
      .whereNot('status', 'cancelled')
      .first()

    return response.ok({
      hasRsvp: !!rsvp,
      rsvp,
    })
  }
}
