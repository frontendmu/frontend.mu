import vine from '@vinejs/vine'

export const sponsorValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    website: vine.string().url().optional(),
    description: vine.string().trim().maxLength(2000).optional(),
    logoUrl: vine.string().optional(),
    logomarkUrl: vine.string().optional(),
    clearLogo: vine.boolean().optional(),
    clearLogomark: vine.boolean().optional(),
    sponsorTypes: vine.array(vine.string()).optional(),
    darkbg: vine.boolean().optional(),
    status: vine.enum(['active', 'inactive']).optional(),
  })
)
