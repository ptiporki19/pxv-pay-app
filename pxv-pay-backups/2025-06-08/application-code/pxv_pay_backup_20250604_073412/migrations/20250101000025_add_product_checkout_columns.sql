-- Add Product Checkout Columns Migration
-- Adding missing columns for product-based checkout functionality

-- Add product-related columns to checkout_links table
ALTER TABLE checkout_links 
ADD COLUMN IF NOT EXISTS product_template_id UUID REFERENCES product_templates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS custom_price DECIMAL(10,2);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checkout_links_product_template_id ON checkout_links(product_template_id);

-- Add comments for documentation
COMMENT ON COLUMN checkout_links.product_template_id IS 'Reference to product template for product checkout type';
COMMENT ON COLUMN checkout_links.custom_price IS 'Custom price override for product checkout (when not using product default price)';

-- Update existing product checkout links to have proper structure
-- This is safe as it only updates NULL values
UPDATE checkout_links 
SET checkout_type = 'product'
WHERE product_name IS NOT NULL AND checkout_type = 'simple';

-- Add constraint to ensure product checkout links have either product_template_id or product_name
-- (for backward compatibility with existing data)
ALTER TABLE checkout_links 
ADD CONSTRAINT checkout_links_product_data_check 
CHECK (
  (checkout_type = 'simple') OR 
  (checkout_type = 'product' AND (product_template_id IS NOT NULL OR product_name IS NOT NULL))
); 