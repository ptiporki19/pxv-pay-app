-- Create basic tables required for the payment methods system

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
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

-- Enable RLS on countries
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own countries" ON countries;
DROP POLICY IF EXISTS "Users can create their own countries" ON countries;
DROP POLICY IF EXISTS "Users can update their own countries" ON countries;
DROP POLICY IF EXISTS "Users can delete their own countries" ON countries;

-- Create RLS policies for countries
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

-- Currencies table
CREATE TABLE IF NOT EXISTS currencies (
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

-- Enable RLS on currencies
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own currencies" ON currencies;
DROP POLICY IF EXISTS "Users can create their own currencies" ON currencies;
DROP POLICY IF EXISTS "Users can update their own currencies" ON currencies;
DROP POLICY IF EXISTS "Users can delete their own currencies" ON currencies;

-- Create RLS policies for currencies
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

-- Create indexes
CREATE INDEX IF NOT EXISTS countries_user_id_idx ON countries(user_id);
CREATE INDEX IF NOT EXISTS countries_code_idx ON countries(code);
CREATE INDEX IF NOT EXISTS currencies_user_id_idx ON currencies(user_id);
CREATE INDEX IF NOT EXISTS currencies_code_idx ON currencies(code);

-- Create timestamp triggers for countries and currencies
DROP TRIGGER IF EXISTS countries_update_timestamp ON countries;
CREATE TRIGGER countries_update_timestamp
BEFORE UPDATE ON countries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS currencies_update_timestamp ON currencies;
CREATE TRIGGER currencies_update_timestamp
BEFORE UPDATE ON currencies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 