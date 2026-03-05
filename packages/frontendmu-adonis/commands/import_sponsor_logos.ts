import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import Sponsor from '#models/sponsor'

const DIRECTUS_ASSETS_URL = 'https://directus.coders.mu/assets'
const UPLOAD_DIR = 'public/uploads/sponsors'

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default class ImportSponsorLogos extends BaseCommand {
  static commandName = 'sponsors:import-logos'
  static description = 'Download sponsor logos from Directus and update DB paths'

  static options: CommandOptions = {
    startApp: true,
  }

  private stats = {
    downloaded: 0,
    skipped: 0,
    failed: 0,
  }

  async run() {
    this.logger.info('Starting sponsor logo import from Directus...')

    await mkdir(UPLOAD_DIR, { recursive: true })

    const sponsors = await Sponsor.all()
    this.logger.info(`Found ${sponsors.length} sponsors`)

    for (const sponsor of sponsors) {
      const logoResult = await this.processField(sponsor, 'logoUrl', sponsor.logoUrl)
      if (logoResult) {
        sponsor.logoUrl = logoResult
      }

      const logomarkResult = await this.processField(sponsor, 'logomarkUrl', sponsor.logomarkUrl)
      if (logomarkResult) {
        sponsor.logomarkUrl = logomarkResult
      }

      if (sponsor.$isDirty) {
        await sponsor.save()
      }
    }

    this.printSummary()
  }

  private async processField(
    sponsor: Sponsor,
    field: string,
    value: string | null
  ): Promise<string | null> {
    if (!value || value.trim() === '') {
      return null
    }

    // Already a local path or full URL — skip
    if (value.startsWith('/uploads/') || value.startsWith('http')) {
      this.logger.debug(`[${sponsor.name}] ${field}: already set, skipping`)
      this.stats.skipped++
      return null
    }

    // Must be a raw Directus UUID
    if (!UUID_REGEX.test(value)) {
      this.logger.warning(`[${sponsor.name}] ${field}: not a UUID ("${value}"), skipping`)
      this.stats.skipped++
      return null
    }

    // Check if we already downloaded a file for this UUID (idempotent re-runs)
    const existingFile = this.findExistingFile(value)
    if (existingFile) {
      const localPath = `/uploads/sponsors/${existingFile}`
      this.logger.debug(`[${sponsor.name}] ${field}: file already exists, updating path`)
      this.stats.skipped++
      return localPath
    }

    try {
      const url = `${DIRECTUS_ASSETS_URL}/${value}`
      const response = await fetch(url)

      if (!response.ok) {
        this.logger.error(`[${sponsor.name}] ${field}: HTTP ${response.status} from ${url}`)
        this.stats.failed++
        return null
      }

      const contentType = response.headers.get('content-type')?.split(';')[0].trim() || ''
      const ext = MIME_TO_EXT[contentType] || 'png'
      const filename = `${value}.${ext}`
      const filePath = join(UPLOAD_DIR, filename)

      const buffer = Buffer.from(await response.arrayBuffer())
      await writeFile(filePath, buffer)

      const localPath = `/uploads/sponsors/${filename}`
      this.logger.success(`[${sponsor.name}] ${field}: downloaded → ${filename}`)
      this.stats.downloaded++
      return localPath
    } catch (error) {
      this.logger.error(`[${sponsor.name}] ${field}: ${error}`)
      this.stats.failed++
      return null
    }
  }

  private findExistingFile(uuid: string): string | null {
    for (const ext of Object.values(MIME_TO_EXT)) {
      const filename = `${uuid}.${ext}`
      if (existsSync(join(UPLOAD_DIR, filename))) {
        return filename
      }
    }
    return null
  }

  private printSummary() {
    this.logger.info('')
    this.logger.info('═══════════════════════════════════════')
    this.logger.info('Sponsor Logo Import Summary')
    this.logger.info('═══════════════════════════════════════')
    this.logger.success(`  Downloaded: ${this.stats.downloaded}`)
    this.logger.warning(`  Skipped:    ${this.stats.skipped}`)
    if (this.stats.failed > 0) {
      this.logger.error(`  Failed:     ${this.stats.failed}`)
    }
    this.logger.info('═══════════════════════════════════════')
  }
}
