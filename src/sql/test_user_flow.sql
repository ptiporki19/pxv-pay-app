-- Test User and Payment Flow for Real-time Testing

-- 1. Create a test user in auth.users if it doesn't exist already
-- Note: We can't directly insert into auth.users from SQL, so we'll assume a user exists
-- In a real scenario, you would create this user through the app registration process

-- 2. Create a record in public.users for our test user
-- First, check if we have any users to work with
SELECT id, email FROM auth.users LIMIT 5;

-- Insert our test user (use real user ID from above query)
INSERT INTO public.users (id, email, role, active)
VALUES 
  ('replace-with-real-user-id', 'test-customer@example.com', 'registered_user', true)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email, role = EXCLUDED.role;

-- 3. Create a payment record for the test user
INSERT INTO public.payments (
  amount, 
  payment_method, 
  status, 
  user_id, 
  reference_id,
  payment_proof,
  notes
)
SELECT 
  '125.50', 
  'Bank Transfer', 
  'pending', 
  id,
  'REF-' || floor(random() * 1000000)::text,
  'proof-image-url.jpg',
  'Payment for premium subscription - 3 months'
FROM public.users
WHERE email = 'test-customer@example.com'
RETURNING id, user_id, amount, payment_method, status, reference_id;

-- 4. Save the new payment ID for later use
SELECT id AS new_payment_id FROM public.payments ORDER BY created_at DESC LIMIT 1;

-- 5. Verify notifications were created by the trigger
SELECT * FROM public.notifications WHERE user_id = (SELECT id FROM public.users WHERE email = 'test-customer@example.com') ORDER BY created_at DESC; 