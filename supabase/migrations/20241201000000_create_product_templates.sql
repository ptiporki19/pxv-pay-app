-- Create product_templates table
CREATE TABLE IF NOT EXISTS product_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_key VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    
    -- Pricing
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    pricing_type VARCHAR(20) DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'flexible', 'tiered')),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    
    -- Categorization
    category VARCHAR(50) DEFAULT 'digital' CHECK (category IN ('digital', 'physical', 'service', 'subscription', 'donation')),
    tags TEXT[],
    
    -- Media
    featured_image TEXT, -- URL to featured image
    gallery_images TEXT[], -- Array of image URLs
    
    -- Rich content
    content_blocks JSONB DEFAULT '[]',
    features TEXT[],
    specifications JSONB DEFAULT '{}',
    
    -- SEO
    seo_title VARCHAR(255),
    seo_description TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, product_key)
);

-- Create indexes
CREATE INDEX idx_product_templates_user_id ON product_templates(user_id);
CREATE INDEX idx_product_templates_category ON product_templates(category);
CREATE INDEX idx_product_templates_is_active ON product_templates(is_active);
CREATE INDEX idx_product_templates_is_featured ON product_templates(is_featured);
CREATE INDEX idx_product_templates_created_at ON product_templates(created_at);

-- Enable RLS
ALTER TABLE product_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own product templates" 
ON product_templates FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own product templates" 
ON product_templates FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product templates" 
ON product_templates FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product templates" 
ON product_templates FOR DELETE 
USING (auth.uid() = user_id);

-- Super admins can view all product templates
CREATE POLICY "Super admins can view all product templates" 
ON product_templates FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER trigger_update_product_templates_updated_at
    BEFORE UPDATE ON product_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_product_templates_updated_at();

-- Update checkout_links table to support product templates (only if table exists)
DO $$
BEGIN
    -- Check if checkout_links table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'checkout_links') THEN
        -- Add columns if they don't exist
        ALTER TABLE checkout_links 
        ADD COLUMN IF NOT EXISTS checkout_type VARCHAR(20) DEFAULT 'simple' CHECK (checkout_type IN ('simple', 'product')),
        ADD COLUMN IF NOT EXISTS product_template_id UUID,
        ADD COLUMN IF NOT EXISTS override_pricing BOOLEAN DEFAULT false;

        -- Add foreign key constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.table_constraints 
            WHERE constraint_name = 'checkout_links_product_template_id_fkey'
        ) THEN
            ALTER TABLE checkout_links 
            ADD CONSTRAINT checkout_links_product_template_id_fkey 
            FOREIGN KEY (product_template_id) REFERENCES product_templates(id) ON DELETE SET NULL;
        END IF;

        -- Create index for product template relationship if it doesn't exist
        CREATE INDEX IF NOT EXISTS idx_checkout_links_product_template_id ON checkout_links(product_template_id);
    END IF;
END $$; 