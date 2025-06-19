#!/bin/bash

# Script to set up the database for PXV Pay
# This will apply migrations and seed data to the local Supabase instance

# Set variables
DB_URL="postgresql://postgres:postgres@localhost:54322/postgres"
MIGRATIONS_DIR="../supabase/migrations"
SEED_FILE="../supabase/seed.sql"
TEST_SCRIPT="./test-supabase-integration.sql"

# Make sure the script is executable
# chmod +x setup-db.sh

# Function to check if Supabase is running
check_supabase() {
  echo "Checking if Supabase is running..."
  if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI not found. Please install it first."
    echo "npm install -g supabase"
    exit 1
  fi
  
  # Check if we can connect to the database
  if ! psql "$DB_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo "Cannot connect to the database. Make sure Supabase is running."
    echo "Try running: supabase start"
    exit 1
  fi
  
  echo "Supabase is running."
}

# Function to apply migrations
apply_migrations() {
  echo "Applying migrations..."
  for migration in "$MIGRATIONS_DIR"/*.sql; do
    if [ -f "$migration" ]; then
      echo "Applying migration: $(basename "$migration")"
      if ! psql "$DB_URL" -f "$migration"; then
        echo "Failed to apply migration: $(basename "$migration")"
        exit 1
      fi
    fi
  done
  echo "All migrations applied successfully."
}

# Function to seed the database
seed_database() {
  echo "Seeding the database..."
  if [ -f "$SEED_FILE" ]; then
    if ! psql "$DB_URL" -f "$SEED_FILE"; then
      echo "Failed to seed the database."
      exit 1
    fi
    echo "Database seeded successfully."
  else
    echo "Seed file not found: $SEED_FILE"
    exit 1
  fi
}

# Function to test the database setup
test_database() {
  echo "Testing the database setup..."
  if [ -f "$TEST_SCRIPT" ]; then
    if ! psql "$DB_URL" -f "$TEST_SCRIPT"; then
      echo "Database test failed."
      exit 1
    fi
    echo "Database test completed successfully."
  else
    echo "Test script not found: $TEST_SCRIPT"
    exit 1
  fi
}

# Main script
echo "===== PXV Pay Database Setup ====="
check_supabase
apply_migrations
seed_database
test_database
echo "===== Database Setup Complete ====="
echo "You can now start using the PXV Pay application with Supabase." 