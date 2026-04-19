import { BaseTransformer } from '@adonisjs/core/transformers'
import type Event from '#models/event'
import type EventPhoto from '#models/event_photo'
import type Session from '#models/session'
import type Sponsor from '#models/sponsor'
import type User from '#models/user'
import SessionTransformer from '#transformers/session_transformer'
import SpeakerTransformer from '#transformers/speaker_transformer'
import SponsorTransformer from '#transformers/sponsor_transformer'

// Kinds whose attached users are the actual event speakers. Intro/quiz hosts
// and sponsored-segment reps don't belong in the canonical speakers list.
const SPEAKER_SESSION_KINDS = new Set(['talk', 'other'])

function thumbnailFor(url: string, width: number): string {
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp`
}

export default class EventTransformer extends BaseTransformer<Event> {
  toObject() {
    const sessions = (
      this.resource.$hasRelated('sessions') ? this.resource.$getRelated('sessions') : []
    ) as Session[]
    const sponsors = (
      this.resource.$hasRelated('sponsors') ? this.resource.$getRelated('sponsors') : []
    ) as Sponsor[]
    const photos = (
      this.resource.$hasRelated('photos') ? this.resource.$getRelated('photos') : []
    ) as EventPhoto[]

    const seen = new Set<string>()
    const speakers: User[] = []
    for (const session of sessions) {
      if (!SPEAKER_SESSION_KINDS.has(session.kind)) continue
      if (!session.$hasRelated('speakers')) continue
      for (const speaker of session.$getRelated('speakers') as User[]) {
        if (seen.has(speaker.id)) continue
        seen.add(speaker.id)
        speakers.push(speaker)
      }
    }

    const coverPhoto = photos[0] ?? null

    return {
      id: this.resource.id,
      slug: this.resource.slug,
      title: this.resource.title,
      description: this.resource.description,
      date: this.resource.eventDate?.toISODate() ?? null,
      startTime: this.resource.startTime,
      venue: this.resource.venue,
      location: this.resource.location,
      attendeeCount: this.resource.attendeeCount,
      acceptingRsvp: this.resource.acceptingRsvp,
      status: this.resource.status,
      album: this.resource.albumName,
      coverThumbnailUrl: coverPhoto ? thumbnailFor(coverPhoto.photoUrl, 600) : null,
      updatedAt: this.resource.updatedAt?.toISO() ?? null,
      sessions: SessionTransformer.transform(sessions).depth(2),
      speakers: SpeakerTransformer.transform(speakers).useVariant('summary'),
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
      photos: photos.map((photo) => ({
        id: photo.id,
        photoUrl: photo.photoUrl,
        thumbnailUrl: thumbnailFor(photo.photoUrl, 800),
        caption: photo.caption,
      })),
    }
  }

  forAdminIndex() {
    return this.toObject()
  }
}
