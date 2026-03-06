import vine from '@vinejs/vine'

/**
 * Validator for creating a session
 */
export const createSessionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().nullable().optional(),
    order: vine.number().positive().nullable().optional(),
    speakerIds: vine.array(vine.string().uuid()).optional(),
  })
)

/**
 * Validator for updating a session
 */
export const updateSessionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().nullable().optional(),
    order: vine.number().positive().nullable().optional(),
    speakerIds: vine.array(vine.string().uuid()).optional(),
  })
)
