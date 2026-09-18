import { DateTime } from 'luxon'

const EVENT_ZONE = 'Indian/Mauritius'
const DEFAULT_DURATION_HOURS = 3

export interface CalendarEventInput {
  id: string
  title: string
  date: string
  startTime?: string | null
  endTime?: string | null
  location?: string | null
  description?: string | null
  url?: string | null
}

export interface CalendarEvent {
  id: string
  title: string
  location: string
  description: string
  allDay: boolean
  start: DateTime
  end: DateTime
}

function parseTime(value: string | null | undefined) {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})/)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null
  return { hour, minute }
}

export function buildCalendarEvent(input: CalendarEventInput): CalendarEvent | null {
  const day = DateTime.fromISO(input.date, { zone: EVENT_ZONE }).startOf('day')
  if (!day.isValid) return null

  const description = [input.description, input.url].filter(Boolean).join('\n\n')
  const base = {
    id: input.id,
    title: input.title,
    location: input.location ?? '',
    description,
  }

  const startTime = parseTime(input.startTime)
  if (!startTime) {
    return { ...base, allDay: true, start: day, end: day.plus({ days: 1 }) }
  }

  const start = day.set(startTime)
  const endTime = parseTime(input.endTime)
  let end = endTime ? day.set(endTime) : null
  if (!end || end <= start) end = start.plus({ hours: DEFAULT_DURATION_HOURS })

  return { ...base, allDay: false, start, end }
}

const utcStamp = (dt: DateTime) => dt.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")
const dateStamp = (dt: DateTime) => dt.toFormat('yyyyMMdd')

export function googleCalendarUrl(event: CalendarEvent) {
  const dates = event.allDay
    ? `${dateStamp(event.start)}/${dateStamp(event.end)}`
    : `${utcStamp(event.start)}/${utcStamp(event.end)}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates,
    details: event.description,
    location: event.location,
    ctz: EVENT_ZONE,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

function outlookUrl(host: string, event: CalendarEvent) {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    location: event.location,
    allday: String(event.allDay),
    startdt: event.allDay
      ? event.start.toISODate()!
      : event.start.toUTC().toISO({ suppressMilliseconds: true })!,
    enddt: event.allDay
      ? event.end.toISODate()!
      : event.end.toUTC().toISO({ suppressMilliseconds: true })!,
  })
  return `https://${host}/calendar/0/action/compose?${params}`
}

export const outlookComUrl = (event: CalendarEvent) => outlookUrl('outlook.live.com', event)
export const office365Url = (event: CalendarEvent) => outlookUrl('outlook.office.com', event)

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function foldIcsLine(line: string) {
  const encoder = new TextEncoder()
  const parts: string[] = []
  let current = ''
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74
    if (encoder.encode(current + char).length > limit) {
      parts.push(current)
      current = char
    } else {
      current += char
    }
  }
  parts.push(current)
  return parts.join('\r\n ')
}

export function icsContent(event: CalendarEvent) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//frontend.mu//Meetups//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@frontend.mu`,
    `DTSTAMP:${utcStamp(DateTime.utc())}`,
    event.allDay
      ? `DTSTART;VALUE=DATE:${dateStamp(event.start)}`
      : `DTSTART:${utcStamp(event.start)}`,
    event.allDay ? `DTEND;VALUE=DATE:${dateStamp(event.end)}` : `DTEND:${utcStamp(event.end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    event.location && `LOCATION:${escapeIcsText(event.location)}`,
    event.description && `DESCRIPTION:${escapeIcsText(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean) as string[]
  return lines.map(foldIcsLine).join('\r\n') + '\r\n'
}

export function downloadIcs(event: CalendarEvent, filename: string) {
  const blob = new Blob([icsContent(event)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
