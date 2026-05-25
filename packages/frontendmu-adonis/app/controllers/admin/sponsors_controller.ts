import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'
import drive from '@adonisjs/drive/services/main'
import Sponsor from '#models/sponsor'
import SponsorPolicy from '#policies/sponsor_policy'
import { sponsorValidator } from '#validators/sponsor_validator'
import SponsorTransformer from '#transformers/sponsor_transformer'
import env from '#start/env'

const KEY_PREFIX = 'sponsors'
const LEGACY_URL_PREFIX = '/uploads/sponsors/'
const FILE_RULES = { size: '2mb' as const, extnames: ['svg', 'png', 'jpg', 'jpeg', 'webp'] }

/**
 * Recover the storage key from a URL stored in the DB. Handles both the
 * canonical CDN form (`https://cdn.coders.mu/sponsors/<file>`) and the legacy
 * `/uploads/sponsors/<file>` form used by old local-fs deployments. Returns
 * null for external URLs (admin typed a full http(s) URL into the field).
 */
function keyFromUrl(url: string | null): string | null {
  if (!url) return null
  const cdnBase = env.get('CDN_BASE_URL')
  if (cdnBase && url.startsWith(`${cdnBase}/${KEY_PREFIX}/`)) {
    return url.slice(cdnBase.length + 1)
  }
  if (url.startsWith(LEGACY_URL_PREFIX)) {
    return `${KEY_PREFIX}/${url.slice(LEGACY_URL_PREFIX.length)}`
  }
  return null
}

async function deleteStoredObject(url: string | null) {
  const key = keyFromUrl(url)
  if (!key) return
  try {
    await drive.use().delete(key)
  } catch (error) {
    // Object may already be missing (manual cleanup, prior failed delete).
    // Log but don't block the save — the DB rewrite is the source of truth.
    console.error(`[sponsors] failed to delete ${key}:`, error)
  }
}

async function clearLogoFile(existingUrl: string | null): Promise<{ url: null; error?: string }> {
  await deleteStoredObject(existingUrl)
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

    // Upload the new object before deleting the old, so a transient storage
    // error doesn't leave the sponsor without a logo.
    const key = `${KEY_PREFIX}/${randomUUID()}.${file.extname}`
    const disk = drive.use()
    await disk.putStream(key, createReadStream(file.tmpPath!), {
      contentType: file.headers['content-type'],
    })

    await deleteStoredObject(existingUrl)
    return { url: await disk.getUrl(key) }
  }

  if (urlValue) {
    // Admin typed (or kept) a URL field. If it's a different URL than what was
    // previously stored AND the previous value was something we own, clean it.
    if (urlValue !== existingUrl) {
      await deleteStoredObject(existingUrl)
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
      await deleteStoredObject(url)
    }

    await sponsor.delete()

    session.flash('success', 'Sponsor deleted successfully!')
    return response.redirect().toPath(urlFor('admin.sponsors.index'))
  }
}
