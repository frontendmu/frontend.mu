import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'
import { DateTime } from 'luxon'
import Event from '#models/event'
import Sponsor from '#models/sponsor'
import EventPolicy from '#policies/event_policy'
import { createEventValidator, updateEventValidator } from '#validators/event_validator'
import SponsorTransformer from '#transformers/sponsor_transformer'
import EventTransformer from '#transformers/event_transformer'

export default class AdminEventsController {
  async index({ inertia, bouncer, request }: HttpContext) {
    await bouncer.with(EventPolicy).authorize('viewAny')

    const allowedStatuses = ['all', 'published', 'draft', 'cancelled'] as const
    const rawStatus = request.input('status', 'all')
    const statusFilter = allowedStatuses.includes(rawStatus) ? rawStatus : 'all'

    let query = Event.query().orderBy('eventDate', 'desc')

    if (statusFilter !== 'all') {
      query = query.where('status', statusFilter)
    }

    const events = await query

    return inertia.render('admin/events/index', {
      events: EventTransformer.transform(events).useVariant('forAdminIndex'),
      statusFilter,
    })
  }

  async create({ inertia, bouncer }: HttpContext) {
    await bouncer.with(EventPolicy).authorize('create')

    return inertia.render('admin/events/create', {})
  }

  async store({ request, bouncer, response, session }: HttpContext) {
    await bouncer.with(EventPolicy).authorize('create')

    const data = await request.validateUsing(createEventValidator)

    const event = await Event.create({
      title: data.title,
      eventDate: DateTime.fromISO(data.eventDate),
      description: data.description,
      location: data.location,
      venue: data.venue,
      startTime: data.startTime,
      endTime: data.endTime,
      seatsAvailable: data.seatsAvailable,
      acceptingRsvp: data.acceptingRsvp ?? false,
      rsvpClosingDate: data.rsvpClosingDate ? DateTime.fromISO(data.rsvpClosingDate) : null,
      parkingLocation: data.parkingLocation,
      mapUrl: data.mapUrl,
      status: data.status ?? 'draft',
      attendeeCount: 0,
    })

    session.flash('success', 'Event created successfully!')

    return response.redirect().toPath(urlFor('admin.events.edit', { id: event.id }))
  }

  async edit({ inertia, params, bouncer }: HttpContext) {
    const event = await Event.findOrFail(params.id)

    await bouncer.with(EventPolicy).authorize('edit', event)

    await event.load('sessions', (query) => {
      query.preload('speakers').orderBy('order', 'asc')
    })
    await event.load('sponsors')

    return inertia.render('admin/events/edit', {
      event: EventTransformer.transform(event).useVariant('detail'),
    })
  }

  async update({ params, request, bouncer, response, session }: HttpContext) {
    const event = await Event.findOrFail(params.id)

    await bouncer.with(EventPolicy).authorize('update', event)

    const data = await request.validateUsing(updateEventValidator)

    event.merge({
      title: data.title,
      ...(data.eventDate ? { eventDate: DateTime.fromISO(data.eventDate) } : {}),
      description: data.description,
      location: data.location,
      venue: data.venue,
      startTime: data.startTime,
      endTime: data.endTime,
      seatsAvailable: data.seatsAvailable,
      acceptingRsvp: data.acceptingRsvp,
      rsvpClosingDate: data.rsvpClosingDate ? DateTime.fromISO(data.rsvpClosingDate) : null,
      parkingLocation: data.parkingLocation,
      mapUrl: data.mapUrl,
      status: data.status,
    })

    await event.save()

    session.flash('success', 'Event updated successfully!')

    return response.redirect().toPath(urlFor('meetups.show', { idOrSlug: event.slug || event.id }))
  }

  async destroy({ params, bouncer, response, session }: HttpContext) {
    const event = await Event.findOrFail(params.id)

    await bouncer.with(EventPolicy).authorize('delete', event)

    await event.delete()

    session.flash('success', 'Event deleted successfully!')

    return response.redirect().toPath(urlFor('admin.events.index'))
  }

  async availableSponsors(ctx: HttpContext) {
    const { bouncer, response, serializeWithoutWrapping: serialize } = ctx
    await bouncer.with(EventPolicy).authorize('create')

    const sponsors = await Sponsor.query().orderBy('name', 'asc')

    return response.json({
      sponsors: await serialize(SponsorTransformer.transform(sponsors).useVariant('summary')),
    })
  }

  async addSponsor(ctx: HttpContext) {
    const { params, bouncer, response, serializeWithoutWrapping: serialize } = ctx
    const event = await Event.findOrFail(params.id)

    await bouncer.with(EventPolicy).authorize('manage', event)

    await Sponsor.findOrFail(params.sponsorId)
    await event.related('sponsors').attach([params.sponsorId])
    await event.load('sponsors')

    return response.json({
      message: 'Sponsor added to event successfully',
      sponsors: await serialize(SponsorTransformer.transform(event.sponsors).useVariant('summary')),
    })
  }

  async removeSponsor(ctx: HttpContext) {
    const { params, bouncer, response, serializeWithoutWrapping: serialize } = ctx
    const event = await Event.findOrFail(params.id)

    await bouncer.with(EventPolicy).authorize('manage', event)

    await event.related('sponsors').detach([params.sponsorId])
    await event.load('sponsors')

    return response.json({
      message: 'Sponsor removed from event successfully',
      sponsors: await serialize(SponsorTransformer.transform(event.sponsors).useVariant('summary')),
    })
  }
}
