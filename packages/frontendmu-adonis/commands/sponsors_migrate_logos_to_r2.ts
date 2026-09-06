import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import app from '@adonisjs/core/services/app'
import drive from '@adonisjs/drive/services/main'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import Sponsor from '#models/sponsor'
import env from '#start/env'

const KEY_PREFIX = 'sponsors'
const LOCAL_PREFIX = '/uploads/sponsors/'
const PUBLIC_UPLOADS_DIR = 'public/uploads/sponsors'

const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  gif: 'image/gif',
}

type Field = 'logoUrl' | 'logomarkUrl'

export default class SponsorsMigrateLogosToR2 extends BaseCommand {
  static commandName = 'sponsors:migrate-logos-to-r2'
  static description =
    'Copy locally-stored sponsor logos (public/uploads/sponsors/*) into R2 and rewrite sponsors.logo_url / logomark_url. Idempotent — re-runs only touch rows still pointing at /uploads/sponsors/.'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.boolean({
    description: 'Show key mapping for a sample of rows without uploading or modifying the DB',
  })
  declare dryRun: boolean

  @flags.number({
    description: 'Process at most N sponsors (useful for a small-batch sanity check)',
  })
  declare limit: number

  @flags.boolean({
    description:
      'Skip the R2 upload step — only rewrite DB URLs. Use when the bucket is already populated (e.g. after migrating a local snapshot first, then re-running against the live prod DB).',
  })
  declare skipUpload: boolean

  async run() {
    const cdnBaseRaw = env.get('CDN_BASE_URL')
    if (!cdnBaseRaw) {
      this.logger.error('CDN_BASE_URL is not set. Aborting.')
      this.exitCode = 1
      return
    }
    // Trim a trailing slash so concatenation can't produce `host//key`.
    const cdnBase = cdnBaseRaw.replace(/\/+$/, '')

    const driveDisk = env.get('DRIVE_DISK')
    if (driveDisk !== 'r2' && !this.dryRun) {
      this.logger.error(
        `DRIVE_DISK=${driveDisk}, expected 'r2'. Set DRIVE_DISK=r2 in your env or run with --dry-run.`
      )
      this.exitCode = 1
      return
    }

    if (this.limit !== undefined && (!Number.isInteger(this.limit) || this.limit <= 0)) {
      this.logger.error(`--limit must be a positive integer (got ${this.limit}).`)
      this.exitCode = 1
      return
    }

    let query = Sponsor.query().where((q) => {
      q.where('logoUrl', 'like', `${LOCAL_PREFIX}%`).orWhere(
        'logomarkUrl',
        'like',
        `${LOCAL_PREFIX}%`
      )
    })
    if (this.limit) query = query.limit(this.limit)
    const sponsors = await query

    // Each sponsor has up to two fields needing migration; flatten into a job list.
    const jobs: Array<{ sponsor: Sponsor; field: Field; url: string }> = []
    for (const sponsor of sponsors) {
      for (const field of ['logoUrl', 'logomarkUrl'] as const) {
        const url = sponsor[field]
        if (url && url.startsWith(LOCAL_PREFIX)) {
          jobs.push({ sponsor, field, url })
        }
      }
    }

    this.logger.info(`Found ${jobs.length} sponsor logo file(s) on local fs.`)
    if (jobs.length === 0) {
      this.logger.success('Nothing to migrate.')
      return
    }

    if (this.dryRun) {
      this.logger.info('--dry-run — sample of first 10 mappings:')
      for (const job of jobs.slice(0, 10)) {
        try {
          const { key } = this.deriveKeyAndBasename(job.url)
          this.logger.info(`  [${job.sponsor.name}] ${job.field}: ${job.url}`)
          this.logger.info(`    → ${cdnBase}/${key}`)
        } catch (error) {
          this.logger.error(
            `  [${job.sponsor.name}] ${job.field}: ${job.url} — ${error instanceof Error ? error.message : String(error)}`
          )
        }
      }
      this.logger.warning(`(${jobs.length} total — re-run without --dry-run to migrate.)`)
      return
    }

    const disk = drive.use()
    const startedAt = Date.now()
    const totals = { migrated: 0, failed: 0 }

    for (const job of jobs) {
      const labelPrefix = `${totals.migrated + totals.failed + 1}/${jobs.length} [${job.sponsor.name}] ${job.field}`

      let key: string
      let basename: string
      try {
        ;({ key, basename } = this.deriveKeyAndBasename(job.url))
      } catch (error) {
        this.logger.error(
          `${labelPrefix} — ${error instanceof Error ? error.message : String(error)}`
        )
        totals.failed++
        continue
      }

      const label = `${labelPrefix} → ${key}`

      try {
        if (this.skipUpload) {
          if (!(await disk.exists(key))) {
            this.logger.error(`${label} — not in R2 (re-run without --skip-upload)`)
            totals.failed++
            continue
          }
        } else {
          const sourcePath = app.makePath(PUBLIC_UPLOADS_DIR, basename)
          if (!existsSync(sourcePath)) {
            this.logger.error(`${label} — local file missing: ${sourcePath}`)
            totals.failed++
            continue
          }
          const bytes = await readFile(sourcePath)
          const ext = basename.split('.').pop()?.toLowerCase() ?? ''
          const contentType = MIME_BY_EXT[ext] ?? 'application/octet-stream'
          await disk.put(key, bytes, { contentType })
        }

        job.sponsor[job.field] = `${cdnBase}/${key}`
        await job.sponsor.save()

        totals.migrated++
        this.logger.success(label)
      } catch (error) {
        totals.failed++
        this.logger.error(
          `${label} — ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }

    const seconds = Math.round((Date.now() - startedAt) / 1000)
    this.logger.info('')
    this.logger.info('═══════════════════════════════════════')
    this.logger.success(`  Migrated: ${totals.migrated}`)
    if (totals.failed > 0) this.logger.error(`  Failed:   ${totals.failed}`)
    this.logger.info(`  Duration: ${seconds}s`)
    this.logger.info('═══════════════════════════════════════')

    if (totals.failed > 0) this.exitCode = 1
  }

  /**
   * `/uploads/sponsors/<uuid>.png` → `sponsors/<uuid>.png`. Basenames are
   * already unique UUIDs from the original Directus import, so a flat
   * namespace under `sponsors/` is collision-safe.
   *
   * The basename is rejected if it contains anything other than the
   * `[A-Za-z0-9._-]` set — protects against a poisoned DB row using path
   * traversal (`../etc/passwd`) to exfiltrate server files via the
   * subsequent fs read + R2 PUT.
   */
  private deriveKeyAndBasename(url: string): { key: string; basename: string } {
    const basename = url.slice(LOCAL_PREFIX.length)
    if (!/^[A-Za-z0-9._-]+$/.test(basename)) {
      throw new Error(`refusing basename "${basename}" (must be a plain filename)`)
    }
    return { key: `${KEY_PREFIX}/${basename}`, basename }
  }
}
