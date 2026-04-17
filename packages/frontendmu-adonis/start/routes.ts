import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Public read-only API (no auth, CORS-open)
router
  .group(() => {
    router
      .get('/meetups', [() => import('#controllers/api/v1/meetups_controller'), 'index'])
      .as('api.public.v1.meetups.index')
    router
      .get('/meetups/next', [() => import('#controllers/api/v1/meetups_controller'), 'next'])
      .as('api.public.v1.meetups.next')
    router
      .get('/meetups/:idOrSlug', [() => import('#controllers/api/v1/meetups_controller'), 'show'])
      .as('api.public.v1.meetups.show')
  })
  .prefix('/api/public/v1')
  .use(middleware.forceJsonResponse())

// Home page
router.get('/', [() => import('#controllers/home_controller'), 'index']).as('home')

// Meetups pages
router
  .get('/meetups', [() => import('#controllers/events_controller'), 'index'])
  .as('meetups.index')
router
  .get('/meetup/:idOrSlug', [() => import('#controllers/events_controller'), 'show'])
  .as('meetups.show')

// Speakers pages
router
  .get('/speakers', [() => import('#controllers/speakers_controller'), 'index'])
  .as('speakers.index')
router
  .get('/speaker/:id', [() => import('#controllers/speakers_controller'), 'show'])
  .where('id', UUID_REGEX)
  .as('speakers.show')

// Sponsors pages
router
  .get('/sponsors', [() => import('#controllers/sponsors_controller'), 'index'])
  .as('sponsors.index')
router
  .get('/sponsor/:id', [() => import('#controllers/sponsors_controller'), 'show'])
  .where('id', UUID_REGEX)
  .as('sponsors.show')

// Team page
router.get('/team', [() => import('#controllers/team_controller'), 'index']).as('team')

// Static pages
router
  .get('/sponsor-us', [() => import('#controllers/pages_controller'), 'sponsorUs'])
  .as('pages.sponsorUs')
router.get('/about', [() => import('#controllers/pages_controller'), 'about']).as('pages.about')
router
  .get('/community', [() => import('#controllers/pages_controller'), 'community'])
  .as('pages.community')
router
  .get('/branding', [() => import('#controllers/pages_controller'), 'branding'])
  .as('pages.branding')
router
  .get('/history', [() => import('#controllers/pages_controller'), 'history'])
  .as('pages.history')
router
  .get('/contribute', [() => import('#controllers/pages_controller'), 'contribute'])
  .as('pages.contribute')
router
  .get('/code-of-conduct', [() => import('#controllers/pages_controller'), 'codeOfConduct'])
  .as('pages.codeOfConduct')
router
  .get('/coding-guidelines', [() => import('#controllers/pages_controller'), 'codingGuidelines'])
  .as('pages.codingGuidelines')

// Auth routes
router
  .get('/login', [() => import('#controllers/auth/login_controller'), 'show'])
  .as('auth.login.show')
router
  .post('/login', [() => import('#controllers/auth/login_controller'), 'store'])
  .as('auth.login.store')
router
  .get('/register', [() => import('#controllers/auth/register_controller'), 'show'])
  .as('auth.register.show')
router
  .post('/register', [() => import('#controllers/auth/register_controller'), 'store'])
  .as('auth.register.store')
router
  .post('/logout', [() => import('#controllers/auth/logout_controller'), 'handle'])
  .as('auth.logout')

// Google OAuth routes
router
  .get('/auth/google', [() => import('#controllers/auth/google_controller'), 'redirect'])
  .as('auth.google.redirect')
router
  .get('/auth/google/callback', [() => import('#controllers/auth/google_controller'), 'callback'])
  .as('auth.google.callback')

// Profile routes (requires authentication)
router
  .group(() => {
    router
      .get('/profile', [() => import('#controllers/profile_controller'), 'show'])
      .as('profile.show')
    router
      .put('/profile', [() => import('#controllers/profile_controller'), 'update'])
      .as('profile.update')
  })
  .use(middleware.auth())

// RSVP routes
// Get RSVP status (public - returns null if not authenticated)
router
  .get('/api/events/:eventId/rsvp/status', [
    () => import('#controllers/rsvps_controller'),
    'status',
  ])
  .where('eventId', UUID_REGEX)
  .as('api.rsvp.status')

// RSVP actions (requires authentication)
router
  .group(() => {
    router
      .post('/api/events/:eventId/rsvp', [() => import('#controllers/rsvps_controller'), 'store'])
      .where('eventId', UUID_REGEX)
      .as('api.rsvp.store')
    router
      .delete('/api/events/:eventId/rsvp', [
        () => import('#controllers/rsvps_controller'),
        'destroy',
      ])
      .where('eventId', UUID_REGEX)
      .as('api.rsvp.destroy')
  })
  .use(middleware.auth())

// Admin routes (requires authentication - authorization handled by policies)
router
  .group(() => {
    // Admin dashboard
    router
      .get('/admin', [() => import('#controllers/admin/dashboard_controller'), 'index'])
      .as('admin.dashboard')

    // Event management
    router
      .get('/admin/events', [() => import('#controllers/admin/events_controller'), 'index'])
      .as('admin.events.index')
    router
      .get('/admin/events/create', [() => import('#controllers/admin/events_controller'), 'create'])
      .as('admin.events.create')
    router
      .post('/admin/events', [() => import('#controllers/admin/events_controller'), 'store'])
      .as('admin.events.store')
    router
      .get('/admin/events/:id/edit', [() => import('#controllers/admin/events_controller'), 'edit'])
      .where('id', UUID_REGEX)
      .as('admin.events.edit')
    router
      .put('/admin/events/:id', [() => import('#controllers/admin/events_controller'), 'update'])
      .where('id', UUID_REGEX)
      .as('admin.events.update')
    router
      .delete('/admin/events/:id', [
        () => import('#controllers/admin/events_controller'),
        'destroy',
      ])
      .where('id', UUID_REGEX)
      .as('admin.events.destroy')

    // Session management (nested under events)
    router
      .get('/admin/events/:eventId/sessions', [
        () => import('#controllers/admin/sessions_controller'),
        'index',
      ])
      .where('eventId', UUID_REGEX)
      .as('admin.sessions.index')
    router
      .post('/admin/events/:eventId/sessions', [
        () => import('#controllers/admin/sessions_controller'),
        'store',
      ])
      .where('eventId', UUID_REGEX)
      .as('admin.sessions.store')
    router
      .get('/admin/sessions/:id', [() => import('#controllers/admin/sessions_controller'), 'show'])
      .where('id', UUID_REGEX)
      .as('admin.sessions.show')
    router
      .put('/admin/sessions/:id', [
        () => import('#controllers/admin/sessions_controller'),
        'update',
      ])
      .where('id', UUID_REGEX)
      .as('admin.sessions.update')
    router
      .delete('/admin/sessions/:id', [
        () => import('#controllers/admin/sessions_controller'),
        'destroy',
      ])
      .where('id', UUID_REGEX)
      .as('admin.sessions.destroy')

    // Speaker management for sessions
    router
      .post('/admin/sessions/:id/speakers/:speakerId', [
        () => import('#controllers/admin/sessions_controller'),
        'addSpeaker',
      ])
      .where('id', UUID_REGEX)
      .where('speakerId', UUID_REGEX)
      .as('admin.sessions.addSpeaker')
    router
      .delete('/admin/sessions/:id/speakers/:speakerId', [
        () => import('#controllers/admin/sessions_controller'),
        'removeSpeaker',
      ])
      .where('id', UUID_REGEX)
      .where('speakerId', UUID_REGEX)
      .as('admin.sessions.removeSpeaker')

    // Get available speakers for assignment
    router
      .get('/admin/speakers/available', [
        () => import('#controllers/admin/sessions_controller'),
        'availableSpeakers',
      ])
      .as('admin.speakers.available')

    // Sponsor management for events
    router
      .get('/admin/sponsors/available', [
        () => import('#controllers/admin/events_controller'),
        'availableSponsors',
      ])
      .as('admin.sponsors.available')
    router
      .post('/admin/events/:id/sponsors/:sponsorId', [
        () => import('#controllers/admin/events_controller'),
        'addSponsor',
      ])
      .where('id', UUID_REGEX)
      .where('sponsorId', UUID_REGEX)
      .as('admin.events.addSponsor')
    router
      .delete('/admin/events/:id/sponsors/:sponsorId', [
        () => import('#controllers/admin/events_controller'),
        'removeSponsor',
      ])
      .where('id', UUID_REGEX)
      .where('sponsorId', UUID_REGEX)
      .as('admin.events.removeSponsor')

    // Speaker management
    router
      .get('/admin/speakers', [() => import('#controllers/admin/speakers_controller'), 'index'])
      .as('admin.speakers.index')
    router
      .get('/admin/speakers/create', [
        () => import('#controllers/admin/speakers_controller'),
        'create',
      ])
      .as('admin.speakers.create')
    router
      .post('/admin/speakers', [() => import('#controllers/admin/speakers_controller'), 'store'])
      .as('admin.speakers.store')
    router
      .delete('/admin/speakers/:id', [
        () => import('#controllers/admin/speakers_controller'),
        'destroy',
      ])
      .where('id', UUID_REGEX)
      .as('admin.speakers.destroy')

    // Sponsor management
    router
      .get('/admin/sponsors', [() => import('#controllers/admin/sponsors_controller'), 'index'])
      .as('admin.sponsors.index')
    router
      .get('/admin/sponsors/create', [
        () => import('#controllers/admin/sponsors_controller'),
        'create',
      ])
      .as('admin.sponsors.create')
    router
      .post('/admin/sponsors', [() => import('#controllers/admin/sponsors_controller'), 'store'])
      .as('admin.sponsors.store')
    router
      .get('/admin/sponsors/:id/edit', [
        () => import('#controllers/admin/sponsors_controller'),
        'edit',
      ])
      .where('id', UUID_REGEX)
      .as('admin.sponsors.edit')
    router
      .put('/admin/sponsors/:id', [
        () => import('#controllers/admin/sponsors_controller'),
        'update',
      ])
      .where('id', UUID_REGEX)
      .as('admin.sponsors.update')
    router
      .delete('/admin/sponsors/:id', [
        () => import('#controllers/admin/sponsors_controller'),
        'destroy',
      ])
      .where('id', UUID_REGEX)
      .as('admin.sponsors.destroy')

    // User management
    router
      .get('/admin/users', [() => import('#controllers/admin/users_controller'), 'index'])
      .as('admin.users.index')
    router
      .get('/admin/users/:id/edit', [() => import('#controllers/admin/users_controller'), 'edit'])
      .where('id', UUID_REGEX)
      .as('admin.users.edit')
    router
      .put('/admin/users/:id', [() => import('#controllers/admin/users_controller'), 'update'])
      .where('id', UUID_REGEX)
      .as('admin.users.update')
    router
      .delete('/admin/users/:id', [() => import('#controllers/admin/users_controller'), 'destroy'])
      .where('id', UUID_REGEX)
      .as('admin.users.destroy')
  })
  .use(middleware.auth())
