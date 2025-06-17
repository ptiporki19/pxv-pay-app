#!/bin/bash

# Get the Supabase DB container ID
CONTAINER_ID=$(docker ps | grep 'supabase_db_pxv' | awk '{print $1}')

if [ -z "$CONTAINER_ID" ]; then
  echo "Error: Supabase database container not found. Make sure it's running."
  exit 1
fi

echo "Found Supabase DB container: $CONTAINER_ID"

# Path to the SQL script
SQL_SCRIPT="./create-test-users.sql"

if [ ! -f "$SQL_SCRIPT" ]; then
  echo "Error: SQL script not found at $SQL_SCRIPT"
  exit 1
fi

echo "Executing SQL script to create test users..."

# Execute the SQL script inside the container
cat "$SQL_SCRIPT" | docker exec -i $CONTAINER_ID psql -U postgres -d postgres

echo "Done! Users have been created."
echo ""
echo "User credentials:"
echo "===================="
echo "Super Admin User:"
echo "Email: superadmin@pxvpay.com"
echo "Password: SuperAdmin456"
echo ""
echo "Merchant User:"
echo "Email: merchant@pxvpay.com"
echo "Password: Merchant123"
echo "====================" 