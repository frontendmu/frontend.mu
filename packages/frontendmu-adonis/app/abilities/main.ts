import { Bouncer } from '@adonisjs/bouncer'
import { DateTime } from 'luxon'
import User from '#models/user'
import Event from '#models/event'
import Rsvp from '#models/rsvp'
import featureFlags from '#config/feature_flags'

/**
 * Ability to RSVP to an event
 * - User must be authenticated and have create-rsvp permission
 * - Event must be accepting RSVPs
 * - Event must not be in the past (unless FEATURE_RSVP_PAST_EVENTS is enabled)
 * - Event RSVP closing date must not have passed
 */
export const rsvpToEvent = Bouncer.ability(async (user: User, event: Event) => {
  // Check if user has permission to RSVP
  const canRsvp = await user.can('create-rsvp')
  if (!canRsvp) {
    return false
  }

  // Check if event is accepting RSVPs
  if (!event.acceptingRsvp) {
    return false
  }

  // Check if event is in the past (skip if feature flag is enabled)
  if (!featureFlags.rsvpPastEvents && event.isPast) {
    return false
  }

  // Check if RSVP closing date has passed
  if (event.rsvpClosingDate && event.rsvpClosingDate < DateTime.now()) {
    return false
  }

  return true
})

/**
 * Ability to cancel own RSVP
 * - User must be the owner of the RSVP
 * - User must have cancel-rsvp permission
 */
export const cancelRsvp = Bouncer.ability(async (user: User, rsvp: Rsvp) => {
  const canCancel = await user.can('cancel-rsvp')
  return canCancel && user.id === rsvp.userId
})

/**
 * Ability to view RSVPs for an event (for users with view-rsvps permission)
 */
export const viewEventRsvps = Bouncer.ability(async (user: User, _event: Event) => {
  return await user.can('view-rsvps')
})

/**
 * Ability to manage RSVPs (update status, etc.) - for users with manage-rsvps permission
 */
export const manageRsvp = Bouncer.ability(async (user: User, _rsvp: Rsvp) => {
  return await user.can('manage-rsvps')
})
