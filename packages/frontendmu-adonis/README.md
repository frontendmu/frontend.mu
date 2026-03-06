# frontend.mu (AdonisJS)

The backend and SSR frontend for frontend.mu, built with AdonisJS 6, Inertia.js, and Vue 3.

## Prerequisites

- Node.js 20+
- pnpm

## Local Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Copy environment file
cp .env.example .env

# Start the dev server
node ace serve --hmr
```

That's it. The repo includes `database/db.local.sqlite3` — a SQLite database pre-seeded with events, sponsors, sessions, and speaker data. No database setup required.

### Dev Admin Account

The local database includes a superadmin account:

- **Email:** `rajnikant@super.com`
- **Password:** `password1234`

### Environment

The `DB_DATABASE` env var controls which SQLite file to use:

| Value | Purpose |
|---|---|
| `database/db.local.sqlite3` | Local dev — committed to repo, has seed data, no sensitive user info |
| `tmp/db.production.sqlite3` | Production — gitignored, contains real user data |

### Running Migrations

```bash
node ace migration:run
```

### Regenerating the Local Dev Database

If the schema or production data changes (new events, sponsors, etc.):

```bash
# 1. Pull the production DB from the server
scp user@your-server:/path/to/tmp/db.production.sqlite3 tmp/db.production.sqlite3

# 2. Export latest data to JSON
npx tsx database/scripts/export_sqlite_data.ts

# 3. Reset the local dev DB schema
DB_DATABASE=database/db.local.sqlite3 node ace migration:fresh

# 4. Generate the local dev DB (imports speakers, events, sponsors + creates dummy users/RSVPs)
npx tsx database/scripts/generate_local_db.ts
```

### Database Backup & Restore

```bash
# Create a backup (saved to database/backups/)
node ace db:backup

# Restore the latest backup
node ace db:restore

# Restore a specific backup
node ace db:restore database/backups/db_backup_20260306T171026.sqlite3
```

## Production (Docker + Caddy)

```bash
# Clone the repo on your VPS
git clone <repo-url>
cd frontend.mu/packages/frontendmu-adonis

# Create .env with production values
cp .env.example .env
# Edit .env: set APP_KEY, DOMAIN, GOOGLE_CLIENT_ID, etc.

# Copy the production database (first deploy only)
scp tmp/db.production.sqlite3 user@your-server:frontend.mu/packages/frontendmu-adonis/tmp/

# Start everything
DOMAIN=coders.mu docker compose up -d --build

# Run migrations (after deploy or schema changes)
docker compose exec app node ace migration:run --force

# Backup the database
docker compose exec app node ace db:backup
```

Caddy automatically handles HTTPS via Let's Encrypt. The SQLite database is persisted in a Docker volume (`app_data`).

### Updating

```bash
git pull
docker compose up -d --build
docker compose exec app node ace migration:run --force
```
