-- Simple Database Restoration Migration
-- This migration only handles tables that actually exist

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- STORAGE BUCKETS SETUP
-- =============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('payment-method-icons', 'payment-method-icons', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
  ('user-avatars', 'user-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('checkout-assets', 'checkout-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
  ('theme-assets', 'theme-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'text/css'])
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE RLS POLICIES
-- =============================================

-- Payment method icons policies
DROP POLICY IF EXISTS "Payment method icons are publicly accessible" ON storage.objects;
CREATE POLICY "Payment method icons are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-method-icons');

DROP POLICY IF EXISTS "Users can upload payment method icons" ON storage.objects;
CREATE POLICY "Users can upload payment method icons"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-method-icons' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their payment method icons" ON storage.objects;
CREATE POLICY "Users can update their payment method icons"
ON storage.objects FOR UPDATE
USING (bucket_id = 'payment-method-icons' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete their payment method icons" ON storage.objects;
CREATE POLICY "Users can delete their payment method icons"
ON storage.objects FOR DELETE
USING (bucket_id = 'payment-method-icons' AND auth.role() = 'authenticated');

-- =============================================
-- ADMIN USER RESTORATION
-- =============================================

-- Create admin user in auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@pxvpay.com',
  crypt('admin123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "super_admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = NOW();

-- Create admin user profile in public.users table
INSERT INTO public.users (
  id,
  email,
  role,
  active,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@pxvpay.com',
  'super_admin',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET 
  role = 'super_admin',
  active = true;

-- =============================================
-- BASIC RLS POLICIES FOR EXISTING TABLES
-- =============================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
CREATE POLICY "Super admins can view all users"
ON public.users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Countries table policies (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'countries') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their countries" ON public.countries';
    EXECUTE 'CREATE POLICY "Users can view their countries" ON public.countries FOR SELECT USING (user_id = auth.uid())';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage their countries" ON public.countries';
    EXECUTE 'CREATE POLICY "Users can manage their countries" ON public.countries FOR ALL USING (user_id = auth.uid())';
  END IF;
END $$;

-- Currencies table policies (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'currencies') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their currencies" ON public.currencies';
    EXECUTE 'CREATE POLICY "Users can view their currencies" ON public.currencies FOR SELECT USING (user_id = auth.uid())';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage their currencies" ON public.currencies';
    EXECUTE 'CREATE POLICY "Users can manage their currencies" ON public.currencies FOR ALL USING (user_id = auth.uid())';
  END IF;
END $$;

-- Payment methods table policies (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_methods') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their payment methods" ON public.payment_methods';
    EXECUTE 'CREATE POLICY "Users can view their payment methods" ON public.payment_methods FOR SELECT USING (user_id = auth.uid())';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage their payment methods" ON public.payment_methods';
    EXECUTE 'CREATE POLICY "Users can manage their payment methods" ON public.payment_methods FOR ALL USING (user_id = auth.uid())';
  END IF;
END $$;

-- Payments table policies (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their payments" ON public.payments';
    EXECUTE 'CREATE POLICY "Users can view their payments" ON public.payments FOR SELECT USING (user_id = auth.uid())';
    
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage their payments" ON public.payments';
    EXECUTE 'CREATE POLICY "Users can manage their payments" ON public.payments FOR ALL USING (user_id = auth.uid())';
  END IF;
END $$;

-- Enable RLS on existing tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'countries') THEN
    EXECUTE 'ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'currencies') THEN
    EXECUTE 'ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_methods') THEN
    EXECUTE 'ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
    EXECUTE 'ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- =============================================
-- VERIFICATION
-- =============================================

-- Verify admin user exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@pxvpay.com' AND role = 'super_admin') THEN
    RAISE EXCEPTION 'Admin user was not created successfully';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@pxvpay.com') THEN
    RAISE EXCEPTION 'Admin auth user was not created successfully';
  END IF;
  
  RAISE NOTICE '🎉 Simple database restoration completed successfully!';
  RAISE NOTICE '👤 Admin user: admin@pxvpay.com / admin123456';
  RAISE NOTICE '🗄️  Storage buckets created';
  RAISE NOTICE '🔒 Basic RLS policies restored';
END $$; 