-- Verify real-time configuration

-- Check publication configuration
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- Check which tables are in the publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Ensure our tables are in the publication
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.users, public.payments, public.notifications;

-- Check again to confirm
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename; 