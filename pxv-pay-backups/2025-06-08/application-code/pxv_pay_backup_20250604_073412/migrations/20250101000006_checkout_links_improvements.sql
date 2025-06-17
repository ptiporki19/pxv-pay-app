-- Checkout Links Improvements Migration
-- Adding support for flexible amounts and other missing columns

-- Add new columns to checkout_links table for flexible amounts
ALTER TABLE checkout_links 
ADD COLUMN IF NOT EXISTS amount_type TEXT NOT NULL DEFAULT 'fixed' CHECK (amount_type IN ('fixed', 'flexible')),
ADD COLUMN IF NOT EXISTS min_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS max_amount DECIMAL(10,2);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkout_links_amount_type ON checkout_links(amount_type);

-- Add comments for documentation
COMMENT ON COLUMN checkout_links.amount_type IS 'Type of amount: fixed (specific amount) or flexible (customer enters amount within limits)';
COMMENT ON COLUMN checkout_links.min_amount IS 'Minimum amount for flexible checkout links';
COMMENT ON COLUMN checkout_links.max_amount IS 'Maximum amount for flexible checkout links'; 