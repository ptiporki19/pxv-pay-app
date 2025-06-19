-- Make a user super admin after creating them in Supabase Dashboard
-- Replace 'admin@pxvpay.com' with the email of the user you want to make super admin

DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'admin@pxvpay.com';
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User with email admin@pxvpay.com not found in auth.users. Please create the user first in Supabase Dashboard.';
    END IF;
    
    -- Insert or update in public.users table
    INSERT INTO public.users (id, email, role, active, created_at)
    VALUES (user_uuid, 'admin@pxvpay.com', 'super_admin', true, NOW())
    ON CONFLICT (id) 
    DO UPDATE SET
        role = 'super_admin',
        active = true;
    
    -- Create unlimited user limits
    INSERT INTO public.user_limits (
        user_id, 
        max_checkout_links, 
        max_payment_methods, 
        max_monthly_transactions,
        current_checkout_links,
        current_payment_methods,
        current_monthly_transactions
    )
    VALUES (
        user_uuid, 
        999999, 
        999999, 
        999999,
        0,
        0,
        0
    )
    ON CONFLICT (user_id) DO UPDATE SET
        max_checkout_links = 999999,
        max_payment_methods = 999999,
        max_monthly_transactions = 999999;
    
    -- Create merchant checkout settings
    INSERT INTO public.merchant_checkout_settings (
        merchant_id,
        default_logo_url,
        default_checkout_page_heading,
        default_manual_payment_instructions,
        default_payment_review_message
    )
    VALUES (
        user_uuid,
        NULL,
        'PXV Pay - Global Payment Processing',
        'Please follow the payment instructions below and upload your proof of payment. Our team will verify and process your payment within 24 hours.',
        'Thank you for your payment! Your transaction is under review and you will receive an email notification once it has been processed.'
    )
    ON CONFLICT (merchant_id) DO NOTHING;
    
    RAISE NOTICE '✅ SUCCESS: User admin@pxvpay.com is now a super admin!';
    RAISE NOTICE 'User ID: %', user_uuid;
    
END $$;

-- Verify the super admin
SELECT 
    u.id,
    u.email,
    u.role,
    u.active,
    CASE WHEN ul.user_id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_unlimited_limits
FROM public.users u
LEFT JOIN public.user_limits ul ON u.id = ul.user_id
WHERE u.email = 'admin@pxvpay.com'; 