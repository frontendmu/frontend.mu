#!/bin/bash
set -e

# Create the database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    SELECT 'CREATE DATABASE frontendmu_dev'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'frontendmu_dev')\gexec
    
    -- Create UUID extension
    \c frontendmu_dev
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL