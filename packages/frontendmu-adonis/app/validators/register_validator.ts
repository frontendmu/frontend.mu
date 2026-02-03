import vine from '@vinejs/vine'
import type { Infer } from '@adonisjs/core/types'

export const registerValidator = vine.compile({
  name: vine.string().minLength(2),
  email: vine.string().email(),
  password: vine.string().minLength(8),
  confirmPassword: vine.string(),
})

export type RegisterValidator = Infer<typeof registerValidator>
