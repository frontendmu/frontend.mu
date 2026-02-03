import vine from '@vinejs/vine'

/**
 * Validator for creating an event
 */
export const createEventValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    eventDate: vine.string(), // ISO date string, required for new events
    description: vine.string().trim().nullable().optional(),
    location: vine.string().trim().maxLength(255).nullable().optional(),
    venue: vine.string().trim().maxLength(255).nullable().optional(),
    startTime: vine.string().trim().nullable().optional(),
    endTime: vine.string().trim().nullable().optional(),
    seatsAvailable: vine.number().positive().nullable().optional(),
    acceptingRsvp: vine.boolean().optional(),
    rsvpClosingDate: vine.string().nullable().optional(), // ISO date string
    parkingLocation: vine.string().trim().maxLength(500).nullable().optional(),
    mapUrl: vine.string().trim().maxLength(500).nullable().optional(),
    status: vine.enum(['published', 'draft', 'cancelled']).optional(),
  })
)

/**
 * Validator for updating an event
 */
export const updateEventValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().nullable().optional(),
    location: vine.string().trim().maxLength(255).nullable().optional(),
    venue: vine.string().trim().maxLength(255).nullable().optional(),
    startTime: vine.string().trim().nullable().optional(),
    endTime: vine.string().trim().nullable().optional(),
    seatsAvailable: vine.number().positive().nullable().optional(),
    acceptingRsvp: vine.boolean().optional(),
    rsvpClosingDate: vine.string().nullable().optional(), // ISO date string
    parkingLocation: vine.string().trim().maxLength(500).nullable().optional(),
    mapUrl: vine.string().trim().maxLength(500).nullable().optional(),
    status: vine.enum(['published', 'draft', 'cancelled']).optional(),
  })
)
