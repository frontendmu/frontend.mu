import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    githubUsername: vine.string().trim().maxLength(100).optional(),
    bio: vine.string().trim().maxLength(2000).optional(),
    linkedinUrl: vine.string().url().maxLength(500).optional(),
    twitterUrl: vine.string().url().maxLength(500).optional(),
    websiteUrl: vine.string().url().maxLength(500).optional(),
  })
)
