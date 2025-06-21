-- Seed script for PXV Pay
-- This script creates the admin user and basic data

-- Create admin user in auth.users table
-- Note: This uses the service role to directly insert into auth.users
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
) ON CONFLICT (id) DO NOTHING;

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
) ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- Insert default countries
INSERT INTO public.countries (user_id, name, code, status, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'United States', 'US', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Canada', 'CA', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'United Kingdom', 'GB', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Nigeria', 'NG', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Kenya', 'KE', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Ghana', 'GH', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'South Africa', 'ZA', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Germany', 'DE', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'France', 'FR', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Japan', 'JP', 'active', NOW(), NOW());

-- Insert default currencies
INSERT INTO public.currencies (user_id, name, code, symbol, status, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'US Dollar', 'USD', '$', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Euro', 'EUR', '€', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'British Pound', 'GBP', '£', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Nigerian Naira', 'NGN', '₦', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Kenyan Shilling', 'KES', 'KSh', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'South African Rand', 'ZAR', 'R', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Ghanaian Cedi', 'GHS', 'GH₵', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Japanese Yen', 'JPY', '¥', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Canadian Dollar', 'CAD', 'CA$', 'active', NOW(), NOW());

-- Insert default payment methods
INSERT INTO public.payment_methods (user_id, name, type, countries, status, url, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Bank Transfer', 'manual', ARRAY['US', 'CA', 'GB', 'NG', 'KE', 'GH', 'ZA', 'DE', 'FR', 'JP'], 'active', NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Mobile Money', 'manual', ARRAY['NG', 'KE', 'GH', 'ZA'], 'active', NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Cryptocurrency', 'manual', ARRAY['US', 'CA', 'GB', 'NG', 'KE', 'GH', 'ZA', 'DE', 'FR', 'JP'], 'active', NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'PayPal', 'payment-link', ARRAY['US', 'CA', 'GB', 'DE', 'FR', 'JP'], 'active', 'https://paypal.com', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000001', 'Stripe', 'payment-link', ARRAY['US', 'CA', 'GB', 'DE', 'FR', 'JP'], 'active', 'https://stripe.com', NOW(), NOW());

-- Log the seed completion
SELECT 'Seed data inserted successfully' as status; 