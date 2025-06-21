-- Sync missing users from auth.users to public.users
INSERT INTO public.users (id, email, role, active, created_at)
SELECT 
    au.id,
    au.email,
    'registered_user' as role,
    true as active,
    au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL AND au.email IS NOT NULL;

-- Add a function to activate/deactivate users  
CREATE OR REPLACE FUNCTION public.toggle_user_status(user_id UUID, new_status BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.users 
  SET active = new_status 
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy for the function
CREATE POLICY "Super admins can execute functions" 
ON public.users FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'super_admin'
));

-- Check the result
SELECT COUNT(*) as synced_users FROM public.users; 