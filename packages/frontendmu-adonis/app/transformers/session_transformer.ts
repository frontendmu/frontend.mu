import { BaseTransformer } from '@adonisjs/core/transformers'
import type Session from '#models/session'
import type Event from '#models/event'
import type Sponsor from '#models/sponsor'
import type User from '#models/user'
import SpeakerTransformer from '#transformers/speaker_transformer'

export default class SessionTransformer extends BaseTransformer<Session> {
  toObject() {
    const speakers = (
      this.resource.$hasRelated('speakers') ? this.resource.$getRelated('speakers') : []
    ) as User[]

    const sponsor = (
      this.resource.$hasRelated('sponsor') ? this.resource.$getRelated('sponsor') : null
    ) as Sponsor | null

    return {
      id: this.resource.id,
      title: this.resource.title,
      description: this.resource.description,
      order: this.resource.order,
      kind: this.resource.kind,
      sponsorId: this.resource.sponsorId,
      durationMinutes: this.resource.durationMinutes,
      speakers: SpeakerTransformer.transform(speakers).useVariant('summary'),
      sponsor: sponsor
        ? {
            id: sponsor.id,
            name: sponsor.name,
            logoUrl: sponsor.logoUrl,
            logomarkUrl: sponsor.logomarkUrl,
          }
        : null,
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
      eventSlug: event?.slug ?? null,
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
