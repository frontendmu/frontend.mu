import User from '#models/user'
import Session from '#models/session'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * Policy for Session authorization
 *
 * Sessions inherit event authorization - only organizers and superadmins can manage sessions.
 */
export default class SessionPolicy extends BasePolicy {
  /**
   * Only organizers and superadmins can create sessions
   */
  create(user: User): AuthorizerResponse {
    return user.hasAppRole('organizer')
  }

  /**
   * Only organizers and superadmins can edit sessions
   */
  edit(user: User, _session: Session): AuthorizerResponse {
    return user.hasAppRole('organizer')
  }

  /**
   * Only organizers and superadmins can update sessions
   */
  update(user: User, _session: Session): AuthorizerResponse {
    return user.hasAppRole('organizer')
  }

  /**
   * Only organizers and superadmins can delete sessions
   */
  delete(user: User, _session: Session): AuthorizerResponse {
    return user.hasAppRole('organizer')
  }

  /**
   * Only organizers and superadmins can manage sessions (add/remove speakers)
   */
  manage(user: User, _session: Session): AuthorizerResponse {
    return user.hasAppRole('organizer')
  }
}
