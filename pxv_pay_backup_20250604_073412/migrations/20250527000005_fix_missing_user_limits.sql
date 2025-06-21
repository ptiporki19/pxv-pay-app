-- Fix missing user_limits trigger that's preventing auth user creation
-- The table exists but needs proper trigger for new users

-- The user_limits table already exists with the correct structure:
-- id, user_id, user_role, max_checkout_links, current_checkout_links, etc.

-- Create or replace the trigger function to initialize user limits for new users
CREATE OR REPLACE FUNCTION public.initialize_user_limits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_limits (
    user_id, 
    user_role,
    max_checkout_links,
    current_checkout_links,
    max_monthly_payments,
    current_monthly_payments,
    max_storage_mb,
    current_storage_mb,
    can_use_analytics,
    can_use_webhooks,
    can_customize_branding,
    can_export_data
  )
  VALUES (
    NEW.id, 
    'registered_user',
    5,  -- default max checkout links
    0,  -- initial checkout links count
    100, -- default max monthly payments
    0,   -- initial monthly payments count
    100, -- default max storage in MB
    0,   -- initial storage used
    true, -- can use analytics
    true, -- can use webhooks
    true, -- can customize branding
    true  -- can export data
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail auth user creation
    RAISE WARNING 'Failed to initialize user limits for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old trigger if it exists and create the new one
DROP TRIGGER IF EXISTS initialize_user_limits_trigger ON auth.users;
CREATE TRIGGER initialize_user_limits_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_limits();

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION public.initialize_user_limits() TO service_role;
GRANT EXECUTE ON FUNCTION public.initialize_user_limits() TO postgres;

SELECT 'user_limits trigger fixed. Auth user creation should now work!' as status; 