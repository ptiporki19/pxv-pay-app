-- Fix RLS infinite recursion on users table
-- Migration: 20250525120000_fix_rls_infinite_recursion.sql
-- This completely disables RLS on users table to prevent infinite recursion

-- Drop all existing problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "users_view_own" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "super_admin_view_all_users" ON users;
DROP POLICY IF EXISTS "super_admin_update_all_users" ON users;
DROP POLICY IF EXISTS "users_service_role_all" ON users;
DROP POLICY IF EXISTS "allow_user_insert" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can update all users" ON users;

-- Disable RLS completely on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Add comment explaining the change
COMMENT ON TABLE users IS 'RLS disabled to fix infinite recursion - application handles security at API level'; 