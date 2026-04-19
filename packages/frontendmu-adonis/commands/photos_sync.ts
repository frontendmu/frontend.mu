import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Event from '#models/event'
import EventPhoto from '#models/event_photo'

const INDEX_URL = 'https://raw.githubusercontent.com/frontendmu/google-photos-sync/main/index.json'
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/frontendmu/google-photos-sync@main/'

export default class PhotosSync extends BaseCommand {
  static commandName = 'photos:sync'
  static description = 'Sync event_photos rows from the google-photos-sync index.json'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info(`Fetching ${INDEX_URL}`)
    const response = await fetch(INDEX_URL)
    if (!response.ok) {
      this.logger.error(`Failed to fetch index.json: ${response.status} ${response.statusText}`)
      this.exitCode = 1
      return
    }

    const raw = (await response.json()) as Record<string, string[]>
    const index = new Map<string, string[]>()
    for (const [key, paths] of Object.entries(raw)) {
      index.set(key.trim(), paths)
    }
    this.logger.info(`Loaded ${index.size} albums from index.json`)

    const events = await Event.query().whereNotNull('albumName')
    this.logger.info(`Found ${events.length} events with album_name`)

    let added = 0
    let removed = 0
    let reordered = 0
    let skipped = 0

    for (const event of events) {
      const album = event.albumName!.trim()
      const paths = index.get(album)
      if (!paths) {
        this.logger.warning(`  [skip] ${event.title} — "${album}" not in index.json`)
        skipped++
        continue
      }

      const desired = paths.map((p, order) => ({ photoUrl: CDN_BASE + p, order }))
      const desiredByUrl = new Map(desired.map((d) => [d.photoUrl, d]))

      const existing = await EventPhoto.query().where('eventId', event.id)
      const existingByUrl = new Map(existing.map((p) => [p.photoUrl, p]))

      const toAdd = desired.filter((d) => !existingByUrl.has(d.photoUrl))
      if (toAdd.length) {
        await EventPhoto.createMany(
          toAdd.map((d) => ({
            eventId: event.id,
            photoUrl: d.photoUrl,
            order: d.order,
          }))
        )
        added += toAdd.length
      }

      for (const photo of existing) {
        const d = desiredByUrl.get(photo.photoUrl)
        if (d && d.order !== photo.order) {
          photo.order = d.order
          await photo.save()
          reordered++
        }
      }

      const toRemoveIds = existing.filter((p) => !desiredByUrl.has(p.photoUrl)).map((p) => p.id)
      if (toRemoveIds.length) {
        await EventPhoto.query().whereIn('id', toRemoveIds).delete()
        removed += toRemoveIds.length
      }

      this.logger.info(
        `  [ok]   ${event.title} — +${toAdd.length} -${toRemoveIds.length} total=${desired.length}`
      )
    }

    this.logger.success(
      `Sync complete: +${added} added, -${removed} removed, ${reordered} reordered, ${skipped} skipped`
    )
  }
}
