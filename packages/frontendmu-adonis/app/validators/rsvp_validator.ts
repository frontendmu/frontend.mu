import vine from '@vinejs/vine'

const phoneRule = vine
  .string()
  .trim()
  .minLength(7)
  .maxLength(20)
  .regex(/^\+?[0-9 \-()]+$/)
  .regex(/[0-9].*[0-9].*[0-9].*[0-9].*[0-9]/)

export const createRsvpValidator = vine.compile(
  vine.object({
    phone: phoneRule.optional(),
  })
)
