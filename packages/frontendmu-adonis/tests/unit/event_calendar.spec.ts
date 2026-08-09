import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Event from '#models/event'
import SiteSetting from '#models/site_setting'

function makeEvent(overrides: Partial<Event> = {}): Event {
  const event = new Event()
  event.status = 'published'
  event.eventDate = DateTime.now().plus({ days: 7 })
  event.includeInCalendar = null
  Object.assign(event, overrides)
  return event
}

function makeSettings(overrides: Partial<SiteSetting> = {}): SiteSetting {
  const settings = new SiteSetting()
  settings.calendarFeedEnabled = true
  settings.calendarAutoIncludeNewEvents = true
  settings.calendarIncludePastEvents = false
  Object.assign(settings, overrides)
  return settings
}

test.group('Event#shouldAppearInCalendar', () => {
  test('excludes everything when the feed is disabled, even with an explicit override', ({
    assert,
  }) => {
    const settings = makeSettings({ calendarFeedEnabled: false })
    const event = makeEvent({ includeInCalendar: true })
    assert.isFalse(event.shouldAppearInCalendar(settings))
  })

  test('explicit "show" override wins even for a draft/past/cancelled event', ({ assert }) => {
    const settings = makeSettings()
    const event = makeEvent({
      status: 'draft',
      eventDate: DateTime.now().minus({ days: 30 }),
      includeInCalendar: true,
    })
    assert.isTrue(event.shouldAppearInCalendar(settings))
  })

  test('explicit "hide" override wins even for an eligible upcoming published event', ({
    assert,
  }) => {
    const settings = makeSettings()
    const event = makeEvent({ includeInCalendar: false })
    assert.isFalse(event.shouldAppearInCalendar(settings))
  })

  test('defers to settings.calendarAutoIncludeNewEvents when no override is set', ({ assert }) => {
    const event = makeEvent()
    assert.isTrue(
      event.shouldAppearInCalendar(makeSettings({ calendarAutoIncludeNewEvents: true }))
    )
    assert.isFalse(
      event.shouldAppearInCalendar(makeSettings({ calendarAutoIncludeNewEvents: false }))
    )
  })

  test('excludes draft events, which are not public', ({ assert }) => {
    const event = makeEvent({ status: 'draft' })
    assert.isFalse(event.shouldAppearInCalendar(makeSettings()))
  })

  test('includes cancelled events, which the feed carries as STATUS:CANCELLED', ({ assert }) => {
    const event = makeEvent({ status: 'cancelled' })
    assert.isTrue(event.shouldAppearInCalendar(makeSettings()))
  })

  test('excludes past events unless calendarIncludePastEvents is true', ({ assert }) => {
    const event = makeEvent({ eventDate: DateTime.now().minus({ days: 1 }) })
    assert.isFalse(event.shouldAppearInCalendar(makeSettings()))
    assert.isTrue(event.shouldAppearInCalendar(makeSettings({ calendarIncludePastEvents: true })))
  })
})
