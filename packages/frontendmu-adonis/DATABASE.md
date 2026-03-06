# Database Management Guide

This document provides instructions for managing the PostgreSQL database for the frontendmu-adonis application.

## Quick Reference

```bash
# Start/Stop Docker PostgreSQL
docker-compose up -d              # Start database container
docker-compose down               # Stop database container
docker-compose logs postgres      # View database logs

# Database Management Commands
node ace db:backup                # Backup current database
node ace db:restore               # Restore most recent backup
node ace db:restore /path/file.sql  # Restore specific backup
node ace db:clear                 # Clear database (WARNING: Deletes all data!)

# Migrations
node ace migration:run            # Run pending migrations
node ace migration:rollback       # Rollback last batch
node ace migration:status         # Check migration status
node ace migration:refresh        # Rollback all and re-run

# Create Superadmin User
node scripts/create_superadmin.js
```

## Docker PostgreSQL Setup

### Configuration

The application uses Docker PostgreSQL to ensure consistency across development environments.

**Container Details:**
- **Container Name:** `frontendmu-postgres-docker`
- **Image:** `postgres:15-alpine`
- **Host:** `localhost`
- **Port:** `5433` (mapped from 5432 to avoid conflicts)
- **Database:** `frontendmu_docker_dev`
- **Username:** `postgres`
- **Password:** `postgres`

### Starting the Database

```bash
# First time setup
docker-compose up -d

# The database will automatically:
# 1. Install the uuid-ossp extension
# 2. Create the frontendmu_docker_dev database
```

### Adminer (Database UI)

Access the database through a web interface at `http://localhost:8989`

**Login Credentials:**
- System: PostgreSQL
- Server: `postgres`
- Username: `postgres`
- Password: `postgres`
- Database: `frontendmu_docker_dev`

## Database Backup & Restore

### Backup Database

Create a timestamped SQL backup of the current database:

```bash
node ace db:backup
```

Backups are saved to `database/backups/` with the format:
```
frontendmu_docker_dev_backup_YYYYMMDDTHHMMSS.sql
```

**Note:** Backup files are automatically excluded from git via `.gitignore`.

### Restore Database

Restore the most recent backup:

```bash
node ace db:restore
```

Restore a specific backup file:

```bash
node ace db:restore database/backups/frontendmu_docker_dev_backup_20260108_123456.sql
```

**Warning:** Restoring will **drop** the existing database and recreate it from the backup.

### Clear Database

Drop and recreate an empty database:

```bash
node ace db:clear
```

**Warning:** This will **permanently delete all data**. Always backup before clearing!

After clearing, you'll need to:
1. Run migrations: `node ace migration:run`
2. Seed data (if needed)
3. Create superadmin: `node scripts/create_superadmin.js`

## Initial Setup Workflow

When setting up a new development environment:

```bash
# 1. Start Docker containers
docker-compose up -d

# 2. Wait for PostgreSQL to be ready (check logs)
docker-compose logs -f postgres

# 3. Run migrations
node ace migration:run

# 4. Create superadmin user
node scripts/create_superadmin.js

# 5. (Optional) Seed initial data
node ace db:seed

# 6. Verify setup
node ace serve --hmr
# Navigate to http://localhost:3333/login
# Login with: sandeep@ramgolam.com / #Password1234#
```

## Environment Variables

Ensure your `.env` file has the correct database configuration:

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=frontendmu_docker_dev
```

## Troubleshooting

### Cannot connect to database

1. Check if Docker container is running:
   ```bash
   docker ps | grep frontendmu-postgres
   ```

2. Check container logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify port 5433 is not in use:
   ```bash
   lsof -i :5433
   ```

### Database doesn't exist

The database should be created automatically. If not:

```bash
# Connect to PostgreSQL container
docker exec -it frontendmu-postgres-docker psql -U postgres

# Create database manually
CREATE DATABASE frontendmu_docker_dev;
\q
```

### Migration issues

Check migration status:
```bash
node ace migration:status
```

If migrations are out of sync, you may need to:
```bash
# Rollback all migrations
node ace migration:rollback --batch=0

# Re-run all migrations
node ace migration:run
```

### Backup/Restore fails

Ensure `pg_dump` and `psql` are installed on your system:

```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Verify installation
pg_dump --version
psql --version
```

## Data Migration from Local PostgreSQL

If you need to migrate from a local PostgreSQL instance:

```bash
# 1. Backup local database
pg_dump -h localhost -p 5432 -U postgres frontendmu_dev > local_backup.sql

# 2. Start Docker PostgreSQL
docker-compose up -d

# 3. Restore to Docker
PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres frontendmu_docker_dev < local_backup.sql
```

## Security Notes

- The default password (`postgres`) is for **development only**
- Never commit `.env` files to version control
- Use strong passwords in production
- Restrict database port access in production (use private networks)
- Regular backups are essential before any major changes

## Additional Resources

- [AdonisJS Database Documentation](https://docs.adonisjs.com/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)
