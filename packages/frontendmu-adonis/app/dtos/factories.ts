import type Event from '#models/event'
import type User from '#models/user'
import type Session from '#models/session'
import type Sponsor from '#models/sponsor'
import type Rsvp from '#models/rsvp'
import type {
  EventSummaryDto,
  EventDto,
  SessionDto,
  SpeakerSummaryDto,
  SpeakerDto,
  SpeakerSessionDto,
  AdminSpeakerDto,
  UserProfileDto,
  SponsorSummaryDto,
  SponsorDto,
  RsvpDto,
  PublicAttendeeDto,
} from './index.js'

export function resolveAvatarUrl(user: {
  avatarUrl: string | null
  githubUsername: string | null
}): string | null {
  return (
    user.avatarUrl ||
    (user.githubUsername
      ? `https://avatars.githubusercontent.com/${user.githubUsername}`
      : null)
  )
}

export function toSpeakerSummary(user: User): SpeakerSummaryDto {
  return {
    id: user.id,
    name: user.name,
    githubUsername: user.githubUsername,
    avatarUrl: resolveAvatarUrl(user),
    featured: user.featured,
  }
}

export function toSpeaker(user: User): SpeakerDto {
  return {
    ...toSpeakerSummary(user),
    bio: user.bio,
    linkedinUrl: user.linkedinUrl,
    twitterUrl: user.twitterUrl,
    websiteUrl: user.websiteUrl,
  }
}

export function toAdminSpeaker(user: User): AdminSpeakerDto {
  return {
    ...toSpeaker(user),
    email: user.email,
    sessionCount: user.sessions?.length || 0,
  }
}

export function toSession(session: Session): SessionDto {
  return {
    id: session.id,
    title: session.title,
    description: session.description,
    speakers: session.speakers?.map(toSpeakerSummary) || [],
  }
}

export function toSpeakerSession(session: Session): SpeakerSessionDto {
  return {
    id: session.id,
    title: session.title,
    eventId: session.event?.id ?? null,
    eventTitle: session.event?.title ?? null,
    eventDate: session.event?.eventDate?.toFormat('dd MMM yyyy') ?? null,
  }
}

export function toEventSummary(event: Event): EventSummaryDto {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.eventDate?.toISO() ?? null,
    startTime: event.startTime,
    venue: event.venue,
    location: event.location,
    attendeeCount: event.attendeeCount,
    acceptingRsvp: event.acceptingRsvp,
    album: event.albumName,
    sessions: event.sessions?.map(toSession) || [],
    sponsors: event.sponsors?.map(toSponsorSummary) || [],
  }
}

export function toEvent(event: Event): EventDto {
  return {
    ...toEventSummary(event),
    endTime: event.endTime,
    seatsAvailable: event.seatsAvailable,
    rsvpClosingDate: event.rsvpClosingDate?.toISO() ?? null,
    rsvpLink: event.rsvpLink,
    coverImageUrl: event.coverImageUrl,
    parkingLocation: event.parkingLocation,
    mapUrl: event.mapUrl,
    status: event.status,
    photos:
      event.photos?.map((p) => ({
        id: p.id,
        photoUrl: p.photoUrl,
        caption: p.caption,
      })) || [],
  }
}

export function toSponsorSummary(sponsor: Sponsor): SponsorSummaryDto {
  return {
    id: sponsor.id,
    name: sponsor.name,
    website: sponsor.website,
    logoUrl: sponsor.logoUrl,
    sponsorTypes: sponsor.sponsorTypes || [],
  }
}

export function toSponsor(sponsor: Sponsor): SponsorDto {
  return {
    ...toSponsorSummary(sponsor),
    description: sponsor.description,
    logomarkUrl: sponsor.logomarkUrl,
    darkbg: sponsor.darkbg,
    status: sponsor.status,
  }
}

export function toRsvp(rsvp: Rsvp): RsvpDto {
  return {
    id: rsvp.id,
    status: rsvp.status,
    notes: rsvp.notes,
    createdAt: rsvp.createdAt?.toISO() ?? '',
  }
}

export function toPublicAttendee(
  user: User,
  displayName: string
): PublicAttendeeDto {
  return {
    id: user.id,
    name: displayName,
    avatarUrl: resolveAvatarUrl(user),
    githubUsername: user.githubUsername,
  }
}

export function toUserProfile(user: User): UserProfileDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    githubUsername: user.githubUsername,
    avatarUrl: resolveAvatarUrl(user),
    bio: user.bio,
    linkedinUrl: user.linkedinUrl,
    twitterUrl: user.twitterUrl,
    websiteUrl: user.websiteUrl,
    roles: user.roles?.map((r) => ({ id: r.id, name: r.name })) || [],
  }
}
