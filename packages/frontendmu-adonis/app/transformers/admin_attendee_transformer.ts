import { BaseTransformer } from '@adonisjs/core/transformers'
import type Rsvp from '#models/rsvp'
import { resolveAvatarUrl } from '../lib/avatar_url.js'

export default class AdminAttendeeTransformer extends BaseTransformer<Rsvp> {
  toObject() {
    const user = this.resource.user

    return {
      rsvpId: this.resource.id,
      status: this.resource.status,
      notes: this.resource.notes,
      rsvpedAt: this.resource.createdAt?.toISO() ?? null,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            githubUsername: user.githubUsername,
            avatarUrl: resolveAvatarUrl(user),
          }
        : null,
    }
  }
}
