import env from '#start/env'

/**
 * Feature flags configuration
 *
 * All feature flags are controlled via environment variables.
 * Default values are set to `false` for safety.
 */
const featureFlags = {
  /**
   * Allow users to RSVP to past events.
   * Useful for testing or special circumstances.
   */
  rsvpPastEvents: env.get('FEATURE_RSVP_PAST_EVENTS', false),
}

export default featureFlags
