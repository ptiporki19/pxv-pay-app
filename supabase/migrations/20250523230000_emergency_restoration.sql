-- Emergency Restoration Migration
-- Migration: 20250523230000_emergency_restoration.sql
-- Purpose: Fix RLS recursion, restore missing tables, and migrate from profiles to users schema

-- STEP 1: Drop problematic profiles table and policies to stop recursion
DROP TABLE IF EXISTS profiles CASCADE;

-- STEP 2: Create user_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'registered_user', 'subscriber', 'free_user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- STEP 3: Create users table with proper structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  role user_role DEFAULT 'registered_user' NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL
);

-- STEP 4: Create all missing core tables
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  amount TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  user_id UUID NOT NULL REFERENCES public.users(id),
  reference_id TEXT,
  payment_proof TEXT,
  proof_verified BOOLEAN DEFAULT FALSE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  type TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id)
);

CREATE TABLE IF NOT EXISTS public.countries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, code),
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS public.currencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  symbol TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, code),
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'mobile', 'crypto', 'payment-link', 'manual')),
  countries TEXT[] DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'inactive')),
  icon TEXT,
  instructions TEXT,
  url TEXT,
  description TEXT,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, name)
);

-- STEP 5: Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- STEP 6: Drop all existing problematic policies
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_service_role_all" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can update all users" ON public.users;
DROP POLICY IF EXISTS "payments_select" ON public.payments;
DROP POLICY IF EXISTS "payments_insert" ON public.payments;
DROP POLICY IF EXISTS "payments_update" ON public.payments;

-- STEP 7: Create simple, non-recursive policies
-- Users table policies (avoid recursion by using direct auth.uid() checks)
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "users_service_role_all" ON public.users
  FOR ALL 
  TO service_role 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Payments table policies
CREATE POLICY "payments_select_all" ON public.payments 
  FOR SELECT USING (true);

CREATE POLICY "payments_insert_own" ON public.payments 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payments_update_all" ON public.payments 
  FOR UPDATE USING (true);

-- Notifications table policies
CREATE POLICY "notifications_select_own" ON public.notifications 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_all" ON public.notifications 
  FOR INSERT WITH CHECK (true);

-- Countries table policies
CREATE POLICY "countries_select_own" ON public.countries 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "countries_insert_own" ON public.countries 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "countries_update_own" ON public.countries 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "countries_delete_own" ON public.countries 
  FOR DELETE USING (auth.uid() = user_id);

-- Currencies table policies
CREATE POLICY "currencies_select_own" ON public.currencies 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "currencies_insert_own" ON public.currencies 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "currencies_update_own" ON public.currencies 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "currencies_delete_own" ON public.currencies 
  FOR DELETE USING (auth.uid() = user_id);

-- Payment methods table policies
CREATE POLICY "payment_methods_select_own" ON public.payment_methods 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payment_methods_insert_own" ON public.payment_methods 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payment_methods_update_own" ON public.payment_methods 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "payment_methods_delete_own" ON public.payment_methods 
  FOR DELETE USING (auth.uid() = user_id);

-- STEP 8: Create user creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'registered_user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- STEP 9: Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- STEP 10: Add update timestamp triggers
DROP TRIGGER IF EXISTS countries_update_timestamp ON countries;
CREATE TRIGGER countries_update_timestamp
  BEFORE UPDATE ON countries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS currencies_update_timestamp ON currencies;
CREATE TRIGGER currencies_update_timestamp
  BEFORE UPDATE ON currencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS payment_methods_update_timestamp ON payment_methods;
CREATE TRIGGER payment_methods_update_timestamp
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 11: Create indexes for performance
CREATE INDEX IF NOT EXISTS countries_user_id_idx ON countries(user_id);
CREATE INDEX IF NOT EXISTS countries_code_idx ON countries(code);
CREATE INDEX IF NOT EXISTS currencies_user_id_idx ON currencies(user_id);
CREATE INDEX IF NOT EXISTS currencies_code_idx ON currencies(code);
CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS payment_methods_type_idx ON payment_methods(type);

-- STEP 12: Migrate existing auth users to users table
INSERT INTO public.users (id, email, role, active)
SELECT 
  au.id,
  au.email,
  CASE 
    WHEN au.email = 'admin@pxvpay.com' THEN 'super_admin'::user_role
    ELSE 'registered_user'::user_role
  END as role,
  true as active
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  active = EXCLUDED.active; 