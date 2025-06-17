-- Test data for checkout system
-- This migration adds sample data to test the checkout functionality

-- Check if test data already exists
DO $$
DECLARE
  usd_id UUID;
  eur_id UUID;
  gbp_id UUID;
  admin_user_id UUID;
  bank_method_id UUID;
  paypal_method_id UUID;
  crypto_method_id UUID;
  usa_country_id UUID;
  uk_country_id UUID;
  germany_country_id UUID;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@pxvpay.com' LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'Admin user not found. Skipping test data creation.';
    RETURN;
  END IF;

  -- Insert currencies if they don't exist
  SELECT id INTO usd_id FROM currencies WHERE code = 'USD';
  IF usd_id IS NULL THEN
    INSERT INTO currencies (id, name, code, symbol, status) 
    VALUES (gen_random_uuid(), 'US Dollar', 'USD', '$', 'active')
    RETURNING id INTO usd_id;
  END IF;

  SELECT id INTO eur_id FROM currencies WHERE code = 'EUR';
  IF eur_id IS NULL THEN
    INSERT INTO currencies (id, name, code, symbol, status) 
    VALUES (gen_random_uuid(), 'Euro', 'EUR', '€', 'active')
    RETURNING id INTO eur_id;
  END IF;

  SELECT id INTO gbp_id FROM currencies WHERE code = 'GBP';
  IF gbp_id IS NULL THEN
    INSERT INTO currencies (id, name, code, symbol, status) 
    VALUES (gen_random_uuid(), 'British Pound', 'GBP', '£', 'active')
    RETURNING id INTO gbp_id;
  END IF;

  -- Insert countries if they don't exist
  SELECT id INTO usa_country_id FROM countries WHERE code = 'US';
  IF usa_country_id IS NULL THEN
    INSERT INTO countries (id, name, code, status) 
    VALUES (gen_random_uuid(), 'United States', 'US', 'active')
    RETURNING id INTO usa_country_id;
  END IF;

  SELECT id INTO uk_country_id FROM countries WHERE code = 'GB';
  IF uk_country_id IS NULL THEN
    INSERT INTO countries (id, name, code, status) 
    VALUES (gen_random_uuid(), 'United Kingdom', 'GB', 'active')
    RETURNING id INTO uk_country_id;
  END IF;

  SELECT id INTO germany_country_id FROM countries WHERE code = 'DE';
  IF germany_country_id IS NULL THEN
    INSERT INTO countries (id, name, code, status) 
    VALUES (gen_random_uuid(), 'Germany', 'DE', 'active')
    RETURNING id INTO germany_country_id;
  END IF;

  -- Insert payment methods if they don't exist
  SELECT id INTO bank_method_id FROM payment_methods WHERE user_id = admin_user_id AND name = 'Bank Transfer';
  IF bank_method_id IS NULL THEN
    INSERT INTO payment_methods (id, user_id, name, type, countries, description, instructions_for_checkout, status, display_order) 
    VALUES (gen_random_uuid(), admin_user_id, 'Bank Transfer', 'bank_transfer', ARRAY['US', 'GB', 'DE'], 'Direct bank transfer payment', 
    'Please transfer the exact amount to our bank account:

Bank: Test Bank
Account: 123456789
Routing: 987654321

Include your payment ID in the reference.', 'active', 1)
    RETURNING id INTO bank_method_id;
  END IF;

  SELECT id INTO paypal_method_id FROM payment_methods WHERE user_id = admin_user_id AND name = 'PayPal';
  IF paypal_method_id IS NULL THEN
    INSERT INTO payment_methods (id, user_id, name, type, countries, description, instructions_for_checkout, status, display_order) 
    VALUES (gen_random_uuid(), admin_user_id, 'PayPal', 'digital_wallet', ARRAY['US', 'GB', 'DE'], 'PayPal payment', 
    'Send payment to: payments@testmerchant.com

Make sure to include your payment ID in the notes.', 'active', 2)
    RETURNING id INTO paypal_method_id;
  END IF;

  SELECT id INTO crypto_method_id FROM payment_methods WHERE user_id = admin_user_id AND name = 'Bitcoin';
  IF crypto_method_id IS NULL THEN
    INSERT INTO payment_methods (id, user_id, name, type, countries, description, instructions_for_checkout, status, display_order) 
    VALUES (gen_random_uuid(), admin_user_id, 'Bitcoin', 'cryptocurrency', ARRAY['US', 'GB', 'DE'], 'Bitcoin payment', 
    'Send Bitcoin to:

Address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

Minimum confirmations: 3
Include payment ID in transaction memo.', 'active', 3)
    RETURNING id INTO crypto_method_id;
  END IF;

  -- Create test checkout links if they don't exist
  IF NOT EXISTS (SELECT 1 FROM checkout_links WHERE slug = 'simple-payment') THEN
    INSERT INTO checkout_links (
      id, merchant_id, slug, link_name, title, checkout_type, amount_type, amount, min_amount, max_amount,
      active_country_codes, checkout_page_heading, payment_review_message, is_active
    ) VALUES (
      gen_random_uuid(), admin_user_id, 'simple-payment', 'Simple Payment Link', 'Simple Payment', 'simple', 'flexible',
      0, 10, 1000, ARRAY['US', 'GB', 'DE'], 'Complete Your Payment',
      'Thank you! Your payment is being reviewed and you will receive confirmation shortly.', true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM checkout_links WHERE slug = 'premium-course') THEN
    INSERT INTO checkout_links (
      id, merchant_id, slug, link_name, title, checkout_type, amount_type, amount, min_amount, max_amount,
      active_country_codes, checkout_page_heading, payment_review_message, is_active,
      product_name, product_description, product_image_url
    ) VALUES (
      gen_random_uuid(), admin_user_id, 'premium-course', 'Premium Course Link', 'Premium Course', 'product', 'fixed',
      99.99, null, null, ARRAY['US', 'GB'], 'Purchase Premium Course',
      'Welcome to the Premium Course! You will receive access details via email once payment is confirmed.', true,
      'Premium Web Development Course',
      'Complete full-stack web development course with React, Node.js, and database design. Includes 50+ hours of video content, projects, and lifetime access.',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'
    );
  END IF;

  RAISE NOTICE '✅ Test checkout data created successfully!';
  RAISE NOTICE '🔗 Test checkout links:';
  RAISE NOTICE '   • Simple Payment: /c/simple-payment';
  RAISE NOTICE '   • Premium Course: /c/premium-course';
  RAISE NOTICE '💳 Payment methods: Bank Transfer, PayPal, Bitcoin';
  RAISE NOTICE '🌍 Countries: US, UK, Germany';
  RAISE NOTICE '💰 Currencies: USD, EUR, GBP';

END $$;

-- Create storage bucket for payment proofs if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'payment-proofs', 'payment-proofs', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'payment-proofs');

-- Add storage policies for payment proofs
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "payment_proofs_insert_policy" ON storage.objects;
  DROP POLICY IF EXISTS "payment_proofs_select_policy" ON storage.objects;
  
  -- Create new policies
  CREATE POLICY "payment_proofs_insert_policy" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'payment-proofs' AND
    auth.role() = 'anon'
  );

  CREATE POLICY "payment_proofs_select_policy" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'payment-proofs' AND
    (auth.role() = 'authenticated' OR auth.role() = 'service_role')
  );
  
  RAISE NOTICE '🗄️ Storage bucket and policies created for payment proofs';
END $$; 