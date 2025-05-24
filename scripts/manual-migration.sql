-- Manual migration to add user_id columns and update RLS policies

-- Add user_id column to countries table
ALTER TABLE countries 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to currencies table  
ALTER TABLE currencies 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to payment_methods table
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing RLS policies that allow global access
DROP POLICY IF EXISTS "Everyone can view countries" ON countries;
DROP POLICY IF EXISTS "Everyone can view currencies" ON currencies;
DROP POLICY IF EXISTS "Everyone can view payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Only admins can modify countries" ON countries;
DROP POLICY IF EXISTS "Only admins can modify currencies" ON currencies;
DROP POLICY IF EXISTS "Only admins can modify payment methods" ON payment_methods;

-- Create new user-specific RLS policies for countries
CREATE POLICY "Users can view their own countries"
  ON countries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own countries"
  ON countries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own countries"
  ON countries
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own countries"
  ON countries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create new user-specific RLS policies for currencies
CREATE POLICY "Users can view their own currencies"
  ON currencies
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own currencies"
  ON currencies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own currencies"
  ON currencies
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own currencies"
  ON currencies
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create new user-specific RLS policies for payment_methods
CREATE POLICY "Users can view their own payment methods"
  ON payment_methods
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment methods"
  ON payment_methods
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
  ON payment_methods
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
  ON payment_methods
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add indices for better performance on user-specific queries
CREATE INDEX IF NOT EXISTS countries_user_id_idx ON countries(user_id);
CREATE INDEX IF NOT EXISTS currencies_user_id_idx ON currencies(user_id);
CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON payment_methods(user_id); 