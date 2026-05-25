import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'
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

    photo.merge({
      ...(data.caption !== undefined ? { caption: data.caption } : {}),
      ...(data.order !== undefined ? { order: data.order } : {}),
    })

    await photo.save()

    return response.json({ photo: serializePhoto(photo) })
  }

  /**
   * Reorders all photos in a single transaction. Accepts the desired ordering
   * by id; positions are assigned 0..N matching the input order.
   */
  async reorder({ params, request, bouncer, response }: HttpContext) {
    const event = await Event.findOrFail(params.eventId)
    await bouncer.with(EventPolicy).authorize('edit', event)

    const { photoIds } = await request.validateUsing(reorderEventPhotosValidator)

    const photos = await EventPhoto.query().where('eventId', event.id)
    const photosById = new Map(photos.map((p) => [p.id, p]))

    for (const id of photoIds) {
      if (!photosById.has(id)) {
        return response.badRequest({ error: `Photo ${id} does not belong to this event` })
      }
    }

    for (let i = 0; i < photoIds.length; i++) {
      const photo = photosById.get(photoIds[i])!
      if (photo.order !== i) {
        photo.order = i
        await photo.save()
      }
    }

    return response.json({ ok: true })
  }

  async destroy({ params, bouncer, response }: HttpContext) {
    const event = await Event.findOrFail(params.eventId)
    await bouncer.with(EventPolicy).authorize('edit', event)

    const photo = await EventPhoto.query()
      .where('id', params.photoId)
      .where('eventId', event.id)
      .firstOrFail()

    if (photo.storageKey) {
      try {
        await drive.use().delete(photo.storageKey)
      } catch (error) {
        // Object may already be missing; log but keep the row deletion
        // moving so the admin UI doesn't get stuck.
        console.error(`[event-photos] failed to delete ${photo.storageKey}:`, error)
      }
    }

    await photo.delete()

    return response.json({ ok: true })
  }
}
