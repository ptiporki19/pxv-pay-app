-- Fix RLS policies for users table to ensure super admins can see all users

-- First, drop existing conflicting policies
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can update all users" ON public.users;

-- Recreate clean RLS policies
-- Policy 1: Users can view their own profile
CREATE POLICY "users_view_own" 
ON public.users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy 2: Super admins can view ALL users (this is the key fix)
CREATE POLICY "super_admin_view_all_users" 
ON public.users FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'super_admin'
  )
);

-- Policy 3: Users can update their own profile
CREATE POLICY "users_update_own" 
ON public.users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Super admins can update all users
CREATE POLICY "super_admin_update_all_users" 
ON public.users FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'super_admin'
  )
);

-- Policy 5: Allow inserts for new user registration (handled by trigger)
CREATE POLICY "allow_user_insert" 
ON public.users FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; 