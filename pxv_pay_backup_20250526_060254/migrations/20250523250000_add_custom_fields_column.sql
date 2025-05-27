-- Add custom_fields column to payment_methods table
-- Migration: 20250523250000_add_custom_fields_column.sql
-- Purpose: Add JSONB custom_fields column for manual payment methods

-- Add the custom_fields column as JSONB with default empty array
ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the column
COMMENT ON COLUMN public.payment_methods.custom_fields IS 'JSONB array of custom fields for manual payment methods';

-- Verify the column was added by selecting its metadata
-- This is just for verification, the result won't be visible in migration
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_methods' 
    AND column_name = 'custom_fields'
    AND table_schema = 'public'
  ) THEN
    RAISE NOTICE 'custom_fields column successfully added to payment_methods table';
  ELSE
    RAISE EXCEPTION 'Failed to add custom_fields column to payment_methods table';
  END IF;
END $$; 