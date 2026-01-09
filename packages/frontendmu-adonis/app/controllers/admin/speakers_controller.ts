import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import vine from '@vinejs/vine'
import SpeakerPolicy from '#policies/speaker_policy'

// Validators
const createSpeakerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    email: vine.string().email().optional(),
    githubUsername: vine.string().trim().maxLength(100).optional(),
    bio: vine.string().trim().maxLength(2000).optional(),
    linkedinUrl: vine.string().url().optional(),
    twitterUrl: vine.string().url().optional(),
    websiteUrl: vine.string().url().optional(),
    featured: vine.boolean().optional(),
  })
)

const updateSpeakerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    email: vine.string().email().optional(),
    githubUsername: vine.string().trim().maxLength(100).optional(),
    bio: vine.string().trim().maxLength(2000).optional(),
    linkedinUrl: vine.string().url().optional(),
    twitterUrl: vine.string().url().optional(),
    websiteUrl: vine.string().url().optional(),
    featured: vine.boolean().optional(),
  })
)

export default class AdminSpeakersController {
  /**
   * List all speakers (users who have spoken at sessions)
   */
  async index({ inertia, bouncer, response }: HttpContext) {
    if (await bouncer.with(SpeakerPolicy).denies('viewAny')) {
      return response.forbidden('You are not authorized to view speakers.')
    }

    // Get all users who have been speakers (have entries in session_speakers)
    const speakers = await User.query()
      .whereIn('id', db.from('session_speakers').select('speaker_id').distinct())
      .preload('sessions', (query) => {
        query.preload('event')
      })
      .orderBy('name', 'asc')

    // Also get total session counts
    const speakersWithCounts = speakers.map((speaker) => ({
      ...speaker.serialize(),
      sessionCount: speaker.sessions?.length || 0,
      avatarUrl: speaker.avatarUrl || 
        (speaker.githubUsername ? `https://avatars.githubusercontent.com/${speaker.githubUsername}` : null),
    }))

    return inertia.render('admin/speakers/index', {
      speakers: speakersWithCounts,
    })
  }

  /**
   * Show the create form for a new speaker
   */
  async create({ inertia, bouncer, response }: HttpContext) {
    if (await bouncer.with(SpeakerPolicy).denies('create')) {
      return response.forbidden('You are not authorized to create speakers.')
    }

    return inertia.render('admin/speakers/create')
  }

  /**
   * Store a new speaker
   */
  async store({ request, bouncer, response, session }: HttpContext) {
    if (await bouncer.with(SpeakerPolicy).denies('create')) {
      return response.forbidden('You are not authorized to create speakers.')
    }

    const data = await request.validateUsing(createSpeakerValidator)

    // Create user as a speaker (no password, no login)
    const speaker = await User.create({
      id: randomUUID(),
      name: data.name,
      email: data.email || null,
      githubUsername: data.githubUsername || null,
      bio: data.bio || null,
      linkedinUrl: data.linkedinUrl || null,
      twitterUrl: data.twitterUrl || null,
      websiteUrl: data.websiteUrl || null,
      featured: data.featured || false,
      role: 'member',
      password: null,
    })

    session.flash('success', 'Speaker created successfully!')
    return response.redirect(`/admin/speakers/${speaker.id}/edit`)
  }

  /**
   * Show the edit form for a speaker
   */
  async edit({ inertia, params, bouncer, response }: HttpContext) {
    if (await bouncer.with(SpeakerPolicy).denies('edit')) {
      return response.forbidden('You are not authorized to edit speakers.')
    }

    const speaker = await User.query()
      .where('id', params.id)
      .preload('sessions', (query) => {
        query.preload('event')
      })
      .firstOrFail()

    return inertia.render('admin/speakers/edit', {
      speaker: {
        ...speaker.serialize(),
        avatarUrl: speaker.avatarUrl || 
          (speaker.githubUsername ? `https://avatars.githubusercontent.com/${speaker.githubUsername}` : null),
        sessions: speaker.sessions?.map((s) => ({
          id: s.id,
          title: s.title,
          eventTitle: s.event?.title,
          eventDate: s.event?.eventDate?.toISODate(),
        })) || [],
      },
    })
  }

  /**
   * Update a speaker
   */
  async update({ params, request, bouncer, response, session }: HttpContext) {
    if (await bouncer.with(SpeakerPolicy).denies('update')) {
      return response.forbidden('You are not authorized to update speakers.')
    }

    const speaker = await User.findOrFail(params.id)
    const data = await request.validateUsing(updateSpeakerValidator)

    speaker.merge({
      name: data.name,
      email: data.email || null,
      githubUsername: data.githubUsername || null,
      bio: data.bio || null,
      linkedinUrl: data.linkedinUrl || null,
      twitterUrl: data.twitterUrl || null,
      websiteUrl: data.websiteUrl || null,
      featured: data.featured || false,
    })

    await speaker.save()

    session.flash('success', 'Speaker updated successfully!')
    return response.redirect(`/speaker/${speaker.id}`)
  }

  /**
   * Delete a speaker
   */
  async destroy({ params, bouncer, response, session }: HttpContext) {
    if (await bouncer.with(SpeakerPolicy).denies('delete')) {
      return response.forbidden('You are not authorized to delete speakers.')
    }

    const speaker = await User.findOrFail(params.id)
    
    // Remove from session_speakers first
    await db.from('session_speakers').where('speaker_id', speaker.id).delete()
    
    // Delete the user
    await speaker.delete()

    session.flash('success', 'Speaker deleted successfully!')
    return response.redirect('/admin/speakers')
  }
}
