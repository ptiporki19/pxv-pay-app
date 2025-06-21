-- Create a test user directly in the public.users table with a UUID
-- Note: In a real app, this would be linked to a proper auth.users entry

-- Generate a UUID for our test user
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Insert test user
    INSERT INTO public.users (id, email, role, active)
    VALUES (test_user_id, 'test-customer@example.com', 'registered_user', true);
    
    -- Insert a merchant admin user if one doesn't exist
    INSERT INTO public.users (id, email, role, active)
    VALUES (gen_random_uuid(), 'merchant-admin@example.com', 'super_admin', true)
    ON CONFLICT DO NOTHING;
    
    -- Output the test user ID
    RAISE NOTICE 'Created test user with ID: %', test_user_id;
    
    -- Create payment for test user
    INSERT INTO public.payments (
        amount, 
        payment_method, 
        status, 
        user_id, 
        reference_id,
        payment_proof,
        notes
    ) VALUES (
        '125.50', 
        'Bank Transfer', 
        'pending', 
        test_user_id,
        'REF-' || floor(random() * 1000000)::text,
        'proof-image-url.jpg',
        'Payment for premium subscription - 3 months'
    );
END $$; 