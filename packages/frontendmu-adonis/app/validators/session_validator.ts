import vine from '@vinejs/vine'
import { SESSION_KINDS } from '#models/session'

const kindRule = vine.enum([...SESSION_KINDS])

/**
 * Validator for creating a session
 */
export const createSessionValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().nullable().optional(),
    order: vine.number().positive().nullable().optional(),
    kind: kindRule.optional(),
    sponsorId: vine.string().uuid().nullable().optional(),
    durationMinutes: vine.number().positive().max(1440).nullable().optional(),
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
    kind: kindRule.optional(),
    sponsorId: vine.string().uuid().nullable().optional(),
    durationMinutes: vine.number().positive().max(1440).nullable().optional(),
    speakerIds: vine.array(vine.string().uuid()).optional(),
  })
)
