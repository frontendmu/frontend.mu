/**
 * Policies collection
 *
 * Export all policies here for use with Bouncer.
 */
export const policies = {
  EventPolicy: () => import('#policies/event_policy'),
  SessionPolicy: () => import('#policies/session_policy'),
}
