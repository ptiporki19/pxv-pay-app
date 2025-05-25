-- Seed script for PXV Pay

-- First, we'll insert a few default records for testing
-- This assumes you already have users created in auth.users through the auth system

-- Insert default admin user profile
INSERT INTO profiles (id, full_name, user_type)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'System Admin', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Insert a test merchant
INSERT INTO merchants (id, name, description, website, status, owner_id)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Test Merchant', 'A test merchant for development', 'https://example.com', 'active', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Insert countries
INSERT INTO countries (name, code, status)
VALUES
  ('United States', 'US', 'active'),
  ('Canada', 'CA', 'active'),
  ('United Kingdom', 'GB', 'pending'),
  ('Brazil', 'BR', 'inactive'),
  ('Nigeria', 'NG', 'active'),
  ('Kenya', 'KE', 'active'),
  ('Ghana', 'GH', 'active'),
  ('South Africa', 'ZA', 'active'),
  ('Tanzania', 'TZ', 'active'),
  ('Germany', 'DE', 'active'),
  ('France', 'FR', 'active'),
  ('Japan', 'JP', 'active')
ON CONFLICT (code) DO NOTHING;

-- Insert currencies
INSERT INTO currencies (name, code, symbol, status)
VALUES
  ('US Dollar', 'USD', '$', 'active'),
  ('Euro', 'EUR', '€', 'active'),
  ('British Pound', 'GBP', '£', 'active'),
  ('Nigerian Naira', 'NGN', '₦', 'active'),
  ('Brazilian Real', 'BRL', 'R$', 'pending'),
  ('Kenyan Shilling', 'KES', 'KSh', 'active'),
  ('South African Rand', 'ZAR', 'R', 'active'),
  ('Ghanaian Cedi', 'GHS', 'GH₵', 'active'),
  ('Japanese Yen', 'JPY', '¥', 'active'),
  ('Canadian Dollar', 'CAD', 'CA$', 'active')
ON CONFLICT (code) DO NOTHING;

-- Insert payment methods
INSERT INTO payment_methods (name, type, countries, status, icon)
VALUES
  ('Bank Transfer (USD)', 'bank', ARRAY['US', 'CA'], 'active', 'BT'),
  ('M-Pesa', 'mobile', ARRAY['KE', 'TZ'], 'active', 'MM'),
  ('SEPA Transfer', 'bank', ARRAY['DE', 'FR', 'IT', 'ES'], 'inactive', 'BT'),
  ('Bitcoin', 'crypto', ARRAY['Global'], 'active', 'BTC'),
  ('Ethereum', 'crypto', ARRAY['Global'], 'active', 'ETH'),
  ('Interac e-Transfer', 'bank', ARRAY['CA'], 'active', 'INT'),
  ('Wise Transfer', 'bank', ARRAY['US', 'GB', 'EU', 'AU'], 'active', 'WT'),
  ('PayPal', 'bank', ARRAY['Global'], 'active', 'PP'),
  ('MTN Mobile Money', 'mobile', ARRAY['GH', 'NG', 'ZA'], 'active', 'MTN')
ON CONFLICT DO NOTHING;

-- Insert some sample payments for testing
DO $$
DECLARE
  test_user_id UUID;
  merchant_id UUID;
BEGIN
  -- Get our test merchant
  SELECT id INTO merchant_id FROM merchants LIMIT 1;
  
  -- Get a test user (other than admin)
  SELECT id INTO test_user_id FROM auth.users WHERE id != '00000000-0000-0000-0000-000000000000' LIMIT 1;
  
  -- Only proceed if we have both a merchant and a user
  IF test_user_id IS NOT NULL AND merchant_id IS NOT NULL THEN
    -- Insert sample payments
    INSERT INTO payments (user_id, merchant_id, amount, currency, payment_method, status, country, description)
    VALUES
      (test_user_id, merchant_id, 100.00, 'USD', 'bank', 'pending', 'US', 'Test payment 1'),
      (test_user_id, merchant_id, 50.00, 'USD', 'bank', 'completed', 'US', 'Test payment 2'),
      (test_user_id, merchant_id, 75.50, 'USD', 'bank', 'failed', 'US', 'Test payment 3'),
      (test_user_id, merchant_id, 200.00, 'EUR', 'bank', 'pending', 'DE', 'Test payment 4'),
      (test_user_id, merchant_id, 500.00, 'GBP', 'bank', 'completed', 'GB', 'Test payment 5'),
      (test_user_id, merchant_id, 0.05, 'BTC', 'crypto', 'pending', 'Global', 'Test payment 6')
    ON CONFLICT DO NOTHING;
  END IF;
END $$; 