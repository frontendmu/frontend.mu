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

    await bouncer.with(SessionPolicy).authorize('create')

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

    await bouncer.with(SessionPolicy).authorize('create')

    const data = await request.validateUsing(createSessionValidator)

    const session = await Session.create({
      eventId: event.id,
      title: data.title,
      description: data.description,
      order: data.order,
    })

    if (data.speakerIds && data.speakerIds.length > 0) {
      await session.related('speakers').attach(data.speakerIds)
    }

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

    await bouncer.with(SessionPolicy).authorize('edit', session)

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

    await bouncer.with(SessionPolicy).authorize('update', session)

    const data = await request.validateUsing(updateSessionValidator)

    session.merge({
      title: data.title,
      description: data.description,
      order: data.order,
    })

    await session.save()

    if (data.speakerIds !== undefined) {
      await session.related('speakers').sync(data.speakerIds)
    }

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

    await bouncer.with(SessionPolicy).authorize('delete', session)

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

    await bouncer.with(SessionPolicy).authorize('manage', session)

    const speaker = await User.findOrFail(params.speakerId)

    await session.related('speakers').attach([speaker.id])

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

    await bouncer.with(SessionPolicy).authorize('manage', session)

    await session.related('speakers').detach([params.speakerId])

    await session.load('speakers')

    return response.json({
      message: 'Speaker removed from session successfully',
      session,
    })
  }

  /**
   * Get available speakers for assignment
   */
  async availableSpeakers({ bouncer, response }: HttpContext) {
    await bouncer.with(SessionPolicy).authorize('create')

    const speakers = await User.query().orderBy('name', 'asc')

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
