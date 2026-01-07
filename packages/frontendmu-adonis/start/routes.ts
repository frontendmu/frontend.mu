import router from '@adonisjs/core/services/router'

// Home page
router.get('/', [() => import('#controllers/home_controller'), 'index'])

// Meetups pages
router.get('/meetups', [() => import('#controllers/events_controller'), 'index'])
router.get('/meetup/:id', [() => import('#controllers/events_controller'), 'show'])

// Speakers pages
router.get('/speakers', [() => import('#controllers/speakers_controller'), 'index'])
router.get('/speaker/:id', [() => import('#controllers/speakers_controller'), 'show'])

// Sponsors pages
router.get('/sponsors', [() => import('#controllers/sponsors_controller'), 'index'])
router.get('/sponsor/:id', [() => import('#controllers/sponsors_controller'), 'show'])

// Team page
router.get('/team', [() => import('#controllers/team_controller'), 'index'])

// Static pages
router.get('/sponsor-us', [() => import('#controllers/pages_controller'), 'sponsorUs'])
router.get('/about', [() => import('#controllers/pages_controller'), 'about'])
router.get('/community', [() => import('#controllers/pages_controller'), 'community'])
router.get('/branding', [() => import('#controllers/pages_controller'), 'branding'])
router.get('/history', [() => import('#controllers/pages_controller'), 'history'])
router.get('/contribute', [() => import('#controllers/pages_controller'), 'contribute'])
router.get('/code-of-conduct', [() => import('#controllers/pages_controller'), 'codeOfConduct'])
router.get('/coding-guidelines', [() => import('#controllers/pages_controller'), 'codingGuidelines'])

// Auth routes
router.get('/login', [() => import('#controllers/auth/login_controller'), 'show'])
router.post('/login', [() => import('#controllers/auth/login_controller'), 'store'])
router.get('/register', [() => import('#controllers/auth/register_controller'), 'show'])
router.post('/register', [() => import('#controllers/auth/register_controller'), 'store'])
router.post('/logout', [() => import('#controllers/auth/logout_controller'), 'handle'])

// Profile route
router.get('/profile', [() => import('#controllers/profile_controller'), 'show'])
router.put('/profile', [() => import('#controllers/profile_controller'), 'update'])
