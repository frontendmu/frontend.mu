import type { DirectusEvent } from '~/utils/types'
import { isDateInFuture } from '~/utils/helpers'

export function useWebMCPRsvp(options: {
  meetupId: string
  meetupDetails: DirectusEvent
  isLoggedIn: ComputedRef<boolean> | Ref<boolean>
  isAttending: ComputedRef<boolean> | Ref<boolean>
  rsvpOpen: ComputedRef<boolean> | Ref<boolean>
  onRsvp: () => Promise<void>
  onCancel: () => Promise<void>
}) {
  const { registerTool, unregisterTool, isSupported } = useWebMCP()

  function register() {
    if (!isSupported.value) return

    const m = options.meetupDetails
    const isUpcoming = m.Date ? isDateInFuture(new Date(m.Date)) : false

    if (!unref(options.isLoggedIn) || !isUpcoming || !unref(options.rsvpOpen)) return

    if (!unref(options.isAttending)) {
      registerTool({
        name: 'rsvpToMeetup',
        description: `RSVP to attend "${m.title}" on ${m.Date} at ${m.Venue}. This will register you as an attendee.`,
        inputSchema: {
          type: 'object',
          properties: {},
        },
        handler: async () => {
          await options.onRsvp()
          return { success: true, message: `The RSVP form for ${m.title} has been opened. Please complete the form to confirm your attendance.` }
        },
      })
    }

    if (unref(options.isAttending)) {
      registerTool({
        name: 'cancelRSVP',
        description: `Cancel your RSVP for "${m.title}" on ${m.Date}. This will remove you from the attendee list.`,
        inputSchema: {
          type: 'object',
          properties: {},
        },
        handler: async () => {
          await options.onCancel()
          return { success: true, message: `Your RSVP for ${m.title} has been cancelled` }
        },
      })
    }
  }

  function cleanup() {
    unregisterTool('rsvpToMeetup')
    unregisterTool('cancelRSVP')
  }

  return { register, cleanup }
}
