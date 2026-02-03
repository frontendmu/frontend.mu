import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import Session from '#models/session'
import User from '#models/user'
import SessionPolicy from '#policies/session_policy'
import { createSessionValidator, updateSessionValidator } from '#validators/session_validator'

export default class AdminSessionsController {
  /**
   * List all sessions for an event (returns JSON for API use)
   */
  async index({ params, bouncer, response }: HttpContext) {
    const event = await Event.findOrFail(params.eventId)

    // Check authorization - use session policy create as a proxy for viewing event sessions
    if (await bouncer.with(SessionPolicy).denies('create')) {
      return response.forbidden('You are not authorized to manage sessions.')
    }

    await event.load('sessions', (query) => {
      query.preload('speakers').orderBy('order', 'asc')
    })

    return response.json({
      sessions: event.sessions,
    })
  }

  /**
   * Store a new session for an event
   */
  async store({ params, request, bouncer, response }: HttpContext) {
    const event = await Event.findOrFail(params.eventId)

    // Check authorization using policy
    if (await bouncer.with(SessionPolicy).denies('create')) {
      return response.forbidden('You are not authorized to create sessions.')
    }

    // Validate the request
    const data = await request.validateUsing(createSessionValidator)

    // Create the session
    const session = await Session.create({
      eventId: event.id,
      title: data.title,
      description: data.description,
      order: data.order,
    })

    // Attach speakers if provided
    if (data.speakerIds && data.speakerIds.length > 0) {
      await session.related('speakers').attach(data.speakerIds)
    }

    // Load speakers for response
    await session.load('speakers')

    return response.status(201).json({
      message: 'Session created successfully',
      session,
    })
  }

  /**
   * Get a single session
   */
  async show({ params, bouncer, response }: HttpContext) {
    const session = await Session.findOrFail(params.id)

    // Check authorization using policy
    if (await bouncer.with(SessionPolicy).denies('edit', session)) {
      return response.forbidden('You are not authorized to view this session.')
    }

    await session.load('speakers')
    await session.load('event')

    return response.json({
      session,
    })
  }

  /**
   * Update a session
   */
  async update({ params, request, bouncer, response }: HttpContext) {
    const session = await Session.findOrFail(params.id)

    // Check authorization using policy
    if (await bouncer.with(SessionPolicy).denies('update', session)) {
      return response.forbidden('You are not authorized to update this session.')
    }

    // Validate the request
    const data = await request.validateUsing(updateSessionValidator)

    // Update the session
    session.merge({
      title: data.title,
      description: data.description,
      order: data.order,
    })

    await session.save()

    // Sync speakers if provided
    if (data.speakerIds !== undefined) {
      await session.related('speakers').sync(data.speakerIds)
    }

    // Load speakers for response
    await session.load('speakers')

    return response.json({
      message: 'Session updated successfully',
      session,
    })
  }

  /**
   * Delete a session
   */
  async destroy({ params, bouncer, response }: HttpContext) {
    const session = await Session.findOrFail(params.id)

    // Check authorization using policy
    if (await bouncer.with(SessionPolicy).denies('delete', session)) {
      return response.forbidden('You are not authorized to delete this session.')
    }

    await session.delete()

    return response.json({
      message: 'Session deleted successfully',
    })
  }

  /**
   * Add a speaker to a session
   */
  async addSpeaker({ params, bouncer, response }: HttpContext) {
    const session = await Session.findOrFail(params.id)

    // Check authorization using policy
    if (await bouncer.with(SessionPolicy).denies('manage', session)) {
      return response.forbidden('You are not authorized to manage session speakers.')
    }

    // Verify the speaker exists
    const speaker = await User.findOrFail(params.speakerId)

    // Attach the speaker (sync with empty array to avoid duplicates)
    await session.related('speakers').attach([speaker.id])

    // Load speakers for response
    await session.load('speakers')

    return response.json({
      message: 'Speaker added to session successfully',
      session,
    })
  }

  /**
   * Remove a speaker from a session
   */
  async removeSpeaker({ params, bouncer, response }: HttpContext) {
    const session = await Session.findOrFail(params.id)

    // Check authorization using policy
    if (await bouncer.with(SessionPolicy).denies('manage', session)) {
      return response.forbidden('You are not authorized to manage session speakers.')
    }

    // Detach the speaker
    await session.related('speakers').detach([params.speakerId])

    // Load speakers for response
    await session.load('speakers')

    return response.json({
      message: 'Speaker removed from session successfully',
      session,
    })
  }

  /**
   * Get available speakers for assignment
   * Returns all users that can be speakers (excludes viewers by default)
   */
  async availableSpeakers({ bouncer, response }: HttpContext) {
    // Check authorization - must be able to create sessions
    if (await bouncer.with(SessionPolicy).denies('create')) {
      return response.forbidden('You are not authorized to view speakers.')
    }

    // Get all users that can be speakers - anyone who has been a speaker before
    // or members and above
    const speakers = await User.query()
      .where((query) => {
        query
          .whereIn('role', ['member', 'organizer', 'superadmin'])
          .orWhereHas('sessions', (q) => q.whereNotNull('id'))
      })
      .orderBy('name', 'asc')

    return response.json({
      speakers: speakers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        githubUsername: user.githubUsername,
      })),
    })
  }
}
