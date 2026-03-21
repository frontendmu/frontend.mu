import { BaseTransformer } from '@adonisjs/core/transformers'
import type Event from '#models/event'
import type EventPhoto from '#models/event_photo'
import type Session from '#models/session'
import type Sponsor from '#models/sponsor'
import SessionTransformer from '#transformers/session_transformer'
import SponsorTransformer from '#transformers/sponsor_transformer'

export default class EventTransformer extends BaseTransformer<Event> {
  toObject() {
    const sessions = (
      this.resource.$hasRelated('sessions') ? this.resource.$getRelated('sessions') : []
    ) as Session[]
    const sponsors = (
      this.resource.$hasRelated('sponsors') ? this.resource.$getRelated('sponsors') : []
    ) as Sponsor[]

    return {
      id: this.resource.id,
      title: this.resource.title,
      description: this.resource.description,
      date: this.resource.eventDate?.toISODate() ?? null,
      startTime: this.resource.startTime,
      venue: this.resource.venue,
      location: this.resource.location,
      attendeeCount: this.resource.attendeeCount,
      acceptingRsvp: this.resource.acceptingRsvp,
      album: this.resource.albumName,
      sessions: SessionTransformer.transform(sessions).depth(2),
      sponsors: SponsorTransformer.transform(sponsors).useVariant('summary'),
    }
  }

  detail() {
    const photos = (
      this.resource.$hasRelated('photos') ? this.resource.$getRelated('photos') : []
    ) as EventPhoto[]

    return {
      ...this.toObject(),
      endTime: this.resource.endTime,
      seatsAvailable: this.resource.seatsAvailable,
      rsvpClosingDate: this.resource.rsvpClosingDate?.toISODate() ?? null,
      rsvpLink: this.resource.rsvpLink,
      coverImageUrl: this.resource.coverImageUrl,
      parkingLocation: this.resource.parkingLocation,
      mapUrl: this.resource.mapUrl,
      status: this.resource.status,
      photos: photos.map((photo) => ({
        id: photo.id,
        photoUrl: photo.photoUrl,
        caption: photo.caption,
      })),
    }
  }

  forAdminIndex() {
    return {
      ...this.toObject(),
      status: this.resource.status,
    }
  }
}
