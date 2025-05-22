-- Insert test payment data

-- Insert a payment for each user
INSERT INTO public.payments (amount, payment_method, status, user_id)
SELECT 
  '500.00', 
  'Bank Transfer', 
  'pending', 
  id
FROM public.users 
LIMIT 1;

-- Display the inserted payment
SELECT * FROM public.payments ORDER BY created_at DESC LIMIT 1;

-- Update the payment status to completed (should trigger notification in the app)
UPDATE public.payments
SET status = 'completed'
WHERE id IN (SELECT id FROM public.payments ORDER BY created_at DESC LIMIT 1);

-- Display the notifications that should have been created
SELECT * FROM public.notifications ORDER BY created_at DESC LIMIT 5; 