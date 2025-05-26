-- Create admin user directly with proper auth schema
DO $$
DECLARE
    admin_id uuid := '00000000-0000-0000-0000-000000000001';
    admin_email text := 'admin@pxvpay.com';
    admin_password text := 'admin123456';
BEGIN
    -- Clean up existing data
    DELETE FROM auth.users WHERE email = admin_email;
    DELETE FROM users WHERE email = admin_email;
    
    -- Create auth user
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud
    ) VALUES (
        admin_id,
        '00000000-0000-0000-0000-000000000000',
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    );
    
    -- Create user record
    INSERT INTO users (
        id,
        email,
        role,
        active,
        created_at
    ) VALUES (
        admin_id,
        admin_email,
        'super_admin',
        true,
        NOW()
    );
    
    RAISE NOTICE 'Admin user created successfully: %', admin_email;
END $$; 