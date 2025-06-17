-- Fix Checkout RLS Policies Migration
-- Update RLS policies to use the correct users table instead of profiles table

-- Drop existing super admin policy for checkout_links
DROP POLICY IF EXISTS "Super admins can view all checkout links" ON checkout_links;

-- Create new super admin policy using users table
CREATE POLICY "Super admins can view all checkout links"
ON checkout_links FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- Drop existing super admin policy for merchant_checkout_settings
DROP POLICY IF EXISTS "Super admins can view all checkout settings" ON merchant_checkout_settings;

-- Create new super admin policy using users table
CREATE POLICY "Super admins can view all checkout settings"
ON merchant_checkout_settings FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- Add super admin policies for INSERT, UPDATE, DELETE on checkout_links
CREATE POLICY "Super admins can create checkout links"
ON checkout_links FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

CREATE POLICY "Super admins can update checkout links"
ON checkout_links FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

CREATE POLICY "Super admins can delete checkout links"
ON checkout_links FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- Add super admin policies for INSERT, UPDATE, DELETE on merchant_checkout_settings
CREATE POLICY "Super admins can create checkout settings"
ON merchant_checkout_settings FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

CREATE POLICY "Super admins can update checkout settings"
ON merchant_checkout_settings FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

CREATE POLICY "Super admins can delete checkout settings"
ON merchant_checkout_settings FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
); 