import { test } from '@japa/runner'
import { DateTime, Settings } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import Event from '#models/event'
import SiteSetting from '#models/site_setting'

test.group('Calendar feed (/api/public/meetups.ics)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('serves a valid ICS payload with the correct content type', async ({ client, assert }) => {
    const response = await client.get('/api/public/meetups.ics')

    response.assertStatus(200)
    assert.equal(response.header('content-type'), 'text/calendar; charset=utf-8')
    assert.include(response.text(), 'BEGIN:VCALENDAR')
    assert.include(response.text(), 'END:VCALENDAR')
  })

  test('includes an upcoming published event by default', async ({ client, assert }) => {
    await SiteSetting.current()
    const event = await Event.create({
      title: 'Calendar Feed Test Meetup',
      eventDate: DateTime.now().plus({ days: 10 }),
      status: 'published',
      attendeeCount: 0,
    })

    const response = await client.get('/api/public/meetups.ics')

    response.assertStatus(200)
    assert.include(response.text(), `UID:${event.id}`)
    assert.include(response.text(), 'SUMMARY:Calendar Feed Test Meetup')
  })

  test('excludes an event explicitly hidden via includeInCalendar', async ({ client, assert }) => {
    const event = await Event.create({
      title: 'Explicitly Hidden Meetup',
      eventDate: DateTime.now().plus({ days: 10 }),
      status: 'published',
      attendeeCount: 0,
      includeInCalendar: false,
    })

    const response = await client.get('/api/public/meetups.ics')

    response.assertStatus(200)
    assert.notInclude(response.text(), `UID:${event.id}`)
  })

  test('excludes draft events', async ({ client, assert }) => {
    const event = await Event.create({
      title: 'Draft Meetup',
      eventDate: DateTime.now().plus({ days: 10 }),
      status: 'draft',
      attendeeCount: 0,
    })

    const response = await client.get('/api/public/meetups.ics')

    response.assertStatus(200)
    assert.notInclude(response.text(), `UID:${event.id}`)
  })

  test('keeps cancelled events in the feed, marked as cancelled', async ({ client, assert }) => {
    const event = await Event.create({
      title: 'Cancelled Meetup',
      eventDate: DateTime.now().plus({ days: 10 }),
      status: 'cancelled',
      attendeeCount: 0,
    })

    const response = await client.get('/api/public/meetups.ics')

    response.assertStatus(200)
    assert.include(response.text(), `UID:${event.id}`)
    assert.include(response.text(), 'STATUS:CANCELLED')
  })

  test('ends an all-day meetup on the following day, per the exclusive DTEND rule', async ({
    client,
    assert,
  }) => {
    await Event.create({
      title: 'All Day Meetup',
      eventDate: DateTime.fromISO('2026-11-14T00:00:00'),
      startTime: null,
      status: 'published',
      attendeeCount: 0,
    })

    const response = await client.get('/api/public/meetups.ics')
    const lines = response.text().split(/\r?\n/)

    assert.include(
      lines.find((l) => l.startsWith('DTSTART;VALUE=DATE')),
      '20261114'
    )
    assert.include(
      lines.find((l) => l.startsWith('DTEND;VALUE=DATE')),
      '20261115'
    )
  })

  test('serves an empty (but valid) calendar when the feed is disabled', async ({
    client,
    assert,
  }) => {
    const settings = await SiteSetting.current()
    settings.merge({ calendarFeedEnabled: false })
    await settings.save()

    await Event.create({
      title: 'Should Not Appear',
      eventDate: DateTime.now().plus({ days: 10 }),
      status: 'published',
      attendeeCount: 0,
    })

    const response = await client.get('/api/public/meetups.ics')

    response.assertStatus(200)
    assert.include(response.text(), 'BEGIN:VCALENDAR')
    assert.notInclude(response.text(), 'BEGIN:VEVENT')
  })
})

/**
 * start_time/end_time are wall-clock strings with no zone attached. These run
 * with Luxon's default zone forced away from the meetup timezone — the shape of
 * a deployment whose server clock isn't Mauritius — because that is the only
 * arrangement in which the bug can surface. Running them on TZ=Indian/Mauritius
 * alone would pass even with the conversion removed.
 */
test.group('Calendar feed timezone handling', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(() => {
    const original = Settings.defaultZone
    Settings.defaultZone = 'UTC'
    return () => {
      Settings.defaultZone = original
    }
  })

  test('emits startTime in the meetup timezone, not the server timezone', async ({
    client,
    assert,
  }) => {
    await Event.create({
      title: 'Wall Clock Meetup',
      eventDate: DateTime.fromISO('2026-10-01T00:00:00'),
      startTime: '10:00',
      status: 'published',
      attendeeCount: 0,
    })

    const response = await client.get('/api/public/meetups.ics')
    const lines = response.text().split(/\r?\n/)

    assert.include(
      lines.find((l) => l.startsWith('DTSTART')),
      'T100000'
    )
    assert.include(
      lines.find((l) => l.startsWith('DTEND')),
      'T140000'
    )
  })

  test('honours an explicit endTime in the meetup timezone', async ({ client, assert }) => {
    await Event.create({
      title: 'Explicit End Meetup',
      eventDate: DateTime.fromISO('2026-10-02T00:00:00'),
      startTime: '18:30',
      endTime: '20:00',
      status: 'published',
      attendeeCount: 0,
    })

    const response = await client.get('/api/public/meetups.ics')
    const lines = response.text().split(/\r?\n/)

    assert.include(
      lines.find((l) => l.startsWith('DTSTART') && l.includes('20261002')),
      'T183000'
    )
    assert.include(
      lines.find((l) => l.startsWith('DTEND') && l.includes('20261002')),
      'T200000'
    )
  })
})
