import type { HttpContext } from '@adonisjs/core/http'
import Sponsor from '#models/sponsor'
import SponsorPolicy from '#policies/sponsor_policy'
import { sponsorValidator } from '#validators/sponsor_validator'
import { toSponsorSummary, toSponsor } from '#dtos/factories'

export default class AdminSponsorsController {
  async index({ inertia, bouncer, request }: HttpContext) {
    await bouncer.with(SponsorPolicy).authorize('viewAny')

    const allowedStatuses = ['all', 'active', 'inactive'] as const
    const rawStatus = request.input('status', 'all')
    const statusFilter = allowedStatuses.includes(rawStatus) ? rawStatus : 'all'

    let query = Sponsor.query().orderBy('name', 'asc')

    if (statusFilter !== 'all') {
      query = query.where('status', statusFilter)
    }

    const sponsors = await query

    return inertia.render('admin/sponsors/index', {
      sponsors: sponsors.map(toSponsorSummary),
      statusFilter,
    })
  }

  async create({ inertia, bouncer }: HttpContext) {
    await bouncer.with(SponsorPolicy).authorize('create')

    return inertia.render('admin/sponsors/create')
  }

  async store({ request, bouncer, response, session }: HttpContext) {
    await bouncer.with(SponsorPolicy).authorize('create')

    const data = await request.validateUsing(sponsorValidator)

    const sponsor = await Sponsor.create({
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
    return response.redirect().toRoute('admin.sponsors.edit', { id: sponsor.id })
  }

  async edit({ inertia, params, bouncer }: HttpContext) {
    await bouncer.with(SponsorPolicy).authorize('edit')

    const sponsor = await Sponsor.query()
      .where('id', params.id)
      .preload('events')
      .firstOrFail()

    return inertia.render('admin/sponsors/edit', {
      sponsor: {
        ...toSponsor(sponsor),
        eventCount: sponsor.events?.length || 0,
      },
    })
  }

  async update({ params, request, bouncer, response, session }: HttpContext) {
    await bouncer.with(SponsorPolicy).authorize('update')

    const sponsor = await Sponsor.findOrFail(params.id)
    const data = await request.validateUsing(sponsorValidator)

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
    return response.redirect().toRoute('sponsors.show', { id: sponsor.id })
  }

  async destroy({ params, bouncer, response, session }: HttpContext) {
    await bouncer.with(SponsorPolicy).authorize('delete')

    const sponsor = await Sponsor.findOrFail(params.id)
    await sponsor.delete()

    session.flash('success', 'Sponsor deleted successfully!')
    return response.redirect().toRoute('admin.sponsors.index')
  }
}
