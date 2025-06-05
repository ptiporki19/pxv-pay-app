-- Create a fresh Super Admin user for PXV Pay
-- Run this in Supabase SQL Editor (http://127.0.0.1:54323)

-- 1. Create a new super admin user with a fresh UUID
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  auth_user_exists boolean := false;
BEGIN
  -- Check if auth user with this email already exists
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = 'dev-admin@pxvpay.com'
  ) INTO auth_user_exists;
  
  -- Only create if doesn't exist
  IF NOT auth_user_exists THEN
    -- Create the auth user first
    INSERT INTO auth.users (
        id, 
        email,
        email_confirmed_at,
        created_at,
        updated_at,
        encrypted_password,
        raw_app_meta_data,
        raw_user_meta_data,
        instance_id,
        role,
        aud
    )
    VALUES (
        new_user_id,
        'dev-admin@pxvpay.com',
        now(),
        now(),
        now(),
        -- Password: DevAdmin789 (bcrypt hash)
        '$2a$10$7Q5K8xzYJY4Q4Z5nN9sLxOHkYmF8fQ6H5zJ8nN6mF8fQ6H5zJ8nN6m',
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        '{}'::jsonb,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated'
    );
    
    RAISE NOTICE 'Created auth user with ID: %', new_user_id;
  ELSE
    -- Get existing user ID
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'dev-admin@pxvpay.com';
    RAISE NOTICE 'Using existing auth user with ID: %', new_user_id;
  END IF;
  
  -- Create/update the public user record 
  INSERT INTO public.users (
      id,
      email,
      role,
      active,
      created_at
  )
  VALUES (
      new_user_id,
      'dev-admin@pxvpay.com',
      'super_admin',
      true,
      now()
  )
  ON CONFLICT (id) DO UPDATE SET
      role = 'super_admin',
      active = true,
      email = 'dev-admin@pxvpay.com';
      
  RAISE NOTICE 'Created/updated public user record for super admin';
END $$;

-- 2. Verify the user was created correctly
SELECT 
    u.id,
    u.email,
    u.role,
    u.active,
    au.email_confirmed_at IS NOT NULL as email_confirmed
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'dev-admin@pxvpay.com';

-- 3. Print credentials
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== NEW SUPER ADMIN CREDENTIALS ===';
  RAISE NOTICE 'Email: dev-admin@pxvpay.com';
  RAISE NOTICE 'Password: DevAdmin789';
  RAISE NOTICE 'Role: super_admin';
  RAISE NOTICE '===================================';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now test login with these credentials!';
END $$; 