-- Add public read access for active product templates
-- This is needed for checkout pages to display product information

-- Allow public read access to active product templates
-- This enables checkout validation API to fetch product details for display
CREATE POLICY "Public can view active product templates" 
ON product_templates FOR SELECT 
USING (is_active = true);

-- Add comment for documentation
COMMENT ON POLICY "Public can view active product templates" ON product_templates 
IS 'Allows public/anonymous access to active product templates for checkout page display'; 