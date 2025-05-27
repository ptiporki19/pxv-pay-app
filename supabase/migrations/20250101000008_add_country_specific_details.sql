-- Add Country-Specific Payment Details Migration
-- This allows payment methods to have different details per country

-- Add country_specific_details column to payment_methods table
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS country_specific_details JSONB DEFAULT '{}'::jsonb;

-- Add index for better performance on country_specific_details queries
CREATE INDEX IF NOT EXISTS idx_payment_methods_country_details ON payment_methods USING GIN (country_specific_details);

-- Add instructions_for_checkout column if it doesn't exist (for backward compatibility)
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS instructions_for_checkout TEXT;

-- Add display_order column if it doesn't exist (for ordering payment methods)
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN payment_methods.country_specific_details IS 'Country-specific payment details and instructions stored as JSONB. Format: {"US": {"custom_fields": [...], "instructions": "...", "url": "..."}, "GB": {...}}';
COMMENT ON COLUMN payment_methods.instructions_for_checkout IS 'General instructions shown during checkout (fallback if no country-specific instructions)';
COMMENT ON COLUMN payment_methods.display_order IS 'Order in which payment methods are displayed (lower numbers first)';

-- Create function to get country-specific details
CREATE OR REPLACE FUNCTION get_payment_method_details_for_country(
  payment_method_id UUID,
  country_code TEXT
) RETURNS JSONB AS $$
DECLARE
  method_details JSONB;
  country_details JSONB;
BEGIN
  -- Get the payment method
  SELECT country_specific_details INTO method_details
  FROM payment_methods 
  WHERE id = payment_method_id;
  
  -- Return country-specific details if they exist
  IF method_details ? country_code THEN
    RETURN method_details->country_code;
  END IF;
  
  -- Return empty object if no country-specific details
  RETURN '{}'::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate country_specific_details structure
CREATE OR REPLACE FUNCTION validate_country_specific_details() 
RETURNS TRIGGER AS $$
BEGIN
  -- Validate that country_specific_details is a valid JSON object
  IF NEW.country_specific_details IS NOT NULL THEN
    -- Check if it's a valid JSON object
    IF jsonb_typeof(NEW.country_specific_details) != 'object' THEN
      RAISE EXCEPTION 'country_specific_details must be a JSON object';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate country_specific_details
DROP TRIGGER IF EXISTS validate_country_details_trigger ON payment_methods;
CREATE TRIGGER validate_country_details_trigger
  BEFORE INSERT OR UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION validate_country_specific_details(); 