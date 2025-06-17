-- Test users query
SELECT COUNT(*) as total_users FROM public.users;

-- Check if users table exists
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users';

-- Check auth.users table
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- Sample of users data
SELECT id, email, role, active, created_at FROM public.users LIMIT 5;

-- Check what users exist with roles
SELECT email, role, active FROM public.users ORDER BY created_at DESC; 