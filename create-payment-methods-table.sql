-- Enhanced Payment Methods Table Creation
-- This script creates the payment_methods table with support for manual payment methods and payment links

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
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

-- Add URL constraint for payment links
ALTER TABLE payment_methods 
DROP CONSTRAINT IF EXISTS payment_methods_url_required_for_links;

ALTER TABLE payment_methods 
ADD CONSTRAINT payment_methods_url_required_for_links 
CHECK (
  (type = 'payment-link' AND url IS NOT NULL AND url != '') OR 
  (type != 'payment-link')
);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can create their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can update their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can delete their own payment methods" ON payment_methods;

-- Create RLS policies for user isolation
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS payment_methods_type_idx ON payment_methods(type);
CREATE INDEX IF NOT EXISTS payment_methods_status_idx ON payment_methods(status);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create timestamp trigger
DROP TRIGGER IF EXISTS payment_methods_update_timestamp ON payment_methods;
CREATE TRIGGER payment_methods_update_timestamp
BEFORE UPDATE ON payment_methods
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add table comments
COMMENT ON TABLE payment_methods IS 'User-specific payment methods with support for custom fields and payment links';
COMMENT ON COLUMN payment_methods.custom_fields IS 'JSONB array of custom fields for manual payment methods';
COMMENT ON COLUMN payment_methods.description IS 'Detailed description of the payment method';
COMMENT ON COLUMN payment_methods.user_id IS 'User who owns this payment method';
COMMENT ON COLUMN payment_methods.url IS 'URL for payment-link type methods'; 