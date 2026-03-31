import { randomUUID } from 'node:crypto'
import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { urlFor } from '@adonisjs/core/services/url_builder'
import Sponsor from '#models/sponsor'
import SponsorPolicy from '#policies/sponsor_policy'
import { sponsorValidator } from '#validators/sponsor_validator'
import SponsorTransformer from '#transformers/sponsor_transformer'

const UPLOAD_DIR = 'uploads/sponsors'
const FILE_RULES = { size: '2mb' as const, extnames: ['svg', 'png', 'jpg', 'jpeg', 'webp'] }

async function deleteUploadedFile(url: string | null) {
  if (!url?.startsWith('/uploads/')) {
    return
  }

  await unlink(join(app.publicPath(), url)).catch(() => {})
}

async function clearLogoFile(existingUrl: string | null): Promise<{ url: null; error?: string }> {
  await deleteUploadedFile(existingUrl)

  return { url: null }
}

async function handleLogoUpload(
  request: HttpContext['request'],
  fieldName: string,
  urlValue: string | undefined,
  existingUrl: string | null = null
): Promise<{ url: string | null; error?: string }> {
  const file = request.file(fieldName, FILE_RULES)

  if (file) {
    if (file.hasErrors) {
      return { url: existingUrl, error: file.errors[0]?.message }
    }

    await deleteUploadedFile(existingUrl)

    const fileName = `${randomUUID()}.${file.extname}`
    await file.move(app.publicPath(UPLOAD_DIR), { name: fileName })
    return { url: `/${UPLOAD_DIR}/${fileName}` }
  }

  if (urlValue) {
    if (urlValue !== existingUrl) {
      await deleteUploadedFile(existingUrl)
    }

    return { url: urlValue }
  }

  return { url: existingUrl ?? null }
}

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
      sponsors: SponsorTransformer.transform(sponsors).useVariant('summary'),
      statusFilter,
    })
  }

  async create({ inertia, bouncer }: HttpContext) {
    await bouncer.with(SponsorPolicy).authorize('create')

    return inertia.render('admin/sponsors/create', {})
  }

  async store({ request, bouncer, response, session }: HttpContext) {
    await bouncer.with(SponsorPolicy).authorize('create')

    const data = await request.validateUsing(sponsorValidator)

    const logo = await handleLogoUpload(request, 'logoFile', data.logoUrl)
    const logomark = await handleLogoUpload(request, 'logomarkFile', data.logomarkUrl)

    if (logo.error || logomark.error) {
      session.flashAll()
      session.flashErrors({
        ...(logo.error ? { logoFile: logo.error } : {}),
        ...(logomark.error ? { logomarkFile: logomark.error } : {}),
      })
      return response.redirect().back()
    }

    const sponsor = await Sponsor.create({
      name: data.name,
      website: data.website || null,
      description: data.description || null,
      logoUrl: logo.url,
      logomarkUrl: logomark.url,
      sponsorTypes: data.sponsorTypes || [],
      logoBg: data.logoBg || null,
      status: data.status || 'active',
    })

    session.flash('success', 'Sponsor created successfully!')
    return response.redirect().toPath(urlFor('admin.sponsors.edit', { id: sponsor.id }))
  }

  async edit({ inertia, params, bouncer }: HttpContext) {
    await bouncer.with(SponsorPolicy).authorize('edit')

    const sponsor = await Sponsor.query().where('id', params.id).preload('events').firstOrFail()

    return inertia.render('admin/sponsors/edit', {
      sponsor: SponsorTransformer.transform(sponsor).useVariant('forAdminEdit'),
    })
  }

  async update({ params, request, bouncer, response, session }: HttpContext) {
    await bouncer.with(SponsorPolicy).authorize('update')

    const sponsor = await Sponsor.findOrFail(params.id)
    const data = await request.validateUsing(sponsorValidator)

    const logo = data.clearLogo
      ? await clearLogoFile(sponsor.logoUrl)
      : await handleLogoUpload(request, 'logoFile', data.logoUrl, sponsor.logoUrl)
    const logomark = data.clearLogomark
      ? await clearLogoFile(sponsor.logomarkUrl)
      : await handleLogoUpload(request, 'logomarkFile', data.logomarkUrl, sponsor.logomarkUrl)

    if (logo.error || logomark.error) {
      session.flashAll()
      session.flashErrors({
        ...(logo.error ? { logoFile: logo.error } : {}),
        ...(logomark.error ? { logomarkFile: logomark.error } : {}),
      })
      return response.redirect().back()
    }

    sponsor.merge({
      name: data.name,
      website: data.website || null,
      description: data.description || null,
      logoUrl: logo.url,
      logomarkUrl: logomark.url,
      sponsorTypes: data.sponsorTypes || [],
      logoBg: data.logoBg || null,
      status: data.status || 'active',
    })

    await sponsor.save()

    session.flash('success', 'Sponsor updated successfully!')
    return response.redirect().toPath(urlFor('sponsors.show', { id: sponsor.id }))
  }

  async destroy({ params, bouncer, response, session }: HttpContext) {
    await bouncer.with(SponsorPolicy).authorize('delete')

    const sponsor = await Sponsor.findOrFail(params.id)

    for (const url of [sponsor.logoUrl, sponsor.logomarkUrl]) {
      await deleteUploadedFile(url)
    }

    await sponsor.delete()

    session.flash('success', 'Sponsor deleted successfully!')
    return response.redirect().toPath(urlFor('admin.sponsors.index'))
  }
}
