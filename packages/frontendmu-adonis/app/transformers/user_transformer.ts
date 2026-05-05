import { BaseTransformer } from '@adonisjs/core/transformers'
import type User from '#models/user'
import { resolveAvatarUrl } from '../lib/avatar_url.js'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      githubUsername: this.resource.githubUsername,
      avatarUrl: resolveAvatarUrl(this.resource),
      bio: this.resource.bio,
      linkedinUrl: this.resource.linkedinUrl,
      twitterUrl: this.resource.twitterUrl,
      websiteUrl: this.resource.websiteUrl,
      roles: this.resource.roles?.map((role) => ({ id: role.id, name: role.name })) ?? [],
    }
  }

  forProfile() {
    return {
      ...this.toObject(),
      phone: this.resource.phone,
    }
  }

  forSharedAuth() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      avatarUrl: resolveAvatarUrl(this.resource),
      githubUsername: this.resource.githubUsername,
      role: this.resource.role,
    }
  }
}
