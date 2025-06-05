-- Fix signup trigger function
-- This migration fixes the handle_new_user trigger that creates user profiles on signup

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved handle_new_user function with better error handling
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

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the function and trigger were created
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
END $$; 