-- Fix infinite recursion in RLS policies for users table
-- The issue is that the super admin policy tries to query the users table from within the users table policy

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "users_view_own" ON public.users;
DROP POLICY IF EXISTS "super_admin_view_all_users" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "super_admin_update_all_users" ON public.users;
DROP POLICY IF EXISTS "allow_user_insert" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;

-- Create a simple policy that allows users to see their own profile
-- AND allows super admins to see all users without recursion
CREATE POLICY "users_select_policy" 
ON public.users FOR SELECT 
TO authenticated 
USING (
  -- Users can see their own profile
  auth.uid() = id 
  OR 
  -- Super admins can see all users (check by email to avoid recursion)
  auth.email() IN ('admin@pxvpay.com', 'dev-admin@pxvpay.com', 'superadmin@pxvpay.com')
);

-- Create update policy
CREATE POLICY "users_update_policy" 
ON public.users FOR UPDATE 
TO authenticated 
USING (
  -- Users can update their own profile
  auth.uid() = id 
  OR 
  -- Super admins can update all users
  auth.email() IN ('admin@pxvpay.com', 'dev-admin@pxvpay.com', 'superadmin@pxvpay.com')
)
WITH CHECK (
  -- Users can update their own profile
  auth.uid() = id 
  OR 
  -- Super admins can update all users
  auth.email() IN ('admin@pxvpay.com', 'dev-admin@pxvpay.com', 'superadmin@pxvpay.com')
);

-- Create insert policy for new user registration
CREATE POLICY "users_insert_policy" 
ON public.users FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; 