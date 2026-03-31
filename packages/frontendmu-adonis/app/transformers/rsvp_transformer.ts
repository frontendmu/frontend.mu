import { BaseTransformer } from '@adonisjs/core/transformers'
import type Rsvp from '#models/rsvp'

export default class RsvpTransformer extends BaseTransformer<Rsvp> {
  toObject() {
    return {
      id: this.resource.id,
      status: this.resource.status,
      notes: this.resource.notes,
      createdAt: this.resource.createdAt?.toISO() ?? '',
    }
  }
}
