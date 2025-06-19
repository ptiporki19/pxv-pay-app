-- SQL Script to create test users for PXV Pay
-- Run this in the Supabase SQL Editor (http://127.0.0.1:54323)

-- 1. Create a super admin user
DO $$
DECLARE
  user_id uuid := gen_random_uuid();
BEGIN
  -- First, create the auth user
  INSERT INTO auth.users (
      id, 
      email,
      email_confirmed_at,
      created_at,
      updated_at,
      encrypted_password,
      raw_app_meta_data
  )
  VALUES (
      user_id,
      'superadmin@pxvpay.com',
      now(),
      now(),
      now(),
      -- Password: SuperAdmin456
      '$2a$10$5nO9Lqa4ClXXqYbXrLvs6uyaFuzxA.z81QKpgjIBn3qo19uqJ.mti',
      '{"provider": "email", "providers": ["email"]}'::jsonb
  )
  ON CONFLICT (email) DO NOTHING;
  
  -- Create the public user record 
  INSERT INTO public.users (
      id,
      email,
      role,
      active,
      created_at
  )
  VALUES (
      user_id,
      'superadmin@pxvpay.com',
      'super_admin',
      true,
      now()
  )
  ON CONFLICT (id) DO UPDATE SET
      role = 'super_admin',
      active = true;
END $$;

-- 2. Create a merchant user (registered_user role)
DO $$
DECLARE
  user_id uuid := gen_random_uuid();
BEGIN
  -- First, create the auth user
  INSERT INTO auth.users (
      id, 
      email,
      email_confirmed_at,
      created_at,
      updated_at,
      encrypted_password,
      raw_app_meta_data
  )
  VALUES (
      user_id,
      'merchant@pxvpay.com',
      now(),
      now(),
      now(),
      -- Password: Merchant123
      '$2a$10$KhBPXkT39sQGUgHSFp3NVeJXquWl0TP5GMjK5X9hN.3/3g9EE5Tpu',
      '{"provider": "email", "providers": ["email"]}'::jsonb
  )
  ON CONFLICT (email) DO NOTHING;
  
  -- Create the public user record 
  INSERT INTO public.users (
      id,
      email,
      role,
      active,
      created_at
  )
  VALUES (
      user_id,
      'merchant@pxvpay.com',
      'registered_user',
      true,
      now()
  )
  ON CONFLICT (id) DO UPDATE SET
      role = 'registered_user',
      active = true;
END $$;

-- 3. Print results
SELECT id, email, role FROM public.users WHERE email IN ('superadmin@pxvpay.com', 'merchant@pxvpay.com', 'admin@pxvpay.com'); 