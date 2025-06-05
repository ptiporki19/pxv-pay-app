-- Product Checkout Enhancements Migration
-- Adding support for product-based checkout links

-- Add product-related columns to checkout_links table
ALTER TABLE checkout_links 
ADD COLUMN IF NOT EXISTS checkout_type TEXT NOT NULL DEFAULT 'simple' CHECK (checkout_type IN ('simple', 'product')),
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_description TEXT,
ADD COLUMN IF NOT EXISTS product_image_url TEXT,
ADD COLUMN IF NOT EXISTS amount_type TEXT NOT NULL DEFAULT 'fixed' CHECK (amount_type IN ('fixed', 'flexible')),
ADD COLUMN IF NOT EXISTS min_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS max_amount DECIMAL(10,2);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkout_links_checkout_type ON checkout_links(checkout_type);
CREATE INDEX IF NOT EXISTS idx_checkout_links_amount_type ON checkout_links(amount_type);

-- Add comments for documentation
COMMENT ON COLUMN checkout_links.checkout_type IS 'Type of checkout: simple (payment collection) or product (product sales)';
COMMENT ON COLUMN checkout_links.product_name IS 'Product name for product checkout type';
COMMENT ON COLUMN checkout_links.product_description IS 'Product description for product checkout type';
COMMENT ON COLUMN checkout_links.product_image_url IS 'Product image URL for product checkout type';
COMMENT ON COLUMN checkout_links.amount_type IS 'Type of amount: fixed (specific amount) or flexible (customer enters amount within limits)';
COMMENT ON COLUMN checkout_links.min_amount IS 'Minimum amount for flexible checkout links';
COMMENT ON COLUMN checkout_links.max_amount IS 'Maximum amount for flexible checkout links'; 