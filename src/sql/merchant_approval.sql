-- Merchant Payment Approval Simulation

-- First, check the pending payments
SELECT * FROM public.payments WHERE status = 'pending' ORDER BY created_at DESC LIMIT 5;

-- Update a payment to 'completed' status (simulating merchant approval)
-- This should trigger a notification via the database trigger
UPDATE public.payments
SET status = 'completed'
WHERE status = 'pending'
AND created_at = (SELECT MAX(created_at) FROM public.payments WHERE status = 'pending')
RETURNING id, amount, payment_method, status, user_id, reference_id;

-- Verify the payment was updated
SELECT * FROM public.payments ORDER BY created_at DESC LIMIT 5;

-- Check that the notification was created
SELECT * FROM public.notifications ORDER BY created_at DESC LIMIT 5;

-- IMPORTANT: In a real app, this notification would be delivered in real-time
-- to the user's interface through the Supabase real-time subscription 