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
# 1. Pull the production DB and uploads from the server
scp user@your-server:/path/to/tmp/db.production.sqlite3 tmp/db.production.sqlite3
scp -r user@your-server:/path/to/public/uploads/ public/uploads/

# 2. Export latest data to JSON
npx tsx database/scripts/export_sqlite_data.ts

# 3. Reset the local dev DB schema
DB_DATABASE=database/db.local.sqlite3 node ace migration:fresh

# 4. Generate the local dev DB (imports speakers, events, sponsors + creates dummy users/RSVPs)
npx tsx database/scripts/generate_local_db.ts
```

### Backup & Restore

Backups include both the SQLite database and uploaded files (sponsor logos, etc.).

```bash
# On the server: create a backup
docker compose exec app node ace db:backup

# On the server: restore the latest backup
docker compose exec app node ace db:restore

# On the server: restore a specific backup by timestamp
docker compose exec app node ace db:restore 20260306T171026
```

### Pulling Production Data Locally

```bash
# Pull uploaded files (sponsor logos, etc.)
scp -r user@your-server:/path/to/public/uploads/ public/uploads/

# Pull the production database
scp user@your-server:/path/to/tmp/db.production.sqlite3 tmp/db.production.sqlite3

# Or pull a backup archive instead
ssh user@your-server "cd /path/to && docker compose exec app node ace db:backup"
scp -r user@your-server:/path/to/database/backups/ database/backups/
```

## Production (Docker + Caddy)

Deployments are automated via GitHub Actions. Pushing to the `production` branch builds a Docker image, pushes it to GHCR, and deploys to the VPS.

### First-Time Setup

```bash
# Clone the repo on your VPS
git clone -b production https://github.com/frontendmu/frontend.mu.git
cd frontend.mu/packages/frontendmu-adonis

# Create .env with production values
cp .env.example .env
# Edit .env: set APP_KEY, DOMAIN, GOOGLE_CLIENT_ID, etc.

# Copy the production database and uploads
mkdir -p tmp public/uploads
# (scp files from your local machine)

# Start everything
DOMAIN=coders.mu docker compose up -d

# Run migrations
docker compose exec app node ace migration:run --force
```

### Manual Deploy

```bash
git pull
docker pull ghcr.io/frontendmu/frontend.mu/adonis:latest
DOMAIN=coders.mu docker compose up -d
docker compose exec app node ace migration:run --force
```
