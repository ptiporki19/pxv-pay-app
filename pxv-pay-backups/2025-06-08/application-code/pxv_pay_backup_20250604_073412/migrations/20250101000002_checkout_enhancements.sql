-- Checkout System Enhancements Migration - Phase 2
-- Safe column additions to existing tables only
-- Following checkout-development.mcd rules: NO modifications, only additions

-- Add checkout-related columns to existing payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS checkout_link_id UUID REFERENCES checkout_links(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS status_update_notes TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- Add checkout-specific fields to existing payment_methods table
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS instructions_for_checkout TEXT;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add indexes for new columns (performance optimization)
CREATE INDEX IF NOT EXISTS payments_checkout_link_id_idx ON payments(checkout_link_id);
CREATE INDEX IF NOT EXISTS payments_customer_email_idx ON payments(customer_email);
CREATE INDEX IF NOT EXISTS payments_verification_date_idx ON payments(verification_date);
CREATE INDEX IF NOT EXISTS payment_methods_display_order_idx ON payment_methods(display_order);

-- Add comments for new columns
COMMENT ON COLUMN payments.customer_name IS 'Customer name from checkout form';
COMMENT ON COLUMN payments.customer_email IS 'Customer email for notifications';
COMMENT ON COLUMN payments.payment_proof_url IS 'URL to uploaded payment proof file';
COMMENT ON COLUMN payments.checkout_link_id IS 'Reference to the checkout link used for this payment';
COMMENT ON COLUMN payments.status_update_notes IS 'Notes added when payment status is updated';
COMMENT ON COLUMN payments.verification_date IS 'Date when payment was verified by merchant';
COMMENT ON COLUMN payments.verified_by IS 'User ID of who verified the payment';
COMMENT ON COLUMN payment_methods.instructions_for_checkout IS 'Special instructions displayed during checkout';
COMMENT ON COLUMN payment_methods.display_order IS 'Order in which payment methods appear in checkout'; 