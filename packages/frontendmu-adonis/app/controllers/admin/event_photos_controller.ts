import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
import db from '@adonisjs/lucid/services/db'
import Event from '#models/event'
import EventPhoto from '#models/event_photo'
import EventPolicy from '#policies/event_policy'
import { thumbnailFor } from '#utils/thumbnail'
import {
  createEventPhotoValidator,
  reorderEventPhotosValidator,
  updateEventPhotoValidator,
} from '#validators/event_photo_validator'

function serializePhoto(photo: EventPhoto) {
  return {
    id: photo.id,
    photoUrl: photo.photoUrl,
    thumbnailUrl: thumbnailFor(photo.photoUrl, 800),
    caption: photo.caption,
    order: photo.order,
  }
}

export default class AdminEventPhotosController {
  /**
   * Confirms an upload that the browser just pushed to storage and creates
   * the matching DB row. The key was issued by MediaController.presignUpload.
   */
  async store({ params, request, bouncer, response }: HttpContext) {
    const event = await Event.findOrFail(params.eventId)
    await bouncer.with(EventPolicy).authorize('edit', event)

    const { key, caption, order } = await request.validateUsing(createEventPhotoValidator)

    if (!key.startsWith(`events/${event.id}/`)) {
      return response.badRequest({ error: 'Key does not belong to this event' })
    }

    const disk = drive.use()
    if (!(await disk.exists(key))) {
      return response.badRequest({ error: 'Object was not uploaded to storage' })
    }

    let nextOrder = order ?? null
    if (nextOrder === null) {
      const last = await EventPhoto.query()
        .where('eventId', event.id)
        .orderBy('order', 'desc')
        .first()
      nextOrder = (last?.order ?? -1) + 1
    }

    const photo = await EventPhoto.create({
      eventId: event.id,
      photoUrl: await disk.getUrl(key),
      storageKey: key,
      caption: caption ?? null,
      order: nextOrder,
    })

    return response.status(201).json({ photo: serializePhoto(photo) })
  }

  async update({ params, request, bouncer, response }: HttpContext) {
    const event = await Event.findOrFail(params.eventId)
    await bouncer.with(EventPolicy).authorize('edit', event)

    const photo = await EventPhoto.query()
      .where('id', params.photoId)
      .where('eventId', event.id)
      .firstOrFail()

    const data = await request.validateUsing(updateEventPhotoValidator)

    if (data.caption !== undefined) {
      photo.caption = data.caption
      await photo.save()
    }

    return response.json({ photo: serializePhoto(photo) })
  }

  /**
   * Reorders all photos in a single transaction. Requires the payload to list
   * every photo in the event exactly once — partial or duplicate input is
   * rejected so we can't end up with stale or colliding positions.
   */
  async reorder({ params, request, bouncer, response }: HttpContext) {
    const event = await Event.findOrFail(params.eventId)
    await bouncer.with(EventPolicy).authorize('edit', event)

    const { photoIds } = await request.validateUsing(reorderEventPhotosValidator)

    const photos = await EventPhoto.query().where('eventId', event.id)
    const photosById = new Map(photos.map((p) => [p.id, p]))

    if (new Set(photoIds).size !== photoIds.length) {
      return response.badRequest({ error: 'photoIds contains duplicates' })
    }
    if (photoIds.length !== photos.length) {
      return response.badRequest({
        error: `photoIds must include every photo in the event (expected ${photos.length}, got ${photoIds.length})`,
      })
    }
    for (const id of photoIds) {
      if (!photosById.has(id)) {
        return response.badRequest({ error: `Photo ${id} does not belong to this event` })
      }
    }

    await db.transaction(async (trx) => {
      for (let i = 0; i < photoIds.length; i++) {
        const photo = photosById.get(photoIds[i])!
        if (photo.order !== i) {
          photo.useTransaction(trx)
          photo.order = i
          await photo.save()
        }
      }
    })

    return response.json({ ok: true })
  }

  async destroy({ params, bouncer, response }: HttpContext) {
    const event = await Event.findOrFail(params.eventId)
    await bouncer.with(EventPolicy).authorize('edit', event)

    const photo = await EventPhoto.query()
      .where('id', params.photoId)
      .where('eventId', event.id)
      .firstOrFail()

    // Legacy data has multiple rows pointing at the same storage_key (when the
    // same source URL was registered twice). Only drop the R2 object if no
    // other row still references it — otherwise we'd 404 those siblings.
    if (photo.storageKey) {
      const sharedCount = await EventPhoto.query()
        .where('storageKey', photo.storageKey)
        .whereNot('id', photo.id)
        .count('* as total')
        .first()

      const isShared = Number(sharedCount?.$extras.total ?? 0) > 0

      if (!isShared) {
        try {
          await drive.use().delete(photo.storageKey)
        } catch (error) {
          // Object may already be missing; log but proceed with the row delete
          // so the admin UI doesn't get stuck.
          console.error(`[event-photos] failed to delete ${photo.storageKey}:`, error)
        }
      }
    }

    await photo.delete()

    return response.json({ ok: true })
  }
}
