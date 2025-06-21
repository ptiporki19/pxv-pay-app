-- Create admin user with pre-hashed password
-- Password: admin123456

-- Clean up existing data
DELETE FROM user_limits WHERE user_role = 'super_admin';
DELETE FROM users WHERE email = 'admin@pxvpay.com';
DELETE FROM auth.users WHERE email = 'admin@pxvpay.com';

-- Create auth user with pre-hashed password (bcrypt hash of 'admin123456')
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@pxvpay.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
);

-- Create user record
INSERT INTO users (
  id,
  email,
  role,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@pxvpay.com',
  'super_admin',
  NOW()
);

-- Create user limits
INSERT INTO user_limits (
  user_id,
  user_role,
  max_checkout_links,
  current_checkout_links,
  max_monthly_payments,
  current_monthly_payments,
  max_storage_mb,
  current_storage_mb,
  can_use_analytics,
  can_use_webhooks,
  can_customize_branding,
  can_export_data
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'super_admin',
  NULL,
  0,
  NULL,
  0,
  NULL,
  0,
  true,
  true,
  true,
  true
); 