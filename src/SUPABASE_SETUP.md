# Setting Up PXV Pay with Local Supabase

This guide will walk you through the process of setting up your local Supabase instance for PXV Pay development, ensuring all data is properly connected and real-time features work as expected.

## Prerequisites

1. A Supabase project (either local or cloud)
2. Supabase CLI installed (for local development)
3. PostgreSQL client (optional, for direct database interaction)

## Setup Steps

### 1. Environment Variables

Ensure your `.env.local` file contains the following Supabase-related variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Schema

Run the SQL script located at `src/sql/schema.sql` in your Supabase SQL editor to set up all necessary tables, RLS policies, and functions:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `src/sql/schema.sql`
4. Paste into the SQL Editor and run

Alternatively, if using Supabase CLI:

```bash
supabase db reset
```

### 3. Create a Super Admin User

After setting up the schema, register a user through the application, then elevate their privileges to super admin:

```sql
UPDATE public.users
SET role = 'super_admin'
WHERE email = 'your_email@example.com';
```

### 4. Enable Real-time for Tables

To ensure real-time functionality works properly, enable real-time for the following tables:

1. Go to your Supabase dashboard
2. Navigate to Database > Replication
3. Enable real-time for these tables:
   - `users`
   - `payments`
   - `notifications`

### 5. Test Data (Optional)

To populate your database with sample data, uncomment and run the sample data insertion section at the end of the schema.sql file.

## Verifying Setup

After completing the setup, you should be able to:

1. Register and log in
2. See real-time notifications
3. Create and process payments
4. All data should persist in your Supabase database

## Troubleshooting

### Row Level Security Issues

If you're having trouble accessing data, check:

1. RLS policies are correctly set up
2. You're authenticated properly
3. You have the correct role for the operation

### Real-time Not Working

If real-time updates aren't working:

1. Verify real-time is enabled for the tables
2. Check that your subscription channels match table names
3. Console log the actual payload in the subscription callback

### Database Connection Issues

If you can't connect to the database:

1. Verify your environment variables
2. Check Supabase service status
3. Try resetting your database password 