import { Bouncer } from '@adonisjs/bouncer'
import { DateTime } from 'luxon'
import User from '#models/user'
import Event from '#models/event'
import Rsvp from '#models/rsvp'
import featureFlags from '#config/feature_flags'

/**
 * Ability to RSVP to an event
 * - User must be authenticated
 * - Event must be accepting RSVPs
 * - Event must not be in the past (unless FEATURE_RSVP_PAST_EVENTS is enabled)
 * - Event RSVP closing date must not have passed
 */
export const rsvpToEvent = Bouncer.ability((_user: User, event: Event) => {
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
 */
export const cancelRsvp = Bouncer.ability((user: User, rsvp: Rsvp) => {
  return user.id === rsvp.userId
})

/**
 * Ability to view RSVPs for an event (for organizers/admins)
 */
export const viewEventRsvps = Bouncer.ability((user: User, _event: Event) => {
  return user.hasAppRole('organizer')
})

/**
 * Ability to manage RSVPs (update status, etc.) - for organizers/admins
 */
export const manageRsvp = Bouncer.ability((user: User, _rsvp: Rsvp) => {
  return user.hasAppRole('organizer')
})
