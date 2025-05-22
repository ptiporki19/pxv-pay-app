-- Create a super admin user (password needs to be set through Supabase dashboard or API)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'admin@pxvpay.com', now(), now(), now())
ON CONFLICT DO NOTHING;
 
-- Create user profile for the super admin
INSERT INTO public.users (id, email, role, active)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'admin@pxvpay.com', 'super_admin', true)
ON CONFLICT DO NOTHING; 