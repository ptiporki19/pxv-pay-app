-- Get current authenticated user
SELECT auth.uid() AS current_user_id;

-- Insert sample notifications for the current user
INSERT INTO public.notifications (title, description, type, user_id)
SELECT 
  'Welcome to PXV Pay', 
  'Thank you for joining our payment platform. Get started by exploring the dashboard.', 
  'system',
  id
FROM public.users 
WHERE id IN (SELECT id FROM auth.users)
LIMIT 1;

-- Check if user exists in the public.users table
SELECT * FROM public.users LIMIT 5;

-- Insert sample payment data (will also trigger notifications)
INSERT INTO public.payments (amount, payment_method, status, user_id)
SELECT 
  '100.00', 
  'Bank Transfer', 
  'pending', 
  id
FROM public.users 
WHERE id IN (SELECT id FROM auth.users)
LIMIT 1;

-- Update the payment to completed (will trigger notification)
UPDATE public.payments
SET status = 'completed'
WHERE id IN (SELECT id FROM public.payments ORDER BY created_at DESC LIMIT 1);

-- Check that notifications were created
SELECT * FROM public.notifications ORDER BY created_at DESC LIMIT 5; 