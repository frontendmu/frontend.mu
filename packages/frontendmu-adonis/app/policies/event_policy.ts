import User from '#models/user'
import Event from '#models/event'
import { BasePolicy, allowGuest } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * Policy for Event authorization
 *
 * Uses the new RBAC permission system.
 * Permissions used: view-events, create-event, edit-event, delete-event, publish-event
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
   * Only users with access-admin permission can view the admin events list
   */
  async viewAny(user: User): Promise<AuthorizerResponse> {
    return await user.can('access-admin')
  }

  /**
   * Only users with create-event permission can create events
   */
  async create(user: User): Promise<AuthorizerResponse> {
    return await user.can('create-event')
  }

  /**
   * Only users with edit-event permission can edit events
   */
  async edit(user: User, _event: Event): Promise<AuthorizerResponse> {
    return await user.can('edit-event')
  }

  /**
   * Only users with edit-event permission can update events
   */
  async update(user: User, _event: Event): Promise<AuthorizerResponse> {
    return await user.can('edit-event')
  }

  /**
   * Only users with delete-event permission can delete events
   */
  async delete(user: User, _event: Event): Promise<AuthorizerResponse> {
    return await user.can('delete-event')
  }

  /**
   * Only users with edit-event permission can manage events
   */
  async manage(user: User, _event: Event): Promise<AuthorizerResponse> {
    return await user.can('edit-event')
  }
}
