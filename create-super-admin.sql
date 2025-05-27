-- Create Super Admin User in Supabase
-- This script creates the admin user directly in the database

-- First, clean up any existing admin user
DELETE FROM auth.users WHERE email = 'admin@pxvpay.com';
DELETE FROM public.users WHERE email = 'admin@pxvpay.com';

-- Create admin user in auth.users table
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@pxvpay.com',
    crypt('admin123456', gen_salt('bf')),
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "super_admin"}',
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL
);

-- Get the user ID we just created
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@pxvpay.com';
    
    -- Create user record in public.users table
    INSERT INTO public.users (
        id,
        email,
        role,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'admin@pxvpay.com',
        'super_admin',
        NOW(),
        NOW()
    );
    
    -- Create user limits record if the table exists
    BEGIN
        INSERT INTO public.user_limits (
            user_id,
            user_role,
            max_checkout_links,
            max_monthly_payments,
            max_storage_mb,
            can_use_analytics,
            can_use_webhooks,
            can_customize_branding,
            can_export_data,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'super_admin',
            NULL, -- Unlimited
            NULL, -- Unlimited
            NULL, -- Unlimited
            true,
            true,
            true,
            true,
            NOW(),
            NOW()
        );
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'user_limits table does not exist, skipping...';
    END;
    
    RAISE NOTICE 'Super admin user created successfully with ID: %', admin_user_id;
END $$;

-- Verify the creation
SELECT 
    'Auth User' as type,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users 
WHERE email = 'admin@pxvpay.com'

UNION ALL

SELECT 
    'DB User' as type,
    id,
    email,
    role::text as email_confirmed,
    created_at
FROM public.users 
WHERE email = 'admin@pxvpay.com';

-- Show success message
SELECT 'Super Admin Created Successfully!' as status,
       'admin@pxvpay.com' as email,
       'admin123456' as password,
       'super_admin' as role; 