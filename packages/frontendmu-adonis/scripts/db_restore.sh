#!/bin/bash

# Load environment variables
source .env

# Find the most recent backup file
BACKUP_FILE=$(ls -t database/backups/frontendmu_dev_backup_*.sql | head -1)

if [ -z "$BACKUP_FILE" ]; then
    echo "No backup files found."
    exit 1
fi

# Prompt user for confirmation
read -p "Restore database from $BACKUP_FILE? (y/N) " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "Restore cancelled."
    exit 0
fi

# Perform database restore
PGPASSWORD=$DB_PASSWORD psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_DATABASE" \
    -f "$BACKUP_FILE"

echo "Backup restored: $BACKUP_FILE"