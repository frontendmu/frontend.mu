import type User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * Policy for SiteSetting authorization
 *
 * Uses the new RBAC permission system.
 * Permissions used: manage-settings
 */
export default class SiteSettingPolicy extends BasePolicy {
  /**
   * Only users with manage-settings permission can view/edit site settings
   */
  async edit(user: User): Promise<AuthorizerResponse> {
    return await user.can('manage-settings')
  }

  /**
   * Only users with manage-settings permission can update site settings
   */
  async update(user: User): Promise<AuthorizerResponse> {
    return await user.can('manage-settings')
  }
}
