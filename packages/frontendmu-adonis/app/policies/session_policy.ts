import User from '#models/user'
import Session from '#models/session'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * Policy for Session authorization
 *
 * Uses the new RBAC permission system.
 * Permissions used: create-session, edit-session, delete-session
 */
export default class SessionPolicy extends BasePolicy {
  /**
   * Only users with create-session permission can create sessions
   */
  async create(user: User): Promise<AuthorizerResponse> {
    return await user.can('create-session')
  }

  /**
   * Only users with edit-session permission can edit sessions
   */
  async edit(user: User, _session: Session): Promise<AuthorizerResponse> {
    return await user.can('edit-session')
  }

  /**
   * Only users with edit-session permission can update sessions
   */
  async update(user: User, _session: Session): Promise<AuthorizerResponse> {
    return await user.can('edit-session')
  }

  /**
   * Only users with delete-session permission can delete sessions
   */
  async delete(user: User, _session: Session): Promise<AuthorizerResponse> {
    return await user.can('delete-session')
  }

  /**
   * Only users with edit-session permission can manage sessions (add/remove speakers)
   */
  async manage(user: User, _session: Session): Promise<AuthorizerResponse> {
    return await user.can('edit-session')
  }
}
