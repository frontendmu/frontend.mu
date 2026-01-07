#!/bin/bash

# Load environment variables
source .env

# Create backups directory if it doesn't exist
mkdir -p database/backups

# Generate backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="database/backups/frontendmu_dev_backup_${TIMESTAMP}.sql"

# Perform database backup
PGPASSWORD=$DB_PASSWORD pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_DATABASE" \
    -f "$BACKUP_FILE"

echo "Backup created: $BACKUP_FILE"