import type { User } from './types'

export function random(list: string[] | number[]) {
  return list[Math.floor(Math.random() * list.length)]
}

// a function that converts string to safe variable name
// Path: src/utils/helpers.ts
export function toSafeVarName(str: string | number) {
  return str
    .toString()
    .replace(/\W/g, '_')
    .toLowerCase()
}

export function getCookieValue(name: string) {
  return document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || ''
}

export function vTransitionName(modelType: string = 'meetup', str: string | number) {
  return `view-transition-name: ${toSafeVarName(modelType)}-${toSafeVarName(
    str,
  )}`
}

// convert 2023-08-26 ti August 26, 2023
// Path: src/utils/helpers.ts
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Constructs a proper image URL from a base URL and photo path.
 * Handles double slashes and URL encoding for paths with spaces.
 * 
 * @param baseUrl - The base URL (e.g., "https://raw.githubusercontent.com/.../main/")
 * @param photoPath - The photo path (e.g., "timeliner_repo/processed/data/2025 September Selected/photo.webp")
 * @returns The properly formatted image URL
 */
export function getImageUrl(baseUrl: string, photoPath: string): string {
  // Remove trailing slash from base URL if present
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  // Remove leading slash from photo path if present
  const cleanPath = photoPath.replace(/^\//, '')
  // URL encode each segment of the path to handle spaces
  const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/')
  return `${cleanBaseUrl}/${encodedPath}`
}

export function mapToValidUser(user: any): User {
  const full_name = user?.full_name
    ? user.full_name
    : `${user.first_name} ${user.last_name ?? ''}`.trim()

  return {
    id: user.id,
    full_name,
    email: user.email,
    current_occupation: user?.current_occupation || '',
    meal: user?.meal || '',
    transport: user.transport || '',
    phone: user.phone || '',
    occupation: user.occupation || '',
    created_at: user?.created_at || '',
    github_username: user?.github_username || '',
    avatar_url: user.avatar_url,
    profile_picture: user.profile_picture || '',
    google: user.google,
    role: user.role.name,
    provider: user.provider,
    external_identifier: user.external_identifier,
  }
}

export function DIRECTUS_URL() {
  return 'https://directus.coders.mu'
  // return process.env.NODE_ENV === 'production'
  //   ? 'https://directus.coders.mu'
  //   : 'http://localhost:8055'
}

// Converts time from 12-hour AM/PM format to 24-hour format.
export function convertTo24HourFormat(timeStr: string) {
  const [time, period] = timeStr.match(/(\d+)(AM|PM)/i)!.slice(1)
  let [hours] = time.split(':').map(Number)
  if (period.toUpperCase() === 'PM' && hours < 12) {
    hours += 12
  }
  else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0
  }
  return `${hours.toString().padStart(2, '0')}:00`
}

export function base64Url(base64String: string): string {
  return `data:image/png;base64,${base64String}`
}

export function findObjectByValue(value: string, obj: any[]) {
  return obj.filter(item => item.value === value)[0]
}

export function isFalsy(value: any): boolean {
  return value === 'false' || value === '0' || value === null || value === 'undefined' || value === ''
}

export function getGithubUrl(username?: string) {
  const speaker_photo = username
    ? `https://github.com/${username}.png`
    : 'https://github.com/Github.png'

  return speaker_photo
}

/**
 * Returns the timestamp in milliseconds for the given date at midnight.
 * @param {Date} date - The date to convert
 * @returns {number} Timestamp in milliseconds
 */
function dateAtMidnightInMs(date: Date) {
  const clonedDate = new Date(date)

  clonedDate.setHours(0, 0, 0, 0)

  return clonedDate.getTime()
}

/**
 * Checks if the given date is in the future relative to the reference date.
 * @param {Date} date - The date to check
 * @param {Date} now - The reference date (defaults to the current date)
 * @returns {boolean} True if the date is in the future, false otherwise
 */
export function isDateInFuture(date: Date, now: Date = new Date()) {
  return dateAtMidnightInMs(date) > dateAtMidnightInMs(now)
}

/**
 * Checks if the given date is in the past relative to the reference date.
 * @param {Date} date - The date to check
 * @param {Date} now - The reference date (defaults to the current date)
 * @returns {boolean} True if the date is in the past, false otherwise
 */
export function isDateInPast(date: Date, now: Date = new Date()) {
  return dateAtMidnightInMs(date) < dateAtMidnightInMs(now)
}

/**
 * Checks if the given date is the same as the reference date.
 * @param {Date} date - The date to check
 * @param {Date} now - The reference date (defaults to the current date)
 * @returns {boolean} True if the date is the same as the reference date, false otherwise
 */
export function isDateToday(date: Date, now: Date = new Date()) {
  return dateAtMidnightInMs(date) === dateAtMidnightInMs(now)
}
