-- Test script to verify Supabase database integration
-- This script can be run against your local Supabase instance to verify setup

-- 1. Check if our tables were created properly
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles');
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'merchants');
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments');
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications');
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'countries');
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'currencies');
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_methods');
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs');

-- 2. Check if realtime is enabled for our tables
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- 3. Check if Row Level Security is enabled for our tables
SELECT
    table_name,
    CASE WHEN rowsecurity = true THEN 'Enabled' ELSE 'Disabled' END as rls_status
FROM
    pg_tables
WHERE
    schemaname = 'public'
    AND table_name IN ('profiles', 'merchants', 'payments', 'notifications', 'countries', 'currencies', 'payment_methods', 'audit_logs');

-- 4. Check if our RLS policies are set up
SELECT 
    table_name, 
    policy_name, 
    permissive, 
    WITH_CHECK
FROM 
    pg_policies 
WHERE 
    schemaname = 'public'
ORDER BY 
    table_name, policy_name;

-- 5. Check if our trigger functions are set up
SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as result_type,
    pg_get_function_arguments(p.oid) as argument_data_types
FROM 
    pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE 
    n.nspname = 'public'
    AND p.proname IN ('create_payment_notification', 'audit_log_changes', 'update_timestamp');

-- 6. Check if our triggers are set up
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM 
    pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE 
    n.nspname = 'public'
    AND NOT t.tgisinternal;

-- 7. Count the number of records in each table to verify our seed data was loaded
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'merchants', COUNT(*) FROM merchants
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'countries', COUNT(*) FROM countries
UNION ALL
SELECT 'currencies', COUNT(*) FROM currencies
UNION ALL
SELECT 'payment_methods', COUNT(*) FROM payment_methods
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;

-- 8. Test the payment notification trigger by updating a payment
-- First get a payment id if one exists
SELECT id FROM payments LIMIT 1;

-- Then you can manually update it with:
-- UPDATE payments SET status = 'completed' WHERE id = '<payment_id>';

-- Then verify a notification was created:
-- SELECT * FROM notifications WHERE data->>'payment_id' = '<payment_id>';

-- 9. Verify extension setup
SELECT extname, extversion FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- 10. Verify user roles and permissions for supabase_admin
SELECT r.rolname, r.rolsuper, r.rolinherit, r.rolcreaterole, r.rolcanlogin
FROM pg_catalog.pg_roles r
WHERE r.rolname = 'postgres'; 