-- Add description column to payment_methods table
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment for documentation
COMMENT ON COLUMN payment_methods.description IS 'Detailed description of the payment method'; 