-- Add currency_id column to countries table
ALTER TABLE countries ADD COLUMN IF NOT EXISTS currency_id UUID REFERENCES currencies(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS countries_currency_id_idx ON countries(currency_id);

-- Update some sample countries with currency relationships
UPDATE countries SET currency_id = (SELECT id FROM currencies WHERE code = 'USD' LIMIT 1) WHERE code = 'US';
UPDATE countries SET currency_id = (SELECT id FROM currencies WHERE code = 'GBP' LIMIT 1) WHERE code = 'GB';
UPDATE countries SET currency_id = (SELECT id FROM currencies WHERE code = 'NGN' LIMIT 1) WHERE code = 'NG';
UPDATE countries SET currency_id = (SELECT id FROM currencies WHERE code = 'EUR' LIMIT 1) WHERE code = 'DE'; 