// Re-export DTO types from backend
export type {
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
} from '../../app/dtos/index.js'

// UI-only types

export interface BrandingAsset {
  name: string
  description: string
  filename: string
  versions: string[]
}

export type Meal = 'veg' | 'non_veg' | 'no_food'

export type Transport = 'bus' | 'car' | 'need_a_ride' | 'other'

export type Occupation =
  | 'developer'
  | 'student'
  | 'manager'
  | 'designer'
  | 'hr'
  | 'entrepreneur'
  | 'other'

export interface RSVPMetaData {
  meal: Meal
  transport: Transport
  occupation: Occupation
  is_public: boolean
  meta?: string
  name: string | null | undefined
  profile_picture: string | null | undefined
}

export type ToastTypes = 'SUCCESS' | 'WARNING' | 'INFO' | 'ERROR'

export interface SiteToast {
  title?: string
  message?: string
  type: ToastTypes | undefined
  visible: boolean
}

// Menu types
export interface TMenuItem {
  title: string
  href: string
  class?: string
  children?: TMenuItem[]
  target?: string
  rel?: string
}

export interface TMenu {
  [key: string]: TMenuItem
}
