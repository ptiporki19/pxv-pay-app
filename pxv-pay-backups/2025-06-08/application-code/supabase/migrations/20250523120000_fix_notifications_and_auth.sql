-- Fix notifications table RLS issues and auth flow
-- Migration: 20250523120000_fix_notifications_and_auth.sql

-- 1. Fix notifications table access issues
-- Temporarily disable RLS to fix policies
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Drop all existing notification policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Re-enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create simple, working RLS policies for notifications
CREATE POLICY "Enable read access for users to their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for authenticated users"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users to their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users to their own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. Ensure proper trigger for user creation exists
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the user creation trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, active, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    'registered_user',
    true,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    created_at = EXCLUDED.created_at;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Ensure all other tables have proper basic access
-- Make sure payments table is accessible
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create basic payment policies if they don't exist
CREATE POLICY "Users can view payments" ON public.payments
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert payments" ON public.payments  
FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Add a function to create welcome notifications for new users
CREATE OR REPLACE FUNCTION public.create_welcome_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, created_at)
  VALUES (
    NEW.id,
    'Welcome to PXV Pay!',
    'Your account has been created successfully. Start by exploring your dashboard.',
    'info',
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for welcome notifications
DROP TRIGGER IF EXISTS create_welcome_notification_trigger ON public.users;
CREATE TRIGGER create_welcome_notification_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_welcome_notification();

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.payment_methods TO authenticated;
GRANT ALL ON public.countries TO authenticated;
GRANT ALL ON public.currencies TO authenticated; 