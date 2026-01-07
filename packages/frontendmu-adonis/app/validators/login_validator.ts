import vine from '@vinejs/vine'
import type { Infer } from '@adonisjs/core/types'

export const loginValidator = vine.compile({
  email: vine.string().email(),
  password: vine.string(),
})

export type LoginValidator = Infer<typeof loginValidator>
