import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * Policy for User authorization
 *
 * Uses the new RBAC permission system.
 * Permissions used: view-users, edit-user, delete-user, assign-roles
 */
export default class UserPolicy extends BasePolicy {
  /**
   * Only users with view-users permission can view the admin users list
   */
  async viewAny(user: User): Promise<AuthorizerResponse> {
    return await user.can('view-users')
  }

  /**
   * Only users with edit-user permission can edit users
   */
  async edit(user: User): Promise<AuthorizerResponse> {
    return await user.can('edit-user')
  }

  /**
   * Only users with edit-user permission can update users
   */
  async update(user: User): Promise<AuthorizerResponse> {
    return await user.can('edit-user')
  }

  /**
   * Only users with delete-user permission can delete users
   */
  async delete(user: User): Promise<AuthorizerResponse> {
    return await user.can('delete-user')
  }

  /**
   * Only users with assign-roles permission can assign roles to users
   */
  async assignRoles(user: User): Promise<AuthorizerResponse> {
    return await user.can('assign-roles')
  }
}
