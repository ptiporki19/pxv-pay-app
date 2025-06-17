-- Comprehensive signup fix migration
-- This migration addresses all potential issues with user signup

-- Step 1: Temporarily disable RLS to allow trigger to work
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop and recreate the trigger function with proper permissions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function with SECURITY DEFINER and proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user record into public.users table
  INSERT INTO public.users (id, email, role, created_at, active)
  VALUES (
    NEW.id, 
    NEW.email, 
    'registered_user',
    NOW(),
    true
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set proper ownership and permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Create application-level user creation function as backup
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_role TEXT DEFAULT 'registered_user'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  INSERT INTO public.users (id, email, role, created_at, active)
  VALUES (user_id, user_email, user_role::user_role, NOW(), true)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = NOW();
  
  SELECT json_build_object(
    'success', true,
    'user_id', user_id,
    'email', user_email,
    'role', user_role
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    SELECT json_build_object(
      'success', false,
      'error', SQLERRM
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions for the application function
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO service_role;

-- Step 4: Grant necessary table permissions
GRANT ALL ON public.users TO postgres;
GRANT ALL ON public.users TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Step 5: Re-enable RLS with comprehensive policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Super admins can view all users" 
ON public.users FOR SELECT 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = auth.uid() AND users.role = 'super_admin'
));

CREATE POLICY "Super admins can update all users" 
ON public.users FOR UPDATE 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = auth.uid() AND users.role = 'super_admin'
));

-- Allow inserts for service role (for triggers and admin operations)
CREATE POLICY "Enable insert for service role" 
ON public.users FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Allow inserts for authenticated users (for their own profile)
CREATE POLICY "Enable insert for authenticated users" 
ON public.users FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Allow inserts for anonymous users (for signup process)
CREATE POLICY "Enable insert for signup" 
ON public.users FOR INSERT 
TO anon 
WITH CHECK (true);

-- Step 6: Verify the setup
DO $$
BEGIN
  -- Check if function exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    RAISE NOTICE 'handle_new_user function created successfully';
  ELSE
    RAISE EXCEPTION 'handle_new_user function was not created';
  END IF;
  
  -- Check if trigger exists
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    RAISE NOTICE 'on_auth_user_created trigger created successfully';
  ELSE
    RAISE EXCEPTION 'on_auth_user_created trigger was not created';
  END IF;
  
  -- Check if application function exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_user_profile') THEN
    RAISE NOTICE 'create_user_profile function created successfully';
  ELSE
    RAISE EXCEPTION 'create_user_profile function was not created';
  END IF;
  
  RAISE NOTICE 'Comprehensive signup fix completed successfully';
END $$; 