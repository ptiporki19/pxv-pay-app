-- Checkout System Foundation Migration
-- Phase 1: Create new tables only (no modifications to existing tables)
-- Following checkout-development.mcd rules

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create checkout_links table
CREATE TABLE IF NOT EXISTS checkout_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    link_name TEXT NOT NULL,
    active_country_codes TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Customization overrides (if NULL, use merchant_checkout_settings defaults)
    logo_url TEXT,
    checkout_page_heading TEXT,
    payment_review_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create merchant_checkout_settings table
CREATE TABLE IF NOT EXISTS merchant_checkout_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Default customization settings
    default_logo_url TEXT,
    default_checkout_page_heading TEXT DEFAULT 'Complete Your Payment',
    default_manual_payment_instructions TEXT DEFAULT 'Please follow the payment instructions below and upload your proof of payment.',
    default_payment_review_message TEXT DEFAULT 'Thank you for your payment! Your transaction is under review and you will receive an email notification once it has been processed.',
    
    -- Email templates
    payment_approved_email_subject TEXT DEFAULT 'Payment Approved - Transaction Confirmed',
    payment_approved_email_body TEXT DEFAULT 'Your payment has been approved and processed successfully. Thank you for your business!',
    payment_rejected_email_subject TEXT DEFAULT 'Payment Rejected - Action Required',
    payment_rejected_email_body TEXT DEFAULT 'Unfortunately, your payment could not be verified. Please contact us for assistance.',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS checkout_links_merchant_id_idx ON checkout_links(merchant_id);
CREATE INDEX IF NOT EXISTS checkout_links_slug_idx ON checkout_links(slug);
CREATE INDEX IF NOT EXISTS checkout_links_is_active_idx ON checkout_links(is_active);
CREATE INDEX IF NOT EXISTS merchant_checkout_settings_merchant_id_idx ON merchant_checkout_settings(merchant_id);

-- Enable RLS on new tables
ALTER TABLE checkout_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_checkout_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for checkout_links
CREATE POLICY "Merchants can view their own checkout links"
ON checkout_links FOR SELECT
USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can create their own checkout links"
ON checkout_links FOR INSERT
WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Merchants can update their own checkout links"
ON checkout_links FOR UPDATE
USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can delete their own checkout links"
ON checkout_links FOR DELETE
USING (auth.uid() = merchant_id);

-- Super admins can view all checkout links
CREATE POLICY "Super admins can view all checkout links"
ON checkout_links FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND user_type = 'admin'
    )
);

-- RLS Policies for merchant_checkout_settings
CREATE POLICY "Merchants can manage their own checkout settings"
ON merchant_checkout_settings FOR ALL
USING (auth.uid() = merchant_id);

CREATE POLICY "Super admins can view all checkout settings"
ON merchant_checkout_settings FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND user_type = 'admin'
    )
);

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE checkout_links;
ALTER PUBLICATION supabase_realtime ADD TABLE merchant_checkout_settings;

-- Create update timestamp function for new tables
CREATE OR REPLACE FUNCTION update_checkout_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update timestamp triggers
CREATE TRIGGER checkout_links_update_timestamp
BEFORE UPDATE ON checkout_links
FOR EACH ROW EXECUTE FUNCTION update_checkout_timestamp();

CREATE TRIGGER merchant_checkout_settings_update_timestamp
BEFORE UPDATE ON merchant_checkout_settings
FOR EACH ROW EXECUTE FUNCTION update_checkout_timestamp();

-- Add comments for documentation
COMMENT ON TABLE checkout_links IS 'Merchant-specific checkout links with customization options';
COMMENT ON TABLE merchant_checkout_settings IS 'Default checkout customization settings per merchant';

COMMENT ON COLUMN checkout_links.slug IS 'Unique URL slug for the checkout link (auto-generated for MVP)';
COMMENT ON COLUMN checkout_links.active_country_codes IS 'Array of country codes enabled for this checkout link';
COMMENT ON COLUMN checkout_links.logo_url IS 'Override logo URL for this specific checkout link';
COMMENT ON COLUMN merchant_checkout_settings.default_logo_url IS 'Default logo URL used across all merchant checkout links'; 