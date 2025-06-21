-- Ensure Complete Setup Migration
-- This migration ensures all necessary components are in place

-- 1. Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('payment-method-icons', 'payment-method-icons', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
  ('user-avatars', 'user-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('checkout-assets', 'checkout-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
  ('theme-assets', 'theme-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'text/css'])
ON CONFLICT (id) DO NOTHING;

-- 2. Create admin user in auth.users if it doesn't exist
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if admin user exists
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@pxvpay.com';
    
    -- If admin user doesn't exist, create it
    IF admin_user_id IS NULL THEN
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
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@pxvpay.com',
            crypt('admin123456', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Super Admin"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO admin_user_id;
    END IF;
    
    -- Ensure admin user exists in public.users table
    INSERT INTO public.users (id, email, role, active, created_at)
    VALUES (admin_user_id, 'admin@pxvpay.com', 'super_admin', true, NOW())
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        active = EXCLUDED.active;
END $$;

-- 3. Storage policies for payment-method-icons bucket
DROP POLICY IF EXISTS "payment_method_icons_select_policy" ON storage.objects;
CREATE POLICY "payment_method_icons_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-method-icons');

DROP POLICY IF EXISTS "payment_method_icons_insert_policy" ON storage.objects;
CREATE POLICY "payment_method_icons_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'payment-method-icons' AND
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "payment_method_icons_update_policy" ON storage.objects;
CREATE POLICY "payment_method_icons_update_policy" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'payment-method-icons' AND
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "payment_method_icons_delete_policy" ON storage.objects;
CREATE POLICY "payment_method_icons_delete_policy" ON storage.objects
FOR DELETE USING (
    bucket_id = 'payment-method-icons' AND
    auth.role() = 'authenticated'
);

-- 4. Storage policies for user-avatars bucket
DROP POLICY IF EXISTS "user_avatars_select_policy" ON storage.objects;
CREATE POLICY "user_avatars_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

DROP POLICY IF EXISTS "user_avatars_insert_policy" ON storage.objects;
CREATE POLICY "user_avatars_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "user_avatars_update_policy" ON storage.objects;
CREATE POLICY "user_avatars_update_policy" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'user-avatars' AND
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "user_avatars_delete_policy" ON storage.objects;
CREATE POLICY "user_avatars_delete_policy" ON storage.objects
FOR DELETE USING (
    bucket_id = 'user-avatars' AND
    auth.role() = 'authenticated'
);

-- 5. Storage policies for checkout-assets bucket
DROP POLICY IF EXISTS "checkout_assets_select_policy" ON storage.objects;
CREATE POLICY "checkout_assets_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'checkout-assets');

DROP POLICY IF EXISTS "checkout_assets_insert_policy" ON storage.objects;
CREATE POLICY "checkout_assets_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'checkout-assets' AND
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "checkout_assets_update_policy" ON storage.objects;
CREATE POLICY "checkout_assets_update_policy" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'checkout-assets' AND
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "checkout_assets_delete_policy" ON storage.objects;
CREATE POLICY "checkout_assets_delete_policy" ON storage.objects
FOR DELETE USING (
    bucket_id = 'checkout-assets' AND
    auth.role() = 'authenticated'
);

-- 6. Storage policies for theme-assets bucket
DROP POLICY IF EXISTS "theme_assets_select_policy" ON storage.objects;
CREATE POLICY "theme_assets_select_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'theme-assets');

DROP POLICY IF EXISTS "theme_assets_insert_policy" ON storage.objects;
CREATE POLICY "theme_assets_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'theme-assets' AND
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "theme_assets_update_policy" ON storage.objects;
CREATE POLICY "theme_assets_update_policy" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'theme-assets' AND
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "theme_assets_delete_policy" ON storage.objects;
CREATE POLICY "theme_assets_delete_policy" ON storage.objects
FOR DELETE USING (
    bucket_id = 'theme-assets' AND
    auth.role() = 'authenticated'
);

-- 7. Ensure RLS is enabled on all necessary tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 8. Create or update RLS policies for users table
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
CREATE POLICY "users_select_policy" ON public.users
FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
CREATE POLICY "users_insert_policy" ON public.users
FOR INSERT WITH CHECK (
    auth.uid() = id OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "users_update_policy" ON public.users;
CREATE POLICY "users_update_policy" ON public.users
FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- 9. Create or update RLS policies for countries table
DROP POLICY IF EXISTS "countries_select_policy" ON public.countries;
CREATE POLICY "countries_select_policy" ON public.countries
FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "countries_insert_policy" ON public.countries;
CREATE POLICY "countries_insert_policy" ON public.countries
FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "countries_update_policy" ON public.countries;
CREATE POLICY "countries_update_policy" ON public.countries
FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "countries_delete_policy" ON public.countries;
CREATE POLICY "countries_delete_policy" ON public.countries
FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- 10. Create or update RLS policies for currencies table
DROP POLICY IF EXISTS "currencies_select_policy" ON public.currencies;
CREATE POLICY "currencies_select_policy" ON public.currencies
FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "currencies_insert_policy" ON public.currencies;
CREATE POLICY "currencies_insert_policy" ON public.currencies
FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "currencies_update_policy" ON public.currencies;
CREATE POLICY "currencies_update_policy" ON public.currencies
FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "currencies_delete_policy" ON public.currencies;
CREATE POLICY "currencies_delete_policy" ON public.currencies
FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- 11. Create or update RLS policies for payment_methods table
DROP POLICY IF EXISTS "payment_methods_select_policy" ON public.payment_methods;
CREATE POLICY "payment_methods_select_policy" ON public.payment_methods
FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "payment_methods_insert_policy" ON public.payment_methods;
CREATE POLICY "payment_methods_insert_policy" ON public.payment_methods
FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "payment_methods_update_policy" ON public.payment_methods;
CREATE POLICY "payment_methods_update_policy" ON public.payment_methods
FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "payment_methods_delete_policy" ON public.payment_methods;
CREATE POLICY "payment_methods_delete_policy" ON public.payment_methods
FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- 12. Create or update RLS policies for payments table
DROP POLICY IF EXISTS "payments_select_policy" ON public.payments;
CREATE POLICY "payments_select_policy" ON public.payments
FOR SELECT USING (
    user_id = auth.uid() OR
    merchant_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "payments_insert_policy" ON public.payments;
CREATE POLICY "payments_insert_policy" ON public.payments
FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    merchant_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

DROP POLICY IF EXISTS "payments_update_policy" ON public.payments;
CREATE POLICY "payments_update_policy" ON public.payments
FOR UPDATE USING (
    user_id = auth.uid() OR
    merchant_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- 13. Add some sample countries and currencies for testing
DO $$
DECLARE
    admin_user_id uuid;
    usd_currency_id uuid;
    ngn_currency_id uuid;
    gbp_currency_id uuid;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@pxvpay.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert sample currencies (only if they don't exist)
        IF NOT EXISTS (SELECT 1 FROM public.currencies WHERE code = 'USD') THEN
            INSERT INTO public.currencies (id, name, code, symbol, status, created_at, updated_at)
            VALUES (gen_random_uuid(), 'US Dollar', 'USD', '$', 'active', NOW(), NOW());
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM public.currencies WHERE code = 'NGN') THEN
            INSERT INTO public.currencies (id, name, code, symbol, status, created_at, updated_at)
            VALUES (gen_random_uuid(), 'Nigerian Naira', 'NGN', '₦', 'active', NOW(), NOW());
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM public.currencies WHERE code = 'GBP') THEN
            INSERT INTO public.currencies (id, name, code, symbol, status, created_at, updated_at)
            VALUES (gen_random_uuid(), 'British Pound', 'GBP', '£', 'active', NOW(), NOW());
        END IF;
        
        -- Insert sample countries (only if they don't exist)
        IF NOT EXISTS (SELECT 1 FROM public.countries WHERE code = 'US') THEN
            INSERT INTO public.countries (id, name, code, status, created_at, updated_at)
            VALUES (gen_random_uuid(), 'United States', 'US', 'active', NOW(), NOW());
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM public.countries WHERE code = 'NG') THEN
            INSERT INTO public.countries (id, name, code, status, created_at, updated_at)
            VALUES (gen_random_uuid(), 'Nigeria', 'NG', 'active', NOW(), NOW());
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM public.countries WHERE code = 'GB') THEN
            INSERT INTO public.countries (id, name, code, status, created_at, updated_at)
            VALUES (gen_random_uuid(), 'United Kingdom', 'GB', 'active', NOW(), NOW());
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM public.countries WHERE code = 'CA') THEN
            INSERT INTO public.countries (id, name, code, status, created_at, updated_at)
            VALUES (gen_random_uuid(), 'Canada', 'CA', 'active', NOW(), NOW());
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM public.countries WHERE code = 'AU') THEN
            INSERT INTO public.countries (id, name, code, status, created_at, updated_at)
            VALUES (gen_random_uuid(), 'Australia', 'AU', 'active', NOW(), NOW());
        END IF;
    END IF;
END $$; 