import { BaseTransformer } from '@adonisjs/core/transformers'
import type Session from '#models/session'
import type Event from '#models/event'
import type User from '#models/user'
import SpeakerTransformer from '#transformers/speaker_transformer'

export default class SessionTransformer extends BaseTransformer<Session> {
  toObject() {
    const speakers = (
      this.resource.$hasRelated('speakers') ? this.resource.$getRelated('speakers') : []
    ) as User[]

    return {
      id: this.resource.id,
      title: this.resource.title,
      description: this.resource.description,
      order: this.resource.order,
      speakers: SpeakerTransformer.transform(speakers).useVariant('summary'),
    }
  }

  forSpeakerProfile() {
    const event = (
      this.resource.$hasRelated('event') ? this.resource.$getRelated('event') : null
    ) as Event | null

    return {
      id: this.resource.id,
      title: this.resource.title,
      eventId: event?.id ?? null,
      eventTitle: event?.title ?? null,
      eventDate: event?.eventDate?.toFormat('dd MMM yyyy') ?? null,
    }
  }

  forAdminDetail() {
    const event = (
      this.resource.$hasRelated('event') ? this.resource.$getRelated('event') : null
    ) as Event | null

    return {
      ...this.toObject(),
      eventId: event?.id ?? null,
      eventTitle: event?.title ?? null,
      eventDate: event?.eventDate?.toFormat('dd MMM yyyy') ?? null,
    }
  }
}
