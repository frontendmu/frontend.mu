import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Event from '#models/event'
import EventPolicy from '#policies/event_policy'
import { createEventValidator, updateEventValidator } from '#validators/event_validator'

export default class AdminEventsController {
  /**
   * List all events for admin management
   */
  async index({ inertia, bouncer, response, request }: HttpContext) {
    // Check authorization using policy
    if (await bouncer.with(EventPolicy).denies('viewAny')) {
      return response.forbidden('You are not authorized to view events.')
    }

    // Get filter from query string
    const statusFilter = request.input('status', 'all')

    // Build query
    let query = Event.query().orderBy('eventDate', 'desc')

    // Apply status filter
    if (statusFilter !== 'all') {
      query = query.where('status', statusFilter)
    }

    const events = await query

    return inertia.render('admin/events/index', {
      events,
      statusFilter,
    })
  }

  /**
   * Show the create form for a new event
   */
  async create({ inertia, bouncer, response }: HttpContext) {
    // Check authorization using policy
    if (await bouncer.with(EventPolicy).denies('create')) {
      return response.forbidden('You are not authorized to create events.')
    }

    return inertia.render('admin/events/create')
  }

  /**
   * Store a new event
   */
  async store({ request, bouncer, response, session }: HttpContext) {
    // Check authorization using policy
    if (await bouncer.with(EventPolicy).denies('create')) {
      return response.forbidden('You are not authorized to create events.')
    }

    // Validate the request
    const data = await request.validateUsing(createEventValidator)

    // Create the event
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
      rsvpClosingDate: data.rsvpClosingDate,
      parkingLocation: data.parkingLocation,
      mapUrl: data.mapUrl,
      status: data.status ?? 'draft',
      attendeeCount: 0,
    })

    session.flash('success', 'Event created successfully!')

    return response.redirect().toRoute('admin.events.edit', { id: event.id })
  }

  /**
   * Show the edit form for an event
   */
  async edit({ inertia, params, bouncer, response }: HttpContext) {
    const event = await Event.findOrFail(params.id)

    // Check authorization using policy
    if (await bouncer.with(EventPolicy).denies('edit', event)) {
      return response.forbidden('You are not authorized to edit this event.')
    }

    // Load sessions with speakers for the edit page
    await event.load('sessions', (query) => {
      query.preload('speakers').orderBy('order', 'asc')
    })

    return inertia.render('admin/events/edit', {
      event,
    })
  }

  /**
   * Update an event
   */
  async update({ params, request, bouncer, response, session }: HttpContext) {
    const event = await Event.findOrFail(params.id)

    // Check authorization using policy
    if (await bouncer.with(EventPolicy).denies('update', event)) {
      return response.forbidden('You are not authorized to update this event.')
    }

    // Validate the request
    const data = await request.validateUsing(updateEventValidator)

    // Update the event
    event.merge({
      title: data.title,
      description: data.description,
      location: data.location,
      venue: data.venue,
      startTime: data.startTime,
      endTime: data.endTime,
      seatsAvailable: data.seatsAvailable,
      acceptingRsvp: data.acceptingRsvp,
      rsvpClosingDate: data.rsvpClosingDate,
      parkingLocation: data.parkingLocation,
      mapUrl: data.mapUrl,
      status: data.status,
    })

    await event.save()

    session.flash('success', 'Event updated successfully!')

    return response.redirect(`/meetup/${event.id}`)
  }

  /**
   * Delete an event
   */
  async destroy({ params, bouncer, response, session }: HttpContext) {
    const event = await Event.findOrFail(params.id)

    // Check authorization using policy (only superadmins can delete)
    if (await bouncer.with(EventPolicy).denies('delete', event)) {
      return response.forbidden('You are not authorized to delete this event.')
    }

    await event.delete()

    session.flash('success', 'Event deleted successfully!')

    return response.redirect().toRoute('admin.events.index')
  }
}
