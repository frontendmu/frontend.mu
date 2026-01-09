/**
 * Policies collection
 *
 * Export all policies here for use with Bouncer.
 */
export const policies = {
  EventPolicy: () => import('#policies/event_policy'),
  SessionPolicy: () => import('#policies/session_policy'),
  SpeakerPolicy: () => import('#policies/speaker_policy'),
  SponsorPolicy: () => import('#policies/sponsor_policy'),
  UserPolicy: () => import('#policies/user_policy'),
}
