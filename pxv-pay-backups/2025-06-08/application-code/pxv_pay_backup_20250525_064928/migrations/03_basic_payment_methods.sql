CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('bank', 'mobile', 'crypto', 'payment-link')),
    countries TEXT[] DEFAULT '{}' NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'inactive')),
    icon TEXT,
    instructions TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT payment_methods_url_required_for_links 
    CHECK (
        (type = 'payment-link' AND url IS NOT NULL) OR 
        (type != 'payment-link')
    )
);

-- Add RLS policies
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create a policy for admins to manage payment methods
CREATE POLICY admin_payment_methods_policy ON payment_methods 
FOR ALL 
TO authenticated 
USING (true);

COMMENT ON TABLE payment_methods IS 'Stores payment methods configuration';
COMMENT ON COLUMN payment_methods.type IS 'Payment method type: bank, mobile, crypto, payment-link'; 