import vine from '@vinejs/vine'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
const MAX_BYTES = 10 * 1024 * 1024

export const presignUploadValidator = vine.compile(
  vine.object({
    kind: vine.enum(['event-photo'] as const),
    eventId: vine.string().uuid(),
    contentType: vine.enum(ALLOWED_MIME_TYPES),
    contentLength: vine.number().positive().max(MAX_BYTES),
  })
)

export const createEventPhotoValidator = vine.compile(
  vine.object({
    key: vine.string().trim().minLength(1).maxLength(512),
    caption: vine.string().trim().maxLength(500).nullable().optional(),
    order: vine.number().min(0).nullable().optional(),
  })
)

// Caption is the only field this endpoint owns. Order is set by the dedicated
// /reorder endpoint so we can shift sibling rows atomically instead of letting
// a single PATCH leave the event with duplicate positions.
export const updateEventPhotoValidator = vine.compile(
  vine.object({
    caption: vine.string().trim().maxLength(500).nullable().optional(),
  })
)

export const reorderEventPhotosValidator = vine.compile(
  vine.object({
    photoIds: vine.array(vine.string().uuid()).minLength(1),
  })
)
