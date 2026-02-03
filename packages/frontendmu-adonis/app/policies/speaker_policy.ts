import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'

/**
 * Policy for Speaker authorization
 *
 * Uses the new RBAC permission system.
 * Permissions used: view-speakers, create-speaker, edit-speaker, delete-speaker
 */
export default class SpeakerPolicy extends BasePolicy {
  /**
   * Only users with access-admin permission can view the admin speakers list
   */
  async viewAny(user: User): Promise<AuthorizerResponse> {
    return await user.can('access-admin')
  }

  /**
   * Only users with create-speaker permission can create speakers
   */
  async create(user: User): Promise<AuthorizerResponse> {
    return await user.can('create-speaker')
  }

  /**
   * Only users with edit-speaker permission can edit speakers
   */
  async edit(user: User): Promise<AuthorizerResponse> {
    return await user.can('edit-speaker')
  }

  /**
   * Only users with edit-speaker permission can update speakers
   */
  async update(user: User): Promise<AuthorizerResponse> {
    return await user.can('edit-speaker')
  }

  /**
   * Only users with delete-speaker permission can delete speakers
   */
  async delete(user: User): Promise<AuthorizerResponse> {
    return await user.can('delete-speaker')
  }
}
