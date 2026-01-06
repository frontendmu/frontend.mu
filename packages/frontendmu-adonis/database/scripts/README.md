# Database Scripts

This directory contains scripts for data migration and verification during the Nuxt → AdonisJS migration.

## Prerequisites

1. **Database Setup**: Ensure PostgreSQL is running and the database is created
2. **Environment Variables**: Set up `.env` with database connection details
3. **Dependencies**: Install all packages with `pnpm install`
4. **Build**: Run `node ace build` if needed

## Scripts Overview

### migrate_simple.js
**Purpose**: Migrate all data from JSON files to PostgreSQL database using raw SQL

**Data Sources**:
- `packages/frontendmu-data/data/people.js` - Organizers and community members
- `packages/frontendmu-data/data/speakers-profile.json` - Speaker profiles
- `packages/frontendmu-data/data/sponsors.js` - Sponsor information (embedded in script)
- `packages/frontendmu-data/data/contributors.json` - GitHub contributors

**What it migrates**:
- ✅ Users (organizers, community members, speakers from contributors)
- ✅ Events (sample events since meetups-raw.json is empty)
- ✅ Sessions (sample sessions linked to events)
- ✅ Sponsors (from sponsors.js with sponsor types)
- ✅ Event-sponsor relationships
- ✅ Event photos (sample photos)
- ✅ Pages (sample pages)

**Usage**:
```bash
cd packages/frontendmu-adonis
node database/scripts/migrate_simple.js
```

### verify_simple.js
**Purpose**: Verify data integrity and provide migration statistics using raw SQL

**Checks performed**:
- Record counts in all tables
- Orphaned records (sessions/photos without valid events)
- User distribution by role
- Event status distribution
- Sponsor status
- Sample data preview
- Relationship integrity

**Usage**:
```bash
cd packages/frontendmu-adonis
node database/scripts/verify_simple.js
```

### clean_simple.js
**Purpose**: Clean all data from database tables for re-migration

**Usage**:
```bash
cd packages/frontendmu-adonis
node database/scripts/clean_simple.js
```

## Running Migrations

### Step 1: Set up database
```bash
# Create database (if not exists)
createdb frontendmu_dev

# The tables should already be created from the schema migrations in Phase 1
```

### Step 2: Clean database (if re-running)
```bash
cd packages/frontendmu-adonis
node database/scripts/clean_simple.js
```

### Step 3: Run data migration
```bash
cd packages/frontendmu-adonis
node database/scripts/migrate_simple.js
```

### Step 4: Verify migration
```bash
cd packages/frontendmu-adonis
node database/scripts/verify_simple.js
```

## Expected Output

After successful migration, you should see:
- Users: 17 records (6 community members + 11 speakers)
- Events: 46 (real events from meetups-raw.json)
- Sessions: 163 (real sessions with speakers)
- Sponsors: 5 (from sponsors data)
- Event Photos: 888+ (real photos from albums)
- Event Photos: 6 (3 photos per event)

## Troubleshooting

### Common Issues

1. **Database connection fails**
   - Check `.env` file has correct DB_* variables
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Module resolution errors**
   - Run `node ace build` first
   - Check TypeScript configuration

3. **Migration script fails**
   - Check database permissions
   - Ensure all models are created
   - Verify foreign key constraints

### Manual Verification

You can also verify manually:
```sql
-- Check table counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'sponsors', COUNT(*) FROM sponsors;

-- Check relationships
SELECT e.title, COUNT(s.id) as sessions
FROM events e
LEFT JOIN sessions s ON e.id = s.event_id
GROUP BY e.id, e.title;
```

## Data Sources

The migration scripts read from the `@frontendmu-data` package:
- Located at `packages/frontendmu-data/`
- Contains raw JSON/JS files from Directus export
- Some files may be empty (meetups-raw.json, photos-raw.json)
- Scripts handle missing data gracefully with sample data

## Next Steps

After successful migration:
1. Test the AdonisJS application
2. Create controllers to display migrated data
3. Migrate Vue components from Nuxt
4. Set up asset management for images