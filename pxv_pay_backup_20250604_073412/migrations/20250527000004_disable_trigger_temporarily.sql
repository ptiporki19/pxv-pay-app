-- Temporarily disable the trigger to allow auth user creation
-- We'll handle user profile creation manually in the application

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Keep the function but don't auto-trigger it
-- We can call it manually if needed

-- Ensure RLS allows manual inserts
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;

-- Create simple working policies
CREATE POLICY "users_select_policy" 
ON public.users FOR SELECT 
TO authenticated 
USING (
  auth.uid() = id 
  OR 
  auth.email() IN ('admin@pxvpay.com', 'dev-admin@pxvpay.com', 'superadmin@pxvpay.com')
);

CREATE POLICY "users_update_policy" 
ON public.users FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = id 
  OR 
  auth.email() IN ('admin@pxvpay.com', 'dev-admin@pxvpay.com', 'superadmin@pxvpay.com')
);

-- Simple insert policy that allows all
CREATE POLICY "users_insert_policy" 
ON public.users FOR INSERT 
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.users TO postgres;
GRANT ALL ON public.users TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Create a simplified manual user creation function for the app to use
CREATE OR REPLACE FUNCTION public.create_user_profile_simple(
  user_id UUID,
  user_email TEXT,
  user_role TEXT DEFAULT 'registered_user'
)
RETURNS JSON AS $$
BEGIN
  INSERT INTO public.users (id, email, role, created_at, active)
  VALUES (user_id, user_email, user_role::user_role, NOW(), true)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role;
  
  RETURN json_build_object('success', true, 'user_id', user_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_user_profile_simple TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile_simple TO service_role;

SELECT 'Trigger disabled. Auth user creation should now work. App will handle profile creation manually.' as status; 