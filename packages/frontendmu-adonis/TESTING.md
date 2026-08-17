# Testing

How the test suite in `packages/frontendmu-adonis` is wired, how to write tests that fit it, and the conventions we expect in a pull request. Written for human contributors and coding agents alike.

All commands below run from `packages/frontendmu-adonis`.

These are defaults and reasoning, not laws. Where a rule has a reason attached, the reason is the part that matters — if it no longer applies to what you're building, depart from the rule and say why in the pull request. The configuration files named here are the source of truth; when they and this document disagree, the files win and this document needs updating.

## Quick reference

```bash
node ace test                      # everything (unit + functional)
node ace test unit                 # one suite
node ace test functional
node ace test --files calendar_feed          # matches the END of the file path
node ace test --files unit/event_calendar    # …so a partial path works too
node ace test --groups "<exact group title>"
node ace test --tests "<exact test title>"
node ace test --watch              # re-run on change
node ace test --failed             # only what failed last run

pnpm run typecheck                 # tsc --noEmit — tests are type-checked too
pnpm run lint
pnpm run test:a11y                 # separate Playwright/axe suite, see below
```

`--groups` and `--tests` need the **exact, complete** title — partial titles match nothing and exit silently, which reads like a passing run if you're not paying attention. `--files` matches the end of the file path.

## How it fits together

Read this once; it explains most of the "why" behind the rules further down.

| Piece | File | What it does |
| --- | --- | --- |
| Entrypoint | `bin/test.ts` | Sets `NODE_ENV=test` **before** booting, so AdonisJS loads `.env.test` instead of `.env` |
| Suites | `adonisrc.ts` (`tests.suites`) | `unit` → `tests/unit/**/*.spec.ts`, `functional` → `tests/functional/**/*.spec.ts`; each suite's timeout is set there too |
| Plugins | `tests/bootstrap.ts` | `assert`, `apiClient`, `sessionApiClient`, `authApiClient`, `pluginAdonisJS` |
| Global setup | `tests/bootstrap.ts` (`runnerHooks.setup`) | `testUtils.db().migrate()` then `testUtils.db().seed()` — once, before any test |
| HTTP server | `tests/bootstrap.ts` (`configureSuite`) | Boots a real HTTP server for the `functional` suite only |
| Environment | `.env.test` | Isolated SQLite DB, `SESSION_DRIVER=memory`, fixed non-secret `APP_KEY` |

Three consequences worth internalising:

1. **The test database is built from scratch on every run.** `.env.test` points `DB_DATABASE` at `database/db.test.sqlite3` (gitignored). It is *not* the dev database — you can never corrupt your dev data by running tests, and tests can never depend on rows you happen to have locally.
2. **Seed data is whatever `database/seeders/` produces** — currently the RBAC roles and permissions, nothing else. So `Role.findByOrFail('name', 'superadmin')` works in a test, but there are no events, users, or meetups unless your test creates them.
3. **CSRF is disabled under test** (`config/shield.ts`, `enabled: !app.inTest`). The Japa API client has no CSRF-token bridge, and request forgery is not a meaningful threat for same-process tests. This is why `client.post(...)` works without a token dance.

If the schema ever looks stale, just delete the file and re-run:

```bash
rm -f database/db.test.sqlite3 && node ace test
```

## Database state between tests

We follow the AdonisJS guidance in [Resetting state between tests](https://docs.adonisjs.com/guides/testing/resetting-state-between-tests): migrate and seed **once** globally, then wrap **each test** in a transaction that is rolled back afterwards. Rollback is much faster than truncating, and nothing is ever persisted.

Every group whose tests touch the database must opt in:

```ts
test.group('Calendar feed (/api/public/meetups.ics)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // ...tests
})
```

**Forgetting this hook is the single most common mistake.** Without it your rows survive into the next test, and the suite starts passing or failing depending on file order — the worst kind of flake. If a group has no `withGlobalTransaction()` and no database access, that's fine; if it has database access, the hook is mandatory.

Reach for `testUtils.db().truncate()` instead only if you genuinely need committed data — for example if the code under test opens its own connection or spawns a process that reads the database. Say why in a comment when you do.

### Migrations must survive an empty database

Because bootstrap migrates from zero, **every migration runs against an empty schema on every test run**.
Data-fix migrations that assert on the existence of production rows will throw, and a failing migration doesn't produce a nice test failure — it aborts the run before a single test executes, and can leave the runner hanging (`forceExit` is `false` in `adonisrc.ts`).

Treat "there is nothing to fix here" as a legitimate no-op. Keep throwing on genuinely ambiguous states — a half-applied fix, a slug collision, a leftover temporary row.

## Functional tests

Functional tests exercise a real HTTP request through the real router, middleware, controllers, and database. Use them for routes, auth and authorisation, redirects, validation, and response payloads.
See the AdonisJS [API tests guide](https://docs.adonisjs.com/guides/testing/api-tests) for the full client surface.

```ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Admin settings controller', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('denies users without manage-settings permission', async ({ client }) => {
    // makeUser() is a small local helper in the spec file — see "Unit tests" below
    const member = await makeUser('member')
    const response = await client.get('/admin/settings').loginAs(member)
    response.assertStatus(403)
  })
})
```

Things specific to this project:

- **`loginAs(user)` requires the memory session driver.** That's what `SESSION_DRIVER=memory` in `.env.test` is for, together with the `sessionApiClient` and `authApiClient` plugins in `tests/bootstrap.ts`.
- **Assert on redirects with `.redirects(0)`.** By default the client follows redirects and you'll assert against the wrong page. With `redirects(0)` you get the 302 and can check `response.header('location')`.
- **Most admin pages are Inertia**, so the response is HTML, not JSON. Assert on status, headers, redirects, and the resulting database state rather than trying to parse the page. Reserve `assertBodyContains` for genuine JSON endpoints and text formats like `/api/public/meetups.ics`.
- **Test the authorisation matrix, not just the happy path.** For any protected route: anonymous → redirect to `/login`, authenticated-but-unauthorised → 403, authorised → 200. `tests/functional/admin_settings.spec.ts` covers all three.
- **Useful assertions:** `assertStatus`, `assertBodyContains`, `assertHeader`, `assertCookie`, `assertSession`, `assertFlashMessage`, `assertHasValidationError`. Send payloads with `.json({...})` or `.form({...})`.
- **Debugging:** chain `.dump()` on the request, or call `response.dumpBody()` / `response.dumpHeaders()`. Remove them before committing.

## Unit tests

Unit tests are for logic that can be decided in memory, with no database and no HTTP. The suite's timeout is deliberately tight (see `adonisrc.ts`) — if a unit test is close to it, it isn't a unit test any more.

The pattern we want: **push branching business rules into a pure method, then test that method exhaustively.**
`Event#shouldAppearInCalendar(settings)` in `app/models/event.ts` is a good reference — it resolves a per-event override against global settings and returns a boolean, touching nothing external. Its test builds model instances with `new Event()` and never hits the database:

```ts
function makeEvent(overrides: Partial<Event> = {}): Event {
  const event = new Event()
  event.status = 'published'
  event.eventDate = DateTime.now().plus({ days: 7 })
  event.includeInCalendar = null
  Object.assign(event, overrides)
  return event
}
```

A small local factory with sensible defaults plus an `overrides` argument keeps each test to one meaningful line of setup, and makes the *difference* between cases obvious at a glance. Prefer this over shared fixture files.

If a rule is hard to unit test, that's usually a design signal: the decision is tangled up with I/O and wants extracting into a pure function.
A handful of fast unit tests over one pure method beat the same number of HTTP round-trips.

## Conventions

- **Location and naming:** `tests/unit/*.spec.ts` and `tests/functional/*.spec.ts`, `snake_case` filenames, named after the unit or route under test (`calendar_feed.spec.ts`, `event_calendar.spec.ts`).
- **Group titles** name the thing under test — a route (`'Calendar feed (/api/public/meetups.ics)'`), a controller (`'Admin settings controller'`), or a method (`'Event#shouldAppearInCalendar'`).
- **Test titles are behaviour sentences** in the third person, describing the rule rather than the mechanics: `'excludes past events unless calendarIncludePastEvents is true'`, not `'test past'`. Someone reading only the titles should learn the feature's rules.
- **One behaviour per test.** Asserting both directions of a single toggle in one test is fine and often clearer; unrelated behaviours belong in separate tests.
- **No shared mutable state between tests.** Build what you need inside the test. Where you create records with unique columns (e.g. user emails), make them unique per call so a missing rollback fails loudly instead of intermittently.
- **No network calls, no real time dependence.** Use relative dates (`DateTime.now().plus({ days: 10 })`) rather than hardcoded ones so tests don't rot.
- **Tests are type-checked and linted** like any other code. `pnpm run typecheck` and `pnpm run lint` must pass; avoid `any` in test code as you would in `app/`.

## What deserves a test

Worth writing:

- Business rules with branches — anything with a precedence order or a tri-state, like the calendar override resolving against site settings.
- Authorisation on every protected route (the three-case matrix above).
- Output contracts other systems consume: content types, `.ics` structure, JSON shapes.
- Regressions — a failing test first, then the fix.

Not worth writing:

- Framework behaviour (that Lucid saves a row, that the router routes).
- Getters with no logic, or assertions that restate the implementation line by line.
- Snapshot-style assertions over whole HTML pages; they break on every copy edit and tell you nothing.

## Accessibility suite (separate)

The specs in `tests/a11y/` are Playwright + axe scans, **not** part of `node ace test` — `adonisrc.ts` only registers the `unit` and `functional` directories.

```bash
pnpm run test:a11y
```

It boots its own dev server via `playwright.a11y.config.ts` and runs against `database/db.local.sqlite3` (the dev database, so it has realistic content), or against a deployed URL with `A11Y_BASE_URL=https://… pnpm run test:a11y`. Reports land in `playwright-report/`.

Sibling packages (`frontendmu-astro`, `frontendmu-nuxt`) have their own independent `playwright test` scripts. Nothing in this document applies to them.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `Error: listen EPERM 0.0.0.0:3333` | Something is blocking the port bind — a sandbox, or a dev server already running. `pnpm run clean:ports` frees the dev server ports. |
| Run aborts with `"migration:run" failed`, sometimes without exiting | A migration threw against the empty test database — no test got to run. Usually the migration wants to no-op when there's nothing to fix (see above); patching around it in `bootstrap.ts` tends to hide the same problem from a fresh production deploy. |
| Tests pass alone, fail together | A group is missing `group.each.setup(() => testUtils.db().withGlobalTransaction())`. |
| 403/419 on a POST you expected to succeed | Check the route's policy first; CSRF is already off under test. |
| Runner doesn't exit | An open handle (timer, connection). `forceExit` is deliberately `false` so leaks surface — find and close it. |
| Stray `database/schema.ts` appears | A side effect of migration commands. It is not tracked; delete it. |

## Before opening a pull request

1. `node ace test` — green.
2. `pnpm run typecheck` — clean.
3. `pnpm run lint` — clean.
4. No `.dump()`, `.only()`, or commented-out tests left behind.

Worth doing where it fits: bring a test along with new behaviour, and for a bug fix write it first, so you can watch it fail without the fix.

## Further reading

- [Introduction to testing](https://docs.adonisjs.com/guides/testing/introduction)
- [Resetting state between tests](https://docs.adonisjs.com/guides/testing/resetting-state-between-tests)
- [HTTP / API tests](https://docs.adonisjs.com/guides/testing/api-tests)
- [Database seeders (Lucid)](https://lucid.adonisjs.com/docs/seeders)
- [Japa runner docs](https://japa.dev/docs)
- Project docs: [`README.md`](README.md), [`DATABASE.md`](DATABASE.md), [`CODING_GUIDELINES.md`](../../CODING_GUIDELINES.md)
