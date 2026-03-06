# User Import Strategy from Directus

## Overview

The current AdonisJS application has users imported from the `frontendmu-data` package, which only contains **public speaker/person data**. The actual registered users with authentication credentials are stored in the Directus database.

## Directus Database Tables to Export

You'll need to dump the following tables from Directus:

### 1. `directus_users` (Primary user table)
This contains authenticated users with:
- `id` (UUID)
- `email`
- `password` (hashed)
- `first_name`
- `last_name`
- `avatar`
- `role` (references directus_roles)
- `status` (active, invited, suspended, etc.)

### 2. `directus_roles` (User roles)
To map Directus roles to our app roles:
- `id`
- `name`
- `admin_access`

### 3. `Person` (Speaker/profile data)
Already exported, but may have additional fields in the full table:
- `id`
- `name`
- `github_account`
- `bio`
- `featured`
- Social links (linkedin, twitter, website)

### 4. `Rsvp` or attendance records (if they exist)
Check if there's a table tracking RSVPs to events.

## SQL Dump Commands

Run these on your Directus PostgreSQL database:

```sql
-- Export users (without password for security review first)
\copy (SELECT id, email, first_name, last_name, avatar, role, status, created_on FROM directus_users) TO 'directus_users.csv' WITH CSV HEADER;

-- Export roles
\copy (SELECT id, name, admin_access FROM directus_roles) TO 'directus_roles.csv' WITH CSV HEADER;

-- Export full Person table
\copy (SELECT * FROM "Person") TO 'directus_persons.csv' WITH CSV HEADER;

-- Check for RSVP/attendance table
\dt *rsvp*
\dt *attend*
\dt *registration*
```

Or use pg_dump for JSON format:
```bash
pg_dump -h localhost -U directus_user -d directus_db -t directus_users -t directus_roles -t "Person" --data-only --inserts > directus_export.sql
```

## Import Mapping

### Role Mapping (Directus → AdonisJS)

| Directus Role | AdonisJS Role |
|--------------|---------------|
| Administrator | superadmin |
| Editor/Organizer | organizer |
| Registered User | member |
| (no account) | viewer |

### User Field Mapping

| Directus Field | AdonisJS Field |
|----------------|----------------|
| id | id (preserve UUID) |
| email | email |
| password | password (re-hash or migrate) |
| first_name + last_name | name |
| avatar | avatarUrl |
| role (via lookup) | role |
| status | (map to active/inactive) |

### Person → User Merge

Many Person records may not have corresponding directus_users entries (speakers without accounts). The import should:

1. First import all `directus_users` as Users
2. Then merge `Person` data where IDs match
3. Create User records for Person entries without matching directus_users (as `member` role, no password)

## Import Script Location

Create the import script at:
```
packages/frontendmu-adonis/commands/import_directus_users.ts
```

## Password Migration Options

### Option 1: Reset all passwords
- Simpler but requires all users to reset
- Set password to null, require password reset on first login

### Option 2: Migrate Directus hashes
- Directus uses Argon2 by default
- AdonisJS uses Scrypt by default
- Would need to either:
  - Switch AdonisJS to Argon2
  - Create a dual-hash verification system
  - Re-hash on first successful login

### Option 3: Hybrid approach (Recommended)
- Import without passwords
- Allow users to "claim" their account via email verification
- Or implement "forgot password" flow for migration

## Data Files to Provide

Please export and provide these files:
1. `directus_users.json` - User accounts
2. `directus_roles.json` - Role definitions
3. `directus_persons.json` - Full Person table (with all fields)
4. Any RSVP/attendance data if it exists

## Security Considerations

1. **DO NOT** commit password hashes to the repository
2. Consider the import script as a one-time migration tool
3. Review user data for PII before committing
4. Consider GDPR implications for user data migration

## Next Steps

1. Dump the Directus database tables as described above
2. Share the exported JSON/CSV files
3. I'll create the import script that:
   - Reads the exported data
   - Maps and transforms the data
   - Inserts into the AdonisJS database
   - Handles conflicts (duplicate emails, etc.)
   - Reports on the import results
