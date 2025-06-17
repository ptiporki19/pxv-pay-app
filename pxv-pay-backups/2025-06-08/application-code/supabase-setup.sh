#!/bin/bash

# Initialize Supabase project
echo "Initializing Supabase project..."
npx supabase init

# Start Supabase services
echo "Starting local Supabase services..."
npx supabase start

# Display the keys needed for .env.local
echo ""
echo "------------------------------------------------------------------------------"
echo "Add the following values to your .env.local file:"
echo "------------------------------------------------------------------------------"
npx supabase status | grep "SUPABASE_URL\|SUPABASE_ANON_KEY\|SUPABASE_SERVICE_ROLE_KEY"
echo "------------------------------------------------------------------------------"
echo ""

echo "Create your .env.local file with these values to connect to your local Supabase instance." 