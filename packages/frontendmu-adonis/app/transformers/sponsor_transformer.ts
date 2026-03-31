import { BaseTransformer } from '@adonisjs/core/transformers'
import type Sponsor from '#models/sponsor'

export default class SponsorTransformer extends BaseTransformer<Sponsor> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      website: this.resource.website,
      logoUrl: this.resource.logoUrl,
      sponsorTypes: this.resource.sponsorTypes || [],
      logoBg: this.resource.logoBg,
      description: this.resource.description,
      logomarkUrl: this.resource.logomarkUrl,
      status: this.resource.status,
    }
  }

  summary() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      website: this.resource.website,
      logoUrl: this.resource.logoUrl,
      sponsorTypes: this.resource.sponsorTypes || [],
      logoBg: this.resource.logoBg,
      status: this.resource.status,
    }
  }

  forAdminEdit() {
    return {
      ...this.toObject(),
      eventCount: this.resource.events?.length ?? 0,
    }
  }
}
