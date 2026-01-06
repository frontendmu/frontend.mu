# Refined Migration Plan: Nuxt → AdonisJS

## Overview

This document outlines the refined migration plan for transitioning frontend.mu website from Nuxt 3 to AdonisJS with Inertia.js and Vue 3. The plan synthesizes the best approaches from GLM.md, plan.md, and bigpickle.md, while removing blog and brand asset tables (to remain static content).

**Current Stack:**
- Nuxt 3 with Vue 3
- Tailwind CSS (v3)
- Static deployment (SSG)
- Client-side auth via Supabase/Directus
- Data stored in JSON files (`@packages/frontendmu-data/`)

**Target Stack:**
- AdonisJS 6 with Inertia.js
- Tailwind CSS 4
- PostgreSQL database
- Server-side rendering with Inertia
- Built-in AdonisJS auth (Phase 2)

**Key Design Decisions:**
- ✅ Single `users` table with role-based access (not separate tables for each type)
- ✅ JSONB for sponsor types (flexible, no separate table needed)
- ✅ Direct event_photos table (no galleries, simpler structure)
- ✅ `pages` table for static content (replaces blog_posts, brand_assets)
- ✅ Static pages (about, branding, faq, etc.) remain as markdown files
- ✅ Contributors fetched from GitHub API (no local table needed initially)
- ✅ No blog/brand asset migration - serve static files directly

---

## Migration Phases

### Phase 0: Project Setup & Foundation ⏳

**Status**: ❌ Not Started
**Goal**: Create foundation AdonisJS project with basic structure

#### Steps

- [ ] **0.1** Create new AdonisJS project in `packages/frontendmu-adonis/`
  - Use existing adonis-102 project as reference
  - Initialize with Inertia + Vue 3 + TailwindCSS 4
  - Configure PostgreSQL connection
  - Set up monorepo workspace configuration

- [ ] **0.2** Configure project structure
  - Copy Tailwind 4 configuration from adonis-102
  - Set up Vite for Vue 3 + Inertia
  - Configure Inertia middleware
  - Set up edge.js layout for Inertia

- [ ] **0.3** Create basic routing structure
  - Set up main layout
  - Create home page placeholder
  - Configure 404 handling
  - Set up SEO basics (meta tags)

- [ ] **0.4** Configure environment variables
  - Create `.env.example` with all required variables
  - Set up database configuration
  - Configure site URL and CDN paths for images

**Completion Criteria**: ✓ AdonisJS project runs locally with home page accessible

---

### Phase 1: Database Schema Design & Migration ⏳

**Status**: ❌ Not Started
**Goal**: Design and implement optimized database schema

#### Database Schema Overview

```sql
-- Users table (unified for all roles)
users {
  id: uuid primary
  name: string not null
  email: string unique nullable
  github_username: string unique nullable
  avatar_url: string
  role: enum('admin', 'organizer', 'speaker', 'community_member')
  bio: text
  linkedin_url: string
  twitter_url: string
  website_url: string
  featured: boolean default false
  created_at: timestamp
  updated_at: timestamp
}

-- Events table
events {
  id: uuid primary
  title: string not null
  description: text
  location: string
  venue: string
  event_date: timestamp not null
  start_time: time
  end_time: time
  attendee_count: integer default 0
  seats_available: integer
  accepting_rsvp: boolean default false
  rsvp_closing_date: timestamp
  rsvp_link: string
  album_name: string
  cover_image_url: string
  parking_location: string
  map_url: string
  status: enum('published', 'draft', 'cancelled') default 'published'
  created_at: timestamp
  updated_at: timestamp
}

-- Sessions table (event talks)
sessions {
  id: uuid primary
  event_id: uuid foreign -> events.id
  title: string not null
  description: text
  order: integer
  created_at: timestamp
  updated_at: timestamp
}

-- Session Speakers junction table (many-to-many)
session_speakers {
  session_id: uuid foreign -> sessions.id
  speaker_id: uuid foreign -> users.id
  created_at: timestamp
  unique(session_id, speaker_id)
}

-- Sponsors table
sponsors {
  id: uuid primary
  name: string not null
  website: string
  description: text
  logo_url: string
  logomark_url: string
  sponsor_types: jsonb (array of strings: ['lunch', 'venue', 'swag', 'drinks'])
  darkbg: boolean default false
  status: enum('active', 'inactive') default 'active'
  created_at: timestamp
  updated_at: timestamp
}

-- Event Sponsors junction table
event_sponsors {
  event_id: uuid foreign -> events.id
  sponsor_id: uuid foreign -> sponsors.id
  created_at: timestamp
  unique(event_id, sponsor_id)
}

-- Event Photos table (direct linking)
event_photos {
  id: uuid primary
  event_id: uuid foreign -> events.id
  photo_url: string not null
  caption: text
  order: integer
  created_at: timestamp
}

-- Pages table (for dynamic content)
pages {
  id: uuid primary
  slug: string unique not null
  title: string not null
  content: text (markdown)
  meta_description: text
  status: enum('published', 'draft') default 'draft'
  created_at: timestamp
  updated_at: timestamp
}
```

#### Schema Design Rationale

1. **Unified Users Table**: Single table with `role` enum instead of separate tables for speakers/organizers/community members. Simplifies queries and relationships.

2. **JSONB for Sponsor Types**: Eliminates need for separate `sponsor_types` table. Flexible for adding new types without schema changes.

3. **Direct Event Photos**: No `event_galleries` table. Photos linked directly to events with optional `order` for sorting. Simpler structure, less joins.

4. **Pages Table for Dynamic Content**: Replaces `blog_posts` and `brand_assets`. Supports markdown content with slugs. Static pages remain as markdown files.

5. **No Contributors Table**: Contributors fetched from GitHub API. Reduces data duplication, always up-to-date.

6. **UUID Primary Keys**: More robust for distributed systems, better for replication if needed.

#### Steps

- [ ] **1.1** Create users table migration
  ```bash
  node ace make:migration create_users_table
  ```
  - Fields: id (uuid), name, email, github_username, avatar_url, role (enum), bio, linkedin_url, twitter_url, website_url, featured
  - Indexes: github_username (unique), email (unique)
  - Add created_at, updated_at

- [ ] **1.2** Create events table migration
  ```bash
  node ace make:migration create_events_table
  ```
  - Fields: id (uuid), title, description, location, venue, event_date, start_time, end_time, attendee_count, seats_available, accepting_rsvp, rsvp_closing_date, rsvp_link, album_name, cover_image_url, parking_location, map_url, status
  - Indexes: event_date, status, title

- [ ] **1.3** Create sessions table migration
  ```bash
  node ace make:migration create_sessions_table
  ```
  - Fields: id (uuid), event_id (FK), title, description, order
  - Indexes: event_id

- [ ] **1.4** Create session_speakers junction table migration
  ```bash
  node ace make:migration create_session_speakers_table
  ```
  - Fields: session_id (FK), speaker_id (FK)
  - Foreign keys to sessions and users
  - Unique constraint on (session_id, speaker_id)

- [ ] **1.5** Create sponsors table migration
  ```bash
  node ace make:migration create_sponsors_table
  ```
  - Fields: id (uuid), name, website, description, logo_url, logomark_url, sponsor_types (jsonb), darkbg, status
  - Indexes: name, status
  - GIN index on sponsor_types for JSON queries

- [ ] **1.6** Create event_sponsors junction table migration
  ```bash
  node ace make:migration create_event_sponsors_table
  ```
  - Fields: event_id (FK), sponsor_id (FK)
  - Foreign keys to events and sponsors
  - Unique constraint on (event_id, sponsor_id)

- [ ] **1.7** Create event_photos table migration
  ```bash
  node ace make:migration create_event_photos_table
  ```
  - Fields: id (uuid), event_id (FK), photo_url, caption, order
  - Indexes: event_id

- [ ] **1.8** Create pages table migration
  ```bash
  node ace make:migration create_pages_table
  ```
  - Fields: id (uuid), slug, title, content, meta_description, status
  - Indexes: slug (unique), status

- [ ] **1.9** Run all migrations
  ```bash
  node ace migration:run
  ```
  - Verify all tables created correctly
  - Check foreign key constraints
  - Verify indexes

- [ ] **1.10** Create Lucid models
  ```bash
  node ace make:model User
  node ace make:model Event
  node ace make:model Session
  node ace make:model Sponsor
  node ace make:model EventPhoto
  node ace make:model Page
  ```
  - Set up relationships (belongsTo, hasMany, manyToMany)
  - Add computed properties where needed
  - Add validation rules using VineJS

**Completion Criteria**: ✓ All migrations run successfully, all models created with relationships

---

### Phase 2: Data Migration Scripts ⏳

**Status**: ❌ Not Started
**Goal**: Migrate all existing JSON data to PostgreSQL

#### Steps

- [ ] **2.1** Create data migration utilities
  - Create `database/scripts/migrate_data.ts`
  - Set up file reading from `@frontendmu-data/`
  - Create helper functions for data transformation
  - Add error handling and logging

- [ ] **2.2** Migrate users (speakers-raw.json + people.js → users)
  - Parse `speakers-raw.json`
  - Create user records with role='speaker'
  - Set featured flag from speakers-raw.json
  - Parse `people.js` (organisers array)
  - Create user records with role='organizer'
  - Import linkedin_url
  - Parse communityMembers array
  - Create user records with role='community_member'
  - Merge with speakers-profile.json data (bio, location, job_title)
  - Handle avatar URLs from GitHub

- [ ] **2.3** Migrate events (meetups-raw.json → events)
  - Parse `meetups-raw.json`
  - Create event records
  - Extract date, time, location, venue
  - Store HTML description
  - Handle accepting_rsvp, seats_available
  - Parse rsvp_closing_date
  - Extract album name from gallery data

- [ ] **2.4** Migrate sessions (meetups-raw.json → sessions + session_speakers)
  - Extract sessions from events
  - Create session records
  - Parse session titles
  - Map speakers to sessions (session_speakers pivot)
  - Handle sessions with multiple speakers

- [ ] **2.5** Migrate sponsors (sponsors-raw.json → sponsors)
  - Parse `sponsors-raw.json`
  - Create sponsor records
  - Convert sponsor_type array to JSONB
  - Map logo/logomark IDs to file paths
  - Handle darkbg flag

- [ ] **2.6** Migrate event-sponsor relationships
  - Parse sponsor data embedded in events
  - Create event_sponsors pivot records
  - Map sponsors to their respective events

- [ ] **2.7** Migrate event photos (photos-raw.json → event_photos)
  - Parse `photos-raw.json`
  - Create photo records linked to events
  - Map album names to event_ids
  - Include order for photo sequencing

- [ ] **2.8** Run data migration script
  ```bash
  tsx database/scripts/migrate_data.ts
  ```
  - Monitor console output for errors
  - Verify record counts match source
  - Check for any failed records

- [ ] **2.9** Create data verification script
  - Count records in each table
  - Compare with JSON source counts
  - Generate report of any discrepancies
  - Verify foreign key relationships

- [ ] **2.10** Back up migrated data
  ```bash
  pg_dump frontendmu_production > backup_$(date +%Y%m%d).sql
  ```
  - Store backup in version control or cloud storage
  - Document data count for verification

**Completion Criteria**: ✓ All data migrated, verification script passes, no data loss

---

### Phase 3: Core Controllers & API ⏳

**Status**: ❌ Not Started
**Goal**: Create controllers for all public-facing features

#### Steps

- [ ] **3.1** Create HomeController
  ```bash
  node ace make:controller home
  ```
  - Index: Fetch latest events, featured speakers
  - Pass data to Inertia page
  - Set up page metadata

- [ ] **3.2** Create EventsController
  ```bash
  node ace make:controller events
  ```
  - Index: List all events grouped by year
  - Show: Display single event with sessions, sponsors, photos
  - Add filters/upcoming events
  - Implement pagination
  - Use eager loading to prevent N+1 queries

- [ ] **3.3** Create SpeakersController
  ```bash
  node ace make:controller speakers
  ```
  - Index: List all speakers (filtered by role='speaker', featured first)
  - Show: Display speaker profile with their sessions
  - Add sorting by name, featured

- [ ] **3.4** Create SponsorsController
  ```bash
  node ace make:controller sponsors
  ```
  - Index: List sponsors grouped by type (query JSONB sponsor_types)
  - Show: Display sponsor details and sponsored events

- [ ] **3.5** Create TeamController
  ```bash
  node ace make:controller team
  ```
  - Index: Display organizers, community members, speakers, contributors
  - Group by role
  - Fetch contributors from GitHub API

- [ ] **3.6** Create PagesController (for dynamic content)
  ```bash
  node ace make:controller pages
  ```
  - Index: List published pages
  - Show: Display single page with markdown rendering

- [ ] **3.7** Update routes.ts
  - Register all controller routes
  - Set up named routes
  - Add canonical URLs
  - Configure middleware where needed
  - Static routes for markdown files (about, branding, faq, etc.)

- [ ] **3.8** Create API endpoints (optional, for future)
  - JSON endpoints for events, speakers, sponsors
  - Add CORS configuration
  - Implement caching for read-only endpoints

**Completion Criteria**: ✓ All controllers created and tested, routes registered

---

### Phase 4: Vue Components Migration ⏳

**Status**: ❌ Not Started
**Goal**: Migrate all Vue components from Nuxt to AdonisJS + Inertia

#### Component Structure

```
resources/
├── inertia/
│   ├── pages/
│   │   ├── index.vue (home)
│   │   ├── events/
│   │   │   ├── index.vue
│   │   │   └── [id].vue
│   │   ├── speakers/
│   │   │   ├── index.vue
│   │   │   └── [id].vue
│   │   ├── sponsors.vue
│   │   ├── team.vue
│   │   ├── about.vue (static markdown)
│   │   ├── branding.vue (static markdown)
│   │   ├── faq.vue (static markdown)
│   │   └── sponsor-us.vue (static markdown)
│   ├── components/
│   │   ├── base/
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseCard.vue
│   │   │   └── BaseHeading.vue
│   │   ├── layout/
│   │   │   ├── Header.vue
│   │   │   ├── Footer.vue
│   │   │   └── LayoutBackdrop.vue
│   │   ├── home/
│   │   │   ├── HomeHero.vue
│   │   │   ├── HomeSponsorCalendar.vue
│   │   │   ├── HomeLatestMeetup.vue
│   │   │   ├── HomeFeaturedSpeakers.vue
│   │   │   ├── HomeSocialPresence.vue
│   │   │   └── HomeStatsCounter.vue
│   │   ├── event/
│   │   │   ├── EventCard.vue
│   │   │   ├── EventList.vue
│   │   │   ├── EventSingle.vue
│   │   │   ├── SessionCard.vue
│   │   │   └── AddToCalendar.vue
│   │   ├── speaker/
│   │   │   ├── SpeakerCard.vue
│   │   │   └── SpeakerList.vue
│   │   ├── sponsor/
│   │   │   ├── SponsorCard.vue
│   │   │   └── SponsorList.vue
│   │   ├── shared/
│   │   │   ├── BackgroundShapes.vue
│   │   │   ├── ContentBlock.vue
│   │   │   ├── LogoSpiral.vue
│   │   │   ├── ColorModeToggle.vue
│   │   │   └── VanillaTilt.vue
│   ├── composables/
│   │   ├── useEvents.ts
│   │   ├── useSpeakers.ts
│   │   ├── useSponsors.ts
│   │   └── usePageMeta.ts
│   └── app.ts (Inertia setup)
```

#### Steps

- [ ] **4.1** Set up Inertia + Vue structure
  - Configure inertia_layout.edge
  - Set up app.ts with Vue 3
  - Configure @inertiajs/vue3
  - Set up global components registration

- [ ] **4.2** Migrate base components
  - Copy BaseButton, BaseCard, BaseHeading
  - Remove Nuxt-specific code
  - Update to use Inertia page props
  - Test with Inertia renderer

- [ ] **4.3** Migrate layout components
  - Header.vue: Navigation menu
  - Footer.vue: Links, social media
  - LayoutBackdrop.vue: Background wrapper
  - Replace NuxtLink with InertiaLink
  - Update image paths

- [ ] **4.4** Migrate home page and components
  - index.vue
  - HomeHero.vue
  - HomeSponsorCalendar.vue
  - HomeLatestMeetup.vue
  - HomeFeaturedSpeakers.vue
  - HomeSocialPresence.vue
  - HomeStatsCounter.vue
  - Connect to Adonis controllers

- [ ] **4.5** Migrate event pages and components
  - events/index.vue
  - events/[id].vue
  - EventCard.vue
  - EventList.vue
  - EventSingle.vue
  - SessionCard.vue
  - AddToCalendar.vue
  - Fetch data from EventsController

- [ ] **4.6** Migrate speaker pages and components
  - speakers/index.vue
  - speakers/[id].vue
  - SpeakerCard.vue
  - SpeakerList.vue
  - Connect to SpeakersController

- [ ] **4.7** Migrate sponsors page and components
  - sponsors.vue
  - SponsorCard.vue
  - SponsorList.vue
  - Connect to SponsorsController

- [ ] **4.8** Migrate team page and components
  - team.vue
  - TeamMemberCard.vue
  - TeamList.vue
  - Connect to TeamController

- [ ] **4.9** Migrate static pages (markdown files)
  - about.vue: Render frontendmu-nuxt/content/about.md
  - branding.vue: Render frontendmu-nuxt/content/branding.md
  - faq.vue: Render frontendmu-nuxt/content/faq.md
  - sponsor-us.vue: Render frontendmu-nuxt/content/sponsor-us.md
  - Use markdown rendering library (marked or similar)

- [ ] **4.10** Migrate shared components
  - BackgroundShapes.vue
  - ContentBlock.vue
  - LogoSpiral.vue
  - ColorModeToggle.vue
  - VanillaTilt.vue

- [ ] **4.11** Create composables
  - useEvents.ts: Fetch events, filter events
  - useSpeakers.ts: Fetch speakers, speaker profiles
  - useSponsors.ts: Fetch sponsors, by type
  - usePageMeta.ts: Set page titles, meta tags

- [ ] **4.12** Set up dark mode
  - Configure TailwindCSS dark mode
  - Migrate ColorModeToggle component
  - Persist preference in localStorage
  - Apply to body/class

- [ ] **4.13** Test all pages
  - Navigate through all routes
  - Verify data rendering
  - Check responsiveness
  - Test links and navigation

**Completion Criteria**: ✓ All pages migrated, navigation works, data displays correctly

---

### Phase 5: Asset Management & Images ⏳

**Status**: ❌ Not Started
**Goal**: Set up image handling and asset storage

#### Steps

- [ ] **5.1** Configure image storage
  - Set up public/uploads directory structure
  - Create directories: events, sponsors, speakers, galleries
  - Configure image paths in .env

- [ ] **5.2** Migrate sponsor logos
  - Download logos from Directus/CDN
  - Save to public/uploads/sponsors/
  - Update database with file paths
  - Create optimized versions (webp, avif)

- [ ] **5.3** Migrate speaker avatars
  - Download from GitHub/avatars.githubusercontent.com
  - Save to public/uploads/speakers/
  - Update database with file paths
  - Handle missing avatars

- [ ] **5.4** Migrate event photos
  - Download from photos-raw.json source
  - Save to public/uploads/galleries/
  - Update database with file paths
  - Handle missing photos

- [ ] **5.5** Set up image optimization
  - Install and configure @adonisjs/vite for image processing
  - Create responsive image components
  - Implement lazy loading
  - Add WebP conversion

- [ ] **5.6** Configure CDN (optional but recommended)
  - Set up Cloudflare or Vercel for images
  - Update asset URLs in database
  - Configure cache headers

- [ ] **5.7** Test all images
  - Verify all images load
  - Check alt tags
  - Test responsive behavior

**Completion Criteria**: ✓ All images migrated and accessible, optimization working

---

### Phase 6: SEO & Metadata ⏳

**Status**: ❌ Not Started
**Goal**: Implement comprehensive SEO and social sharing

#### Steps

- [ ] **6.1** Configure base metadata
  - Set site name, URL in config
  - Configure default meta tags
  - Add Open Graph tags
  - Add Twitter Card tags

- [ ] **6.2** Create SEO composable
  - Set page titles dynamically
  - Update meta descriptions
  - Add canonical URLs
  - Handle structured data (JSON-LD)

- [ ] **6.3** Implement event structured data
  - Create Event JSON-LD
  - Add to event pages
  - Test with Google Rich Results Test

- [ ] **6.4** Implement person structured data
  - Create Person JSON-LD for speakers
  - Add to speaker pages
  - Test with Rich Results Test

- [ ] **6.5** Add sitemap
  - Generate sitemap.xml dynamically
  - Include all pages, events, speakers
  - Add to robots.txt

- [ ] **6.6** Configure robots.txt
  - Allow all bots
  - Disallow admin routes (future)
  - Add sitemap reference

- [ ] **6.7** Set up RSS feed
  - Generate RSS for events
  - Add RSS autodiscovery tags

**Completion Criteria**: ✓ SEO tags working, sitemap generated, structured data valid

---

### Phase 7: Deployment & Production Setup ⏳

**Status**: ❌ Not Started
**Goal**: Deploy to production and configure monitoring

#### Steps

- [ ] **7.1** Prepare for deployment
  - Create production .env file
  - Set up environment variables
  - Configure PostgreSQL connection
  - Set up database migrations for production

- [ ] **7.2** Choose deployment platform
  - Options: Vercel, Railway, Fly.io, DigitalOcean
  - Create deployment pipeline
  - Configure build process

- [ ] **7.3** Set up production database
  - Create PostgreSQL instance
  - Run migrations
  - Run data migration scripts
  - Verify data integrity

- [ ] **7.4** Configure SSL and security
  - Set up HTTPS (Let's Encrypt)
  - Configure CORS
  - Set up rate limiting
  - Configure Helmet headers

- [ ] **7.5** Set up monitoring
  - Configure logging (Pino)
  - Set up error tracking (Sentry)
  - Add uptime monitoring
  - Configure performance monitoring

- [ ] **7.6** Set up backups
  - Automate database backups
  - Backup uploaded files
  - Test restore process
  - Document backup procedures

- [ ] **7.7** Deploy to production
  - Push to production branch
  - Trigger deployment
  - Run smoke tests
  - Monitor for errors

- [ ] **7.8** Configure CDN
  - Set up Cloudflare (optional)
  - Configure caching rules
  - Set up page rules
  - Test cache invalidation

**Completion Criteria**: ✓ Site live on production, backups running, monitoring active

---

### Phase 8: Testing & QA ⏳

**Status**: ❌ Not Started
**Goal**: Comprehensive testing of all features

#### Steps

- [ ] **8.1** Manual testing checklist
  - [ ] Home page loads
  - [ ] All navigation links work
  - [ ] Event pages display correctly
  - [ ] Speaker profiles load
  - [ ] Sponsors page works
  - [ ] Team page displays
  - [ ] All images load
  - [ ] Dark mode toggle works
  - [ ] Responsive design tested on mobile
  - [ ] All external links open correctly
  - [ ] SEO meta tags present

- [ ] **8.2** Cross-browser testing
  - Chrome
  - Firefox
  - Safari
  - Edge
  - Mobile browsers

- [ ] **8.3** Performance testing
  - Run Lighthouse audit
  - Check Core Web Vitals
  - Optimize slow pages
  - Test with slow 3G

- [ ] **8.4** Accessibility testing
  - Check color contrast
  - Test screen reader compatibility
  - Keyboard navigation
  - Alt tags on all images

- [ ] **8.5** Load testing
  - Test with high concurrent users
  - Monitor database queries
  - Check response times
  - Identify bottlenecks

**Completion Criteria**: ✓ All tests pass, performance scores good, accessibility compliant

---

### Phase 9: Documentation & Handover ⏳

**Status**: ❌ Not Started
**Goal**: Complete documentation for future maintenance

#### Steps

- [ ] **9.1** Update README
  - Add project overview
  - Document tech stack
  - Add setup instructions
  - Document deployment process

- [ ] **9.2** Create contribution guide
  - How to add new events
  - How to add speakers
  - How to update sponsors
  - How to manage static content

- [ ] **9.3** Document database schema
  - Create ER diagram
  - Document table relationships
  - Add field descriptions

- [ ] **9.4** Create troubleshooting guide
  - Common issues and solutions
  - Migration rollback procedures
  - Backup restoration steps

- [ ] **9.5** Document monorepo structure
  - Explain package dependencies
  - Document build process
  - Update root package.json scripts

- [ ] **9.6** Clean up old code
  - Archive or remove frontendmu-astro
  - Mark frontendmu-nuxt as deprecated
  - Update CI/CD if needed

**Completion Criteria**: ✓ Documentation complete, project ready for handover

---

## Phase 2: Authentication & RSVP (Future) 🔮

**Status**: ❌ Not Planned
**Prerequisites**: Phase 0-9 complete

This phase will implement full auth and RSVP system, replacing external Directus integration.

#### Tables to Add (Future)

```sql
-- Auth users (separate from public users)
auth_users {
  id: uuid primary
  email: string unique not null
  password: string
  provider: string (google, github)
  external_identifier: string
  created_at: timestamp
}

-- RSVPs table
rsvps {
  id: uuid primary
  event_id: uuid foreign -> events.id
  user_id: uuid foreign -> auth_users.id
  status: enum('confirmed', 'cancelled', 'waitlist')
  meal_preference: string
  transport_mode: string
  is_public: boolean default true
  verified: boolean default false
  qr_code: string
  created_at: timestamp
}

-- Attendees table (for check-in)
attendees {
  id: uuid primary
  rsvp_id: uuid foreign -> rsvps.id
  checked_in_at: timestamp
  checked_in_by: uuid foreign -> users.id
}
```

#### Steps (High Level)

- [ ] **A1** Set up AdonisJS auth
  - Configure @adonisjs/auth
  - Set up user authentication
  - Add social login (GitHub, Google)
  - Implement session management

- [ ] **A2** Create RSVP system
  - Add rsvp and attendees tables
  - Create RSVPController
  - Build RSVP forms
  - Add RSVP management for organizers

- [ ] **A3** Create attendee management
  - Add check-in system
  - QR code generation
  - Attendee verification

- [ ] **A4** Build admin panel
  - Event management
  - Speaker management
  - Sponsor management
  - RSVP/attendee dashboard
  - Content management (pages)

- [ ] **A5** Email notifications
  - RSVP confirmations
  - Event reminders
  - Welcome emails
  - Account verification

---

## Progress Tracking

### Overall Progress: ~40%

- [x] Phase 0: Project Setup & Foundation (4/4 steps) - COMPLETED
- [x] Phase 1: Database Schema (10/10 steps) - COMPLETED
- [x] Phase 2: Data Migration (10/10 steps) - COMPLETED
- [ ] Phase 3: Core Controllers (0/8 steps) - IN PROGRESS
- [x] Phase 4: Vue Components (12/13 steps) - 92% COMPLETED
- [ ] Phase 5: Asset Management (0/7 steps)
- [ ] Phase 6: SEO & Metadata (0/7 steps)
- [ ] Phase 7: Deployment (0/8 steps)
- [ ] Phase 8: Testing & QA (0/5 steps)
- [ ] Phase 9: Documentation (0/6 steps)

### Phase 4 Progress Details

Completed:
- [x] 4.1 Set up Inertia + Vue structure
- [x] 4.2 Migrate base components (BaseButton, BaseCard, BaseHeading)
- [x] 4.3 Migrate layout components (Navigation, Footer, LayoutBackdrop, Menu, Logo, LeftMenu)
- [x] 4.4 Migrate home page and components
- [x] 4.5 Migrate event pages (meetups/index, meetups/show, EventCard)
- [x] 4.6 Migrate speaker pages (speakers/index, speakers/show)
- [x] 4.7 Migrate sponsors page
- [x] 4.8 Migrate team page
- [x] 4.9 Migrate static pages (about, branding, community, sponsor-us)
- [x] 4.10 Migrate shared components (ColorModeToggle, BackgroundShapes, ContentBlock)
- [x] 4.11 Create composables (useMeetups, usePageMeta)
- [x] 4.12 Set up dark mode with Tailwind CSS 4
- [ ] 4.13 Test all pages

### Next Steps

1. Complete Phase 3: Create Controllers for all pages
2. Complete Phase 4.13: Test all pages
3. Continue with Phase 5: Asset Management

---

## Key Differences from Original Plans

### What Was Removed:
- ❌ Blog posts table → Keep as markdown files
- ❌ Brand assets table → Keep as static files
- ❌ Contributors table → Fetch from GitHub API
- ❌ Event galleries table → Direct event_photos table
- ❌ Separate speaker/community/organizer tables → Unified users table with roles
- ❌ Sponsor types table → JSONB in sponsors table

### What Was Improved:
- ✅ Unified users table with role-based access (simpler queries)
- ✅ JSONB for sponsor types (more flexible, no migrations needed)
- ✅ Direct event_photos table (simpler structure, less joins)
- ✅ Static content rendered as markdown (no database needed)
- ✅ Contributors fetched from GitHub (always up-to-date)
- ✅ Cleaner database schema (8 tables vs 13-15 in other plans)

---

## Database Schema Summary

```
┌─────────────────────────────────────────────────────────┐
│                  CORE TABLES                        │
├─────────────────────────────────────────────────────────┤
│ users                                                 │
│   - id (UUID, PK)                                  │
│   - name, email, github_username, avatar_url         │
│   - role (admin/organizer/speaker/community_member)   │
│   - bio, linkedin_url, twitter_url, website_url      │
│   - featured, created_at, updated_at                  │
├─────────────────────────────────────────────────────────┤
│ events                                                │
│   - id (UUID, PK)                                  │
│   - title, description, location, venue               │
│   - event_date, start_time, end_time                │
│   - attendee_count, seats_available                  │
│   - accepting_rsvp, rsvp_closing_date               │
│   - status, created_at, updated_at                  │
├─────────────────────────────────────────────────────────┤
│ sessions                                              │
│   - id (UUID, PK)                                  │
│   - event_id (FK), title, description, order          │
│   - created_at, updated_at                          │
├─────────────────────────────────────────────────────────┤
│ session_speakers (pivot)                             │
│   - session_id (FK), speaker_id (FK)                 │
├─────────────────────────────────────────────────────────┤
│ sponsors                                              │
│   - id (UUID, PK)                                  │
│   - name, website, description                      │
│   - logo_url, logomark_url                           │
│   - sponsor_types (JSONB: ['lunch', 'venue'])       │
│   - darkbg, status, created_at, updated_at          │
├─────────────────────────────────────────────────────────┤
│ event_sponsors (pivot)                               │
│   - event_id (FK), sponsor_id (FK)                   │
├─────────────────────────────────────────────────────────┤
│ event_photos                                          │
│   - id (UUID, PK)                                  │
│   - event_id (FK), photo_url, caption, order         │
│   - created_at                                     │
├─────────────────────────────────────────────────────────┤
│ pages (dynamic content)                               │
│   - id (UUID, PK)                                  │
│   - slug (unique), title, content (markdown)          │
│   - meta_description, status, created_at, updated_at   │
└─────────────────────────────────────────────────────────┘
```

**Static Content (No Database):**
- About page → `frontendmu-nuxt/content/about.md`
- Branding page → `frontendmu-nuxt/content/branding.md`
- FAQ page → `frontendmu-nuxt/content/faq.md`
- Sponsor us page → `frontendmu-nuxt/content/sponsor-us.md`
- Code of conduct → `frontendmu-nuxt/content/CODE_OF_CONDUCT.md`
- Contributors → Fetched from GitHub API

---

## Risk Mitigation

### Potential Issues & Solutions

1. **Data Loss During Migration**
   - ✅ Solution: Multiple backups before migration
   - ✅ Verification script to compare counts
   - ✅ Rollback procedures documented

2. **Performance Issues with Large Events**
   - ✅ Solution: Implement pagination
   - ✅ Add database indexes
   - ✅ Use eager loading to prevent N+1 queries

3. **Image Migration Complexity**
   - ✅ Solution: Automate with scripts
   - ✅ Handle missing images gracefully
   - ✅ Create placeholder images

4. **SEO Impact During Migration**
   - ✅ Solution: Keep same URL structure
   - ✅ Implement proper redirects
   - ✅ Maintain meta tags

5. **Deployment Complexity**
   - ✅ Solution: Start with simple deployment (Vercel/Railway)
   - ✅ Document deployment process
   - ✅ Test in staging first

---

## Resources

- [AdonisJS Documentation](https://docs.adonisjs.com/)
- [Inertia.js Documentation](https://inertiajs.com/)
- [Vue 3 Documentation](https://vuejs.org/)
- [TailwindCSS 4 Documentation](https://tailwindcss.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Reference Project](/Users/sun/Projects/github.com/MrSunshyne/adonis-102)
- [Current Nuxt Project](packages/frontendmu-nuxt/)
- [Data Source](packages/frontendmu-data/)

---

## Changelog

| Date       | Change | Notes |
| ---------- | ------- | ------ |
| 2025-01-05 | Created | Refined plan from GLM.md, plan.md, and bigpickle.md |
| 2025-01-05 | Removed blog | Blog posts remain as static markdown files |
| 2025-01-05 | Removed brand assets | Brand assets remain as static files |
| 2025-01-05 | Simplified schema | 8 tables instead of 13+ |

---

**Last Updated**: 2025-01-05
