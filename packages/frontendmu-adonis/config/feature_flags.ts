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
  /**
   * Allow new users to register with email + password.
   * Disabled in production to prevent spam signups; Google OAuth
   * is the only public sign-up path. Email/password login still
   * works for existing accounts (super admins, local dev).
   */
  registrationEnabled: env.get('ENABLE_REGISTRATION', false),
}

export default featureFlags
