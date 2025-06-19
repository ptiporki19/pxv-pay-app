-- Checkout Links Enhancements Migration
-- Adding missing columns for checkout links management

-- Add new columns to checkout_links table
ALTER TABLE checkout_links 
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'expired', 'draft'));

-- Update existing records to have proper titles (use link_name as title)
UPDATE checkout_links 
SET title = link_name 
WHERE title = '' OR title IS NULL;

-- Add index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_checkout_links_status ON checkout_links(status);
CREATE INDEX IF NOT EXISTS idx_checkout_links_merchant_status ON checkout_links(merchant_id, status);

-- Update RLS policies to include new columns (no changes needed, existing policies cover all columns)

-- Add comment for documentation
COMMENT ON COLUMN checkout_links.title IS 'Display title for the checkout link';
COMMENT ON COLUMN checkout_links.amount IS 'Fixed amount for this checkout link in the specified currency';
COMMENT ON COLUMN checkout_links.currency IS 'Currency code (USD, EUR, etc.)';
COMMENT ON COLUMN checkout_links.status IS 'Current status of the checkout link (active, inactive, expired, draft)'; 