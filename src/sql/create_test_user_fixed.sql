-- Create users for testing via auth API

-- Check if we have any existing users
SELECT * FROM auth.users LIMIT 5;
SELECT * FROM public.users LIMIT 5;

-- Create test payment with an existing user ID
-- Let's try to work with existing users since we can't directly insert into auth.users
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
LIMIT 1
RETURNING *;

-- Create a second payment
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
    '299.99', 
    'Mobile Money', 
    'pending', 
    id,
    'REF-' || floor(random() * 1000000)::text,
    'mobile-money-receipt.jpg',
    'Yearly Plan - Business Edition'
FROM public.users
LIMIT 1
RETURNING *;

-- Check the payments we've created
SELECT * FROM public.payments ORDER BY created_at DESC LIMIT 5;

-- Check notifications that should have been triggered
SELECT * FROM public.notifications ORDER BY created_at DESC LIMIT 5; 