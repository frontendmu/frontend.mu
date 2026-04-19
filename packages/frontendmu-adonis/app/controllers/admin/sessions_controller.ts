import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import Session from '#models/session'
import User from '#models/user'
import SessionPolicy from '#policies/session_policy'
import SessionTransformer from '#transformers/session_transformer'
import SpeakerTransformer from '#transformers/speaker_transformer'
import { createSessionValidator, updateSessionValidator } from '#validators/session_validator'

export default class AdminSessionsController {
  /**
   * List all sessions for an event (returns JSON for API use)
   */
  async index(ctx: HttpContext) {
    const { params, bouncer, response, serializeWithoutWrapping: serialize } = ctx
    const event = await Event.findOrFail(params.eventId)

    await bouncer.with(SessionPolicy).authorize('create')

    await event.load('sessions', (query) => {
      query.preload('speakers').preload('sponsor').orderBy('order', 'asc')
    })

    return response.json({
      sessions: await serialize(SessionTransformer.transform(event.sessions)),
    })
  }

  /**
   * Store a new session for an event
   */
  async store(ctx: HttpContext) {
    const { params, request, bouncer, response, serializeWithoutWrapping: serialize } = ctx
    const event = await Event.findOrFail(params.eventId)

    await bouncer.with(SessionPolicy).authorize('create')

    const data = await request.validateUsing(createSessionValidator)

    const kind = data.kind ?? 'talk'
    const session = await Session.create({
      eventId: event.id,
      title: data.title,
      description: data.description,
      order: data.order,
      kind,
      sponsorId: kind === 'sponsored' ? (data.sponsorId ?? null) : null,
      durationMinutes: data.durationMinutes ?? null,
    })

    if (data.speakerIds && data.speakerIds.length > 0) {
      await session.related('speakers').attach(data.speakerIds)
    }

    await session.load('speakers')

    return response.status(201).json({
      message: 'Session created successfully',
      session: await serialize(SessionTransformer.transform(session)),
    })
  }

  /**
   * Get a single session
   */
  async show(ctx: HttpContext) {
    const { params, bouncer, response, serializeWithoutWrapping: serialize } = ctx
    const session = await Session.findOrFail(params.id)

    await bouncer.with(SessionPolicy).authorize('edit', session)

    await session.load('speakers')
    await session.load('event')

    return response.json({
      session: await serialize(SessionTransformer.transform(session).useVariant('forAdminDetail')),
    })
  }

  /**
   * Update a session
   */
  async update(ctx: HttpContext) {
    const { params, request, bouncer, response, serializeWithoutWrapping: serialize } = ctx
    const session = await Session.findOrFail(params.id)

    await bouncer.with(SessionPolicy).authorize('update', session)

    const data = await request.validateUsing(updateSessionValidator)

    // If the kind changes away from 'sponsored', proactively clear the stale
    // sponsor link so it can't surface again if kind flips back.
    const nextKind = data.kind ?? session.kind
    const sponsorId =
      nextKind === 'sponsored'
        ? data.sponsorId !== undefined
          ? data.sponsorId
          : session.sponsorId
        : null

    session.merge({
      title: data.title,
      description: data.description,
      order: data.order,
      kind: nextKind,
      sponsorId,
      ...(data.durationMinutes !== undefined
        ? { durationMinutes: data.durationMinutes }
        : {}),
    })

    await session.save()

    if (data.speakerIds !== undefined) {
      await session.related('speakers').sync(data.speakerIds)
    }

    await session.load('speakers')

    return response.json({
      message: 'Session updated successfully',
      session: await serialize(SessionTransformer.transform(session)),
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
  async addSpeaker(ctx: HttpContext) {
    const { params, bouncer, response, serializeWithoutWrapping: serialize } = ctx
    const session = await Session.findOrFail(params.id)

    await bouncer.with(SessionPolicy).authorize('manage', session)

    const speaker = await User.findOrFail(params.speakerId)

    await session.related('speakers').attach([speaker.id])

    await session.load('speakers')

    return response.json({
      message: 'Speaker added to session successfully',
      session: await serialize(SessionTransformer.transform(session)),
    })
  }

  /**
   * Remove a speaker from a session
   */
  async removeSpeaker(ctx: HttpContext) {
    const { params, bouncer, response, serializeWithoutWrapping: serialize } = ctx
    const session = await Session.findOrFail(params.id)

    await bouncer.with(SessionPolicy).authorize('manage', session)

    await session.related('speakers').detach([params.speakerId])

    await session.load('speakers')

    return response.json({
      message: 'Speaker removed from session successfully',
      session: await serialize(SessionTransformer.transform(session)),
    })
  }

  /**
   * Get available speakers for assignment
   */
  async availableSpeakers(ctx: HttpContext) {
    const { bouncer, response, serializeWithoutWrapping: serialize } = ctx
    await bouncer.with(SessionPolicy).authorize('create')

    const speakers = await User.query().orderBy('name', 'asc')

    return response.json({
      speakers: await serialize(SpeakerTransformer.transform(speakers).useVariant('forAssignment')),
    })
  }
}
