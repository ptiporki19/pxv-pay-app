-- Add missing columns that the application expects
-- This fixes the schema mismatch between database and application code

-- Add country_specific_details column to payment_methods
ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS country_specific_details JSONB DEFAULT '{}'::jsonb;

-- Add description column if it doesn't exist
ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comments for new columns
COMMENT ON COLUMN public.payment_methods.country_specific_details IS 'Country-specific details for payment methods (instructions, custom fields, URLs per country)';
COMMENT ON COLUMN public.payment_methods.description IS 'Detailed description of the payment method';

-- Update RLS policies to include new columns
-- No additional RLS changes needed as existing policies cover all columns

-- Ensure proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_country_specific_details 
ON public.payment_methods USING GIN (country_specific_details);

SELECT 'Missing columns added to payment_methods table. Application should now work correctly!' as status; 