import { BaseTransformer } from '@adonisjs/core/transformers'
import type User from '#models/user'
import { resolveAvatarUrl } from '../lib/avatar_url.js'

export default class PublicAttendeeTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.$extras.displayName ?? this.resource.name,
      avatarUrl: resolveAvatarUrl(this.resource),
      githubUsername: this.resource.githubUsername,
    }
  }
}
