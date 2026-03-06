import vine from '@vinejs/vine'

export const speakerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    email: vine.string().email().optional(),
    githubUsername: vine.string().trim().maxLength(100).optional(),
    bio: vine.string().trim().maxLength(2000).optional(),
    linkedinUrl: vine.string().url().optional(),
    twitterUrl: vine.string().url().optional(),
    websiteUrl: vine.string().url().optional(),
    featured: vine.boolean().optional(),
  })
)
