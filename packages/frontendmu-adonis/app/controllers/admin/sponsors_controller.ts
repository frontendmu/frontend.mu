import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import Sponsor from '#models/sponsor'
import vine from '@vinejs/vine'
import SponsorPolicy from '#policies/sponsor_policy'

// Validators
const createSponsorValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    website: vine.string().url().optional(),
    description: vine.string().trim().maxLength(2000).optional(),
    logoUrl: vine.string().url().optional(),
    logomarkUrl: vine.string().url().optional(),
    sponsorTypes: vine.array(vine.string()).optional(),
    darkbg: vine.boolean().optional(),
    status: vine.enum(['active', 'inactive']).optional(),
  })
)

const updateSponsorValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    website: vine.string().url().optional(),
    description: vine.string().trim().maxLength(2000).optional(),
    logoUrl: vine.string().url().optional(),
    logomarkUrl: vine.string().url().optional(),
    sponsorTypes: vine.array(vine.string()).optional(),
    darkbg: vine.boolean().optional(),
    status: vine.enum(['active', 'inactive']).optional(),
  })
)

export default class AdminSponsorsController {
  /**
   * List all sponsors
   */
  async index({ inertia, bouncer, response, request }: HttpContext) {
    if (await bouncer.with(SponsorPolicy).denies('viewAny')) {
      return response.forbidden('You are not authorized to view sponsors.')
    }

    const statusFilter = request.input('status', 'all')

    let query = Sponsor.query().orderBy('name', 'asc')

    if (statusFilter !== 'all') {
      query = query.where('status', statusFilter)
    }

    const sponsors = await query

    return inertia.render('admin/sponsors/index', {
      sponsors,
      statusFilter,
    })
  }

  /**
   * Show the create form for a new sponsor
   */
  async create({ inertia, bouncer, response }: HttpContext) {
    if (await bouncer.with(SponsorPolicy).denies('create')) {
      return response.forbidden('You are not authorized to create sponsors.')
    }

    return inertia.render('admin/sponsors/create')
  }

  /**
   * Store a new sponsor
   */
  async store({ request, bouncer, response, session }: HttpContext) {
    if (await bouncer.with(SponsorPolicy).denies('create')) {
      return response.forbidden('You are not authorized to create sponsors.')
    }

    const data = await request.validateUsing(createSponsorValidator)

    const sponsor = await Sponsor.create({
      id: randomUUID(),
      name: data.name,
      website: data.website || null,
      description: data.description || null,
      logoUrl: data.logoUrl || null,
      logomarkUrl: data.logomarkUrl || null,
      sponsorTypes: data.sponsorTypes || [],
      darkbg: data.darkbg || false,
      status: data.status || 'active',
    })

    session.flash('success', 'Sponsor created successfully!')
    return response.redirect(`/admin/sponsors/${sponsor.id}/edit`)
  }

  /**
   * Show the edit form for a sponsor
   */
  async edit({ inertia, params, bouncer, response }: HttpContext) {
    if (await bouncer.with(SponsorPolicy).denies('edit')) {
      return response.forbidden('You are not authorized to edit sponsors.')
    }

    const sponsor = await Sponsor.query()
      .where('id', params.id)
      .preload('events')
      .firstOrFail()

    return inertia.render('admin/sponsors/edit', {
      sponsor: {
        ...sponsor.serialize(),
        eventCount: sponsor.events?.length || 0,
      },
    })
  }

  /**
   * Update a sponsor
   */
  async update({ params, request, bouncer, response, session }: HttpContext) {
    if (await bouncer.with(SponsorPolicy).denies('update')) {
      return response.forbidden('You are not authorized to update sponsors.')
    }

    const sponsor = await Sponsor.findOrFail(params.id)
    const data = await request.validateUsing(updateSponsorValidator)

    sponsor.merge({
      name: data.name,
      website: data.website || null,
      description: data.description || null,
      logoUrl: data.logoUrl || null,
      logomarkUrl: data.logomarkUrl || null,
      sponsorTypes: data.sponsorTypes || [],
      darkbg: data.darkbg || false,
      status: data.status || 'active',
    })

    await sponsor.save()

    session.flash('success', 'Sponsor updated successfully!')
    return response.redirect(`/sponsor/${sponsor.id}`)
  }

  /**
   * Delete a sponsor
   */
  async destroy({ params, bouncer, response, session }: HttpContext) {
    if (await bouncer.with(SponsorPolicy).denies('delete')) {
      return response.forbidden('You are not authorized to delete sponsors.')
    }

    const sponsor = await Sponsor.findOrFail(params.id)
    await sponsor.delete()

    session.flash('success', 'Sponsor deleted successfully!')
    return response.redirect('/admin/sponsors')
  }
}
