import { BaseTransformer } from '@adonisjs/core/transformers'
import type Session from '#models/session'
import SpeakerTransformer from '#transformers/speaker_transformer'

export default class SessionTransformer extends BaseTransformer<Session> {
  toObject() {
    return {
      id: this.resource.id,
      title: this.resource.title,
      description: this.resource.description,
      order: this.resource.order,
      speakers: SpeakerTransformer.transform(this.resource.speakers ?? []).useVariant('summary'),
    }
  }

  forSpeakerProfile() {
    return {
      id: this.resource.id,
      title: this.resource.title,
      eventId: this.resource.event?.id ?? null,
      eventTitle: this.resource.event?.title ?? null,
      eventDate: this.resource.event?.eventDate?.toFormat('dd MMM yyyy') ?? null,
    }
  }

  forAdminDetail() {
    return {
      ...this.toObject(),
      eventId: this.resource.event?.id ?? null,
      eventTitle: this.resource.event?.title ?? null,
      eventDate: this.resource.event?.eventDate?.toFormat('dd MMM yyyy') ?? null,
    }
  }
}
