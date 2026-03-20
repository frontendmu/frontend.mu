import { BaseTransformer } from '@adonisjs/core/transformers'
import type Event from '#models/event'
import SessionTransformer from '#transformers/session_transformer'
import SponsorTransformer from '#transformers/sponsor_transformer'

export default class EventTransformer extends BaseTransformer<Event> {
  toObject() {
    return {
      id: this.resource.id,
      title: this.resource.title,
      description: this.resource.description,
      date: this.resource.eventDate?.toISO() ?? null,
      startTime: this.resource.startTime,
      venue: this.resource.venue,
      location: this.resource.location,
      attendeeCount: this.resource.attendeeCount,
      acceptingRsvp: this.resource.acceptingRsvp,
      album: this.resource.albumName,
      sessions: SessionTransformer.transform(this.resource.sessions ?? []),
      sponsors: SponsorTransformer.transform(this.resource.sponsors ?? []).useVariant('summary'),
    }
  }

  detail() {
    return {
      ...this.toObject(),
      endTime: this.resource.endTime,
      seatsAvailable: this.resource.seatsAvailable,
      rsvpClosingDate: this.resource.rsvpClosingDate?.toISO() ?? null,
      rsvpLink: this.resource.rsvpLink,
      coverImageUrl: this.resource.coverImageUrl,
      parkingLocation: this.resource.parkingLocation,
      mapUrl: this.resource.mapUrl,
      status: this.resource.status,
      photos:
        this.resource.photos?.map((photo) => ({
          id: photo.id,
          photoUrl: photo.photoUrl,
          caption: photo.caption,
        })) ?? [],
    }
  }

  forAdminIndex() {
    return {
      ...this.toObject(),
      status: this.resource.status,
    }
  }
}
