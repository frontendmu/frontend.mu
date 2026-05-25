import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import drive from '@adonisjs/drive/services/main'
import EventPhoto from '#models/event_photo'
import env from '#start/env'

const JSDELIVR_PREFIX = 'https://cdn.jsdelivr.net/gh/frontendmu/google-photos-sync'

export default class PhotosMigrateToR2 extends BaseCommand {
  static commandName = 'photos:migrate-to-r2'
  static description =
    'Copy legacy jsDelivr-hosted event photos into R2 and rewrite event_photos.photo_url. Idempotent — re-runs only touch rows still on jsDelivr.'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.boolean({
    description: 'Show key mapping for a sample of rows without uploading or modifying the DB',
  })
  declare dryRun: boolean

  @flags.number({
    description: 'Process at most N photos (useful for a small-batch sanity check)',
  })
  declare limit: number

  @flags.number({
    description: 'Parallel uploads to R2',
    default: 5,
  })
  declare concurrency: number

  @flags.boolean({
    description:
      'Skip the R2 upload step — only rewrite DB URLs. Use when the bucket is already populated (e.g. after migrating a local snapshot first, then re-running against the live prod DB).',
  })
  declare skipUpload: boolean

  async run() {
    const cdnBase = env.get('CDN_BASE_URL')
    if (!cdnBase) {
      this.logger.error('CDN_BASE_URL is not set. Aborting.')
      this.exitCode = 1
      return
    }

    const driveDisk = env.get('DRIVE_DISK')
    if (driveDisk !== 'r2' && !this.dryRun) {
      this.logger.error(
        `DRIVE_DISK=${driveDisk}, expected 'r2'. Set DRIVE_DISK=r2 in your env or run with --dry-run.`
      )
      this.exitCode = 1
      return
    }

    let query = EventPhoto.query().where('photo_url', 'like', `${JSDELIVR_PREFIX}%`)
    if (this.limit) query = query.limit(this.limit)
    const photos = await query

    this.logger.info(`Found ${photos.length} photo(s) on jsDelivr.`)
    if (photos.length === 0) {
      this.logger.success('Nothing to migrate.')
      return
    }

    if (this.dryRun) {
      this.logger.info('--dry-run — sample of first 10 mappings:')
      for (const photo of photos.slice(0, 10)) {
        const key = this.deriveKey(photo)
        this.logger.info(`  ${photo.photoUrl}`)
        this.logger.info(`    → ${cdnBase}/${key}`)
      }
      this.logger.warning(`(${photos.length} total — re-run without --dry-run to migrate.)`)
      return
    }

    const disk = drive.use()
    const totals = { migrated: 0, failed: 0 }
    const queue = [...photos]
    const startedAt = Date.now()

    // Simple worker pool — pull from a shared queue until empty.
    const workers = Array.from({ length: Math.max(1, this.concurrency) }, async (_, workerId) => {
      while (queue.length > 0) {
        const photo = queue.shift()
        if (!photo) break
        const key = this.deriveKey(photo)
        const label = `[w${workerId}] ${photos.length - queue.length}/${photos.length} ${key}`

        try {
          if (this.skipUpload) {
            // Trust that the bucket is already populated and verify before
            // rewriting the DB row. Saves ~5 minutes per 900 photos.
            if (!(await disk.exists(key))) {
              this.logger.error(`${label} — not in R2 (re-run without --skip-upload)`)
              totals.failed++
              continue
            }
          } else {
            const response = await fetch(photo.photoUrl)
            if (!response.ok) {
              this.logger.error(`${label} — fetch ${response.status} ${response.statusText}`)
              totals.failed++
              continue
            }

            const bytes = new Uint8Array(await response.arrayBuffer())
            const contentType =
              response.headers.get('content-type')?.split(';')[0].trim() ||
              'application/octet-stream'

            await disk.put(key, bytes, { contentType })
          }

          photo.storageKey = key
          photo.photoUrl = `${cdnBase}/${key}`
          await photo.save()

          totals.migrated++
          this.logger.success(label)
        } catch (error) {
          totals.failed++
          this.logger.error(
            `${label} — ${error instanceof Error ? error.message : String(error)}`
          )
        }
      }
    })

    await Promise.all(workers)

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
   * Convert a jsDelivr URL into an R2 key under the event's namespace, keeping
   * the original filename so the bucket is browsable and round-trippable.
   */
  private deriveKey(photo: EventPhoto): string {
    const pathname = new URL(photo.photoUrl).pathname
    const basename = decodeURIComponent(pathname.split('/').pop() || '')
    if (!basename) throw new Error(`Cannot derive filename from ${photo.photoUrl}`)
    return `events/${photo.eventId}/${basename}`
  }
}
