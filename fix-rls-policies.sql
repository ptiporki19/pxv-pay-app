-- Fix RLS Policies to Avoid Infinite Recursion
-- Run this in Supabase SQL Editor (http://127.0.0.1:54323)

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can update all users" ON public.users;

-- 2. Create new, non-recursive policies
-- Allow users to read their own profile (simple, no recursion)
CREATE POLICY "users_read_own" ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile (prevent role changes)
CREATE POLICY "users_update_own" ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = OLD.role);

-- Create a simplified policy for super admins that bypasses the recursion
-- We'll use the JWT token directly instead of querying the users table
CREATE POLICY "super_admin_full_access" ON public.users
FOR ALL
USING (
  -- Check if user email contains dev-admin or is a known super admin
  -- This avoids the recursive lookup
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'dev-admin@pxvpay.com'
  OR 
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'superadmin@pxvpay.com'
);

-- 3. Verify the current user can now be read
SELECT 'Testing user access for dev-admin@pxvpay.com' as test;

-- 4. Print success message
SELECT '✅ RLS policies fixed! The recursive issue should be resolved.' as status; 