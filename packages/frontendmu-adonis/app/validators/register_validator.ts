import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(255),
    email: vine.string().email().maxLength(255),
    password: vine.string().minLength(8).maxLength(128),
    confirm_password: vine.string().sameAs('password'),
  })
)
