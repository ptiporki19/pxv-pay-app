-- Create admin user with pre-hashed password
-- Password: admin123456 (bcrypt hash)

-- Clean up existing data
DELETE FROM auth.users WHERE email = 'admin@pxvpay.com';
DELETE FROM users WHERE email = 'admin@pxvpay.com';

-- Create auth user with pre-hashed password
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
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@pxvpay.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
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
    '00000000-0000-0000-0000-000000000001',
    'admin@pxvpay.com',
    'super_admin',
    true,
    NOW()
);

-- Verify creation
SELECT 'Auth user created' as status, email FROM auth.users WHERE email = 'admin@pxvpay.com';
SELECT 'User record created' as status, email, role FROM users WHERE email = 'admin@pxvpay.com'; 