-- Migration: Enable Global Data Access for Countries and Currencies
-- Date: 2025-06-01
-- Purpose: Update RLS policies to allow access to global countries and currencies data (user_id = null)
--          while maintaining security for user-specific data

-- Drop existing policies for countries
DROP POLICY IF EXISTS "countries_select_own" ON public.countries;
DROP POLICY IF EXISTS "countries_insert_own" ON public.countries;
DROP POLICY IF EXISTS "countries_update_own" ON public.countries;
DROP POLICY IF EXISTS "countries_delete_own" ON public.countries;

-- Drop existing policies for currencies
DROP POLICY IF EXISTS "currencies_select_own" ON public.currencies;
DROP POLICY IF EXISTS "currencies_insert_own" ON public.currencies;
DROP POLICY IF EXISTS "currencies_update_own" ON public.currencies;
DROP POLICY IF EXISTS "currencies_delete_own" ON public.currencies;

-- Create new policies for countries that allow global data access
CREATE POLICY "countries_select_own_or_global" ON public.countries 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "countries_insert_own" ON public.countries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "countries_update_own" ON public.countries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "countries_delete_own" ON public.countries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create new policies for currencies that allow global data access
CREATE POLICY "currencies_select_own_or_global" ON public.currencies 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "currencies_insert_own" ON public.currencies 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "currencies_update_own" ON public.currencies 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "currencies_delete_own" ON public.currencies 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add service role policies for global data management
CREATE POLICY "service_role_global_countries" ON public.countries 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "service_role_global_currencies" ON public.currencies 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Create indexes for better performance on global data queries
CREATE INDEX IF NOT EXISTS countries_global_data_idx ON countries(user_id) WHERE user_id IS NULL;
CREATE INDEX IF NOT EXISTS currencies_global_data_idx ON currencies(user_id) WHERE user_id IS NULL;

-- Add comment to document the change
COMMENT ON TABLE countries IS 'Countries table with support for global (user_id = null) and user-specific data';
COMMENT ON TABLE currencies IS 'Currencies table with support for global (user_id = null) and user-specific data'; 