export interface EventSummaryDto {
  id: string
  title: string
  description: string | null
  date: string | null
  startTime: string | null
  venue: string | null
  location: string | null
  attendeeCount: number
  acceptingRsvp: boolean
  album: string | null
  sessions: SessionDto[]
  sponsors: SponsorSummaryDto[]
}

export interface EventDto extends EventSummaryDto {
  endTime: string | null
  seatsAvailable: number | null
  rsvpClosingDate: string | null
  rsvpLink: string | null
  coverImageUrl: string | null
  parkingLocation: string | null
  mapUrl: string | null
  status: string
  photos: { id: string; photoUrl: string; caption: string | null }[]
}

export interface SessionDto {
  id: string
  title: string
  description: string | null
  speakers: SpeakerSummaryDto[]
}

export interface SpeakerSummaryDto {
  id: string
  name: string
  githubUsername: string | null
  avatarUrl: string | null
  featured: boolean
}

export interface SpeakerDto extends SpeakerSummaryDto {
  bio: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  websiteUrl: string | null
}

export interface SpeakerSessionDto {
  id: string
  title: string
  eventId: string | null
  eventTitle: string | null
  eventDate: string | null
}

export interface AdminSpeakerDto extends SpeakerDto {
  email: string | null
  sessionCount: number
}

export interface UserProfileDto {
  id: string
  name: string
  email: string | null
  githubUsername: string | null
  avatarUrl: string | null
  bio: string | null
  linkedinUrl: string | null
  twitterUrl: string | null
  websiteUrl: string | null
  roles: { id: number; name: string }[]
}

export interface SponsorSummaryDto {
  id: string
  name: string
  website: string | null
  logoUrl: string | null
  sponsorTypes: string[]
}

export interface SponsorDto extends SponsorSummaryDto {
  description: string | null
  logomarkUrl: string | null
  darkbg: boolean
  status: string
}

export interface RsvpDto {
  id: string
  status: string
  notes: string | null
  createdAt: string
}

export interface PublicAttendeeDto {
  id: string
  name: string
  avatarUrl: string | null
  githubUsername: string | null
}
