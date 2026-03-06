#!/bin/bash

# Load environment variables
source .env

# Prompt user for confirmation
read -p "Are you sure you want to clear the entire database? This will delete ALL data. (y/N) " confirm
if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "Database clear cancelled."
    exit 0
fi

# Terminate existing connections to the database
PGPASSWORD=$DB_PASSWORD psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE datname = '$DB_DATABASE' AND pid <> pg_backend_pid();"

# Drop the database
PGPASSWORD=$DB_PASSWORD psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "DROP DATABASE IF EXISTS \"$DB_DATABASE\";"

# Recreate the database
PGPASSWORD=$DB_PASSWORD psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "CREATE DATABASE \"$DB_DATABASE\";"

# Create UUID extension
PGPASSWORD=$DB_PASSWORD psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_DATABASE" \
    -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

echo "Database $DB_DATABASE has been cleared and recreated."