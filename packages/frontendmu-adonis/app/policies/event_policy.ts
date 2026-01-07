import User from '#models/user'
import Event from '#models/event'
import { BasePolicy, allowGuest } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * Policy for Event authorization
 *
 * Only organizers and superadmins can manage events.
 */
export default class EventPolicy extends BasePolicy {
  /**
   * Anyone can view published events
   */
  @allowGuest()
  view(_user: User | null, event: Event): AuthorizerResponse {
    return event.status === 'published'
  }

  /**
   * Only organizers and superadmins can view the admin events list
   */
  viewAny(user: User): AuthorizerResponse {
    return user.hasAppRole('organizer')
  }

  /**
   * Only organizers and superadmins can create events
   */
  create(user: User): AuthorizerResponse {
    return user.hasAppRole('organizer')
  }

  /**
   * Only organizers and superadmins can edit events
   */
  edit(user: User, _event: Event): AuthorizerResponse {
    return user.hasAppRole('organizer')
  }

  /**
   * Only organizers and superadmins can update events
   */
  update(user: User, _event: Event): AuthorizerResponse {
    return user.hasAppRole('organizer')
  }

  /**
   * Only superadmins can delete events
   */
  delete(user: User, _event: Event): AuthorizerResponse {
    return user.hasAppRole('superadmin')
  }

  /**
   * Only organizers and superadmins can view the admin/edit page
   */
  manage(user: User, _event: Event): AuthorizerResponse {
    return user.hasAppRole('organizer')
  }
}
