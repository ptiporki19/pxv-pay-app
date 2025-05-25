-- Add missing fields to payment_methods table for better support
-- of payment links and detailed instructions

-- Add instructions field for payment instructions
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Add url field for payment links
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS url TEXT;

-- Update the type comment to reflect all supported types
COMMENT ON COLUMN payment_methods.type IS 'Payment method type: bank, mobile, crypto, payment-link';

-- Add check constraint to ensure URL is provided for payment-link type
ALTER TABLE payment_methods 
ADD CONSTRAINT payment_methods_url_required_for_links 
CHECK (
  (type = 'payment-link' AND url IS NOT NULL) OR 
  (type != 'payment-link')
); 