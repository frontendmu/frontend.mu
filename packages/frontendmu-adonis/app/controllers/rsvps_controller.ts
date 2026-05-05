import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import Rsvp from '#models/rsvp'
import { rsvpToEvent, cancelRsvp } from '#abilities/main'
import RsvpTransformer from '#transformers/rsvp_transformer'
import { createRsvpValidator } from '#validators/rsvp_validator'
import db from '@adonisjs/lucid/services/db'

export default class RsvpsController {
  /**
   * Create a new RSVP for the authenticated user
   */
  async store(ctx: HttpContext) {
    const { auth, bouncer, params, request, response, serializeWithoutWrapping: serialize } = ctx
    const user = auth.getUserOrFail()
    const event = await Event.findOrFail(params.eventId)

    // Check if user is authorized to RSVP to this event
    if (await bouncer.denies(rsvpToEvent, event)) {
      return response.forbidden({
        message: 'This event is not accepting RSVPs at this time.',
      })
    }

    const data = await request.validateUsing(createRsvpValidator)
    const userHasPhone = Boolean(user.phone && user.phone.trim().length > 0)

    if (!userHasPhone && !data.phone) {
      return response.unprocessableEntity({
        code: 'PHONE_REQUIRED',
        message: 'Please add a phone number before RSVPing so we know you’re a real human.',
        errors: { phone: 'A phone number is required to RSVP.' },
      })
    }

    if (data.phone && !userHasPhone) {
      user.phone = data.phone
      await user.save()
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
          rsvp: await serialize(RsvpTransformer.transform(existingRsvp)),
        })
      }

      return response.conflict({
        message: 'You have already RSVPd to this event.',
        rsvp: await serialize(RsvpTransformer.transform(existingRsvp)),
      })
    }

    // Wrap seat check + RSVP creation in a transaction with FOR UPDATE lock
    const result = await db.transaction(async (trx) => {
      const lockedEvent = await Event.query({ client: trx })
        .where('id', params.eventId)
        .forUpdate()
        .firstOrFail()

      let status: 'confirmed' | 'waitlist' = 'confirmed'
      if (lockedEvent.seatsAvailable) {
        const confirmedCount = await Rsvp.query({ client: trx })
          .where('eventId', lockedEvent.id)
          .where('status', 'confirmed')
          .count('* as total')
          .first()

        const totalConfirmed = Number(confirmedCount?.$extras.total || 0)
        if (totalConfirmed >= lockedEvent.seatsAvailable) {
          status = 'waitlist'
        }
      }

      const rsvp = await Rsvp.create(
        {
          userId: user.id,
          eventId: lockedEvent.id,
          status,
        },
        { client: trx }
      )

      return { rsvp, status }
    })

    const message =
      result.status === 'confirmed'
        ? 'You have successfully RSVPd to this event!'
        : 'The event is full. You have been added to the waitlist.'

    return response.created({
      message,
      rsvp: await serialize(RsvpTransformer.transform(result.rsvp)),
    })
  }

  /**
   * Cancel the authenticated user's RSVP
   */
  async destroy({ auth, bouncer, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

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
      }
    }

    return response.ok({
      message: 'Your RSVP has been cancelled.',
    })
  }

  /**
   * Get RSVP status for the authenticated user for a specific event
   */
  async status(ctx: HttpContext) {
    const { auth, params, response, serializeWithoutWrapping: serialize } = ctx
    await auth.check()
    const user = auth.user

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
      rsvp: rsvp ? await serialize(RsvpTransformer.transform(rsvp)) : null,
    })
  }
}
