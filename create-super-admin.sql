-- PXV Pay Super Admin Creation Script
-- Run this in your Supabase SQL Editor to create the super admin user
-- =================================================================

-- Step 1: Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Create the auth user with proper password hashing
DO $$
DECLARE
    admin_user_id uuid;
    encrypted_pass text;
BEGIN
    -- Generate a secure user ID
    admin_user_id := gen_random_uuid();
    
    -- Hash the password using crypt
    encrypted_pass := crypt('admin123456', gen_salt('bf'));
    
    -- Insert into auth.users table
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
        recovery_token,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at,
        is_anonymous
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        admin_user_id,
        'authenticated',
        'authenticated',
        'admin@pxvpay.com',
        encrypted_pass,
        NOW(),
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Super Admin", "email": "admin@pxvpay.com"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        0,
        NULL,
        '',
        NULL,
        false,
        NULL,
        false
    ) 
    ON CONFLICT (email) 
    DO UPDATE SET 
        encrypted_password = encrypted_pass,
        email_confirmed_at = NOW(),
        updated_at = NOW()
    RETURNING id INTO admin_user_id;
    
    -- Get the user ID if it already existed
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@pxvpay.com';
    END IF;
    
    -- Step 3: Insert into public.users table
    INSERT INTO public.users (id, email, role, active, created_at)
    VALUES (admin_user_id, 'admin@pxvpay.com', 'super_admin', true, NOW())
    ON CONFLICT (id) 
    DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        active = EXCLUDED.active,
        created_at = COALESCE(public.users.created_at, NOW());
    
    -- Step 4: Create user limits entry for super admin (unlimited)
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
        admin_user_id, 
        999999, -- Unlimited checkout links
        999999, -- Unlimited payment methods
        999999, -- Unlimited transactions
        0,
        0,
        0
    )
    ON CONFLICT (user_id) DO UPDATE SET
        max_checkout_links = 999999,
        max_payment_methods = 999999,
        max_monthly_transactions = 999999;
    
    -- Step 5: Create merchant checkout settings for super admin
    INSERT INTO public.merchant_checkout_settings (
        merchant_id,
        default_logo_url,
        default_checkout_page_heading,
        default_manual_payment_instructions,
        default_payment_review_message
    )
    VALUES (
        admin_user_id,
        NULL,
        'PXV Pay - Global Payment Processing',
        'Please follow the payment instructions below and upload your proof of payment. Our team will verify and process your payment within 24 hours.',
        'Thank you for your payment! Your transaction is under review and you will receive an email notification once it has been processed.'
    )
    ON CONFLICT (merchant_id) DO NOTHING;
    
    -- Output success message
    RAISE NOTICE 'SUCCESS: Super admin user created successfully!';
    RAISE NOTICE 'User ID: %', admin_user_id;
    RAISE NOTICE 'Email: admin@pxvpay.com';
    RAISE NOTICE 'Password: admin123456';
    RAISE NOTICE 'Role: super_admin';
    
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'ERROR: Failed to create super admin user: %', SQLERRM;
END $$;

-- Step 6: Verify the super admin was created correctly
DO $$
DECLARE
    auth_count integer;
    user_count integer;
    user_role text;
BEGIN
    -- Check auth.users
    SELECT COUNT(*) INTO auth_count 
    FROM auth.users 
    WHERE email = 'admin@pxvpay.com';
    
    -- Check public.users
    SELECT COUNT(*), MAX(role::text) INTO user_count, user_role
    FROM public.users 
    WHERE email = 'admin@pxvpay.com';
    
    RAISE NOTICE '=== VERIFICATION RESULTS ===';
    RAISE NOTICE 'Auth user exists: %', CASE WHEN auth_count > 0 THEN 'YES' ELSE 'NO' END;
    RAISE NOTICE 'Public user exists: %', CASE WHEN user_count > 0 THEN 'YES' ELSE 'NO' END;
    RAISE NOTICE 'User role: %', COALESCE(user_role, 'NOT SET');
    
    IF auth_count > 0 AND user_count > 0 AND user_role = 'super_admin' THEN
        RAISE NOTICE '✅ SUPER ADMIN CREATED SUCCESSFULLY!';
        RAISE NOTICE '';
        RAISE NOTICE 'Login Credentials:';
        RAISE NOTICE '📧 Email: admin@pxvpay.com';
        RAISE NOTICE '🔑 Password: admin123456';
        RAISE NOTICE '👑 Role: super_admin';
        RAISE NOTICE '';
        RAISE NOTICE 'You can now login to your PXV Pay application!';
    ELSE
        RAISE NOTICE '❌ SUPER ADMIN CREATION FAILED - Please check the logs above';
    END IF;
END $$; 