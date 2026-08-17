import vine from '@vinejs/vine'

export const updateSiteSettingValidator = vine.compile(
  vine.object({
    calendarFeedEnabled: vine.boolean(),
    calendarAutoIncludeNewEvents: vine.boolean(),
    calendarIncludePastEvents: vine.boolean(),
  })
)
