import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * Policy for Sponsor authorization
 *
 * Uses the new RBAC permission system.
 * Permissions used: view-sponsors, create-sponsor, edit-sponsor, delete-sponsor
 */
export default class SponsorPolicy extends BasePolicy {
  /**
   * Only users with access-admin permission can view the admin sponsors list
   */
  async viewAny(user: User): Promise<AuthorizerResponse> {
    return await user.can('access-admin')
  }

  /**
   * Only users with create-sponsor permission can create sponsors
   */
  async create(user: User): Promise<AuthorizerResponse> {
    return await user.can('create-sponsor')
  }

  /**
   * Only users with edit-sponsor permission can edit sponsors
   */
  async edit(user: User): Promise<AuthorizerResponse> {
    return await user.can('edit-sponsor')
  }

  /**
   * Only users with edit-sponsor permission can update sponsors
   */
  async update(user: User): Promise<AuthorizerResponse> {
    return await user.can('edit-sponsor')
  }

  /**
   * Only users with delete-sponsor permission can delete sponsors
   */
  async delete(user: User): Promise<AuthorizerResponse> {
    return await user.can('delete-sponsor')
  }
}
