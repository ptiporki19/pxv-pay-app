-- Remove global unique constraints that prevent multi-tenancy
-- This allows multiple users to have currencies/countries with the same codes
-- while maintaining user-specific uniqueness through existing constraints

-- Remove global unique constraint on countries.code
ALTER TABLE countries DROP CONSTRAINT IF EXISTS countries_code_key;

-- Remove global unique constraint on currencies.code  
ALTER TABLE currencies DROP CONSTRAINT IF EXISTS currencies_code_key;

-- Verify that user-specific constraints still exist (these should remain)
-- UNIQUE(user_id, code) and UNIQUE(user_id, name) constraints are preserved
-- These ensure each user can only have one currency/country with a specific code/name

-- Add comment to document the change
COMMENT ON TABLE countries IS 'Countries table - global code constraint removed to allow multi-tenancy';
COMMENT ON TABLE currencies IS 'Currencies table - global code constraint removed to allow multi-tenancy'; 