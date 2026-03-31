import { BaseTransformer } from '@adonisjs/core/transformers'
import type User from '#models/user'
import { resolveAvatarUrl } from '../lib/avatar_url.js'

export default class SpeakerTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      githubUsername: this.resource.githubUsername,
      avatarUrl: resolveAvatarUrl(this.resource),
      featured: this.resource.featured,
      bio: this.resource.bio,
      linkedinUrl: this.resource.linkedinUrl,
      twitterUrl: this.resource.twitterUrl,
      websiteUrl: this.resource.websiteUrl,
    }
  }

  summary() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      githubUsername: this.resource.githubUsername,
      avatarUrl: resolveAvatarUrl(this.resource),
      featured: this.resource.featured,
    }
  }

  forAdminIndex() {
    return {
      ...this.toObject(),
      email: this.resource.email,
      sessionCount: this.resource.sessions?.length ?? 0,
    }
  }

  forAssignment() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      avatarUrl: resolveAvatarUrl(this.resource),
      githubUsername: this.resource.githubUsername,
    }
  }
}
