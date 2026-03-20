import { BaseTransformer } from '@adonisjs/core/transformers'
import type User from '#models/user'
import { resolveAvatarUrl } from '../lib/avatar_url.js'
import RoleTransformer from '#transformers/role_transformer'
import SessionTransformer from '#transformers/session_transformer'

export default class AdminUserTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      githubUsername: this.resource.githubUsername,
      avatarUrl: resolveAvatarUrl(this.resource),
      featured: this.resource.featured,
      isOrganizer: this.resource.isOrganizer,
      isCommunityMember: this.resource.isCommunityMember,
      createdAt: this.resource.createdAt?.toISO() ?? '',
    }
  }

  forAdminIndex() {
    return {
      ...this.toObject(),
      roles: RoleTransformer.transform(this.resource.roles ?? []),
    }
  }

  forAdminEdit() {
    return {
      ...this.toObject(),
      bio: this.resource.bio,
      linkedinUrl: this.resource.linkedinUrl,
      twitterUrl: this.resource.twitterUrl,
      websiteUrl: this.resource.websiteUrl,
      title: this.resource.title,
      roles: RoleTransformer.transform(this.resource.roles ?? []).useVariant('forAdminEdit'),
      permissions: this.resource.$extras.permissions ?? [],
      sessions: SessionTransformer.transform(this.resource.sessions ?? []).useVariant(
        'forSpeakerProfile'
      ),
      rsvps: (this.resource.rsvps ?? [])
        .filter((rsvp) => rsvp.event)
        .map((rsvp) => ({
          id: rsvp.id,
          eventId: rsvp.event.id,
          eventTitle: rsvp.event.title,
          eventDate: rsvp.event.eventDate?.toFormat('dd MMM yyyy') ?? null,
          status: rsvp.status,
        })),
    }
  }
}
