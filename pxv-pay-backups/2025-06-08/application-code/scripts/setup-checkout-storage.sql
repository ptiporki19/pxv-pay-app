-- Checkout System Storage Setup
-- Phase 1: Create new storage buckets only (no modifications to existing buckets)
-- Following checkout-development.mcd rules

-- Note: payment-proofs and merchant-logos buckets already exist
-- We'll use the existing buckets and just add new RLS policies for checkout functionality

-- RLS Policies for payment-proofs bucket
-- Merchants can view proofs for their own payments
CREATE POLICY "Merchants can view their payment proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-proofs' AND
  EXISTS (
    SELECT 1 FROM payments p
    JOIN checkout_links cl ON p.checkout_link_id = cl.id
    WHERE cl.merchant_id = auth.uid()
    AND storage.foldername(name)[1] = cl.merchant_id::text
  )
);

-- Customers can upload payment proofs (during checkout flow)
CREATE POLICY "Allow payment proof uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  -- File path should be: merchant_id/payment_id/filename
  array_length(storage.foldername(name), 1) = 2
);

-- Super admins can view all payment proofs
CREATE POLICY "Super admins can view all payment proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-proofs' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- RLS Policies for merchant-logos bucket
-- Merchants can manage their own logos
CREATE POLICY "Merchants can manage their logos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'merchant-logos' AND
  storage.foldername(name)[1] = auth.uid()::text
);

-- Public read access for merchant logos (since bucket is public)
CREATE POLICY "Public read access for merchant logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'merchant-logos');

-- Super admins can manage all merchant logos
CREATE POLICY "Super admins can manage all merchant logos"
ON storage.objects FOR ALL
USING (
  bucket_id = 'merchant-logos' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Add comments for documentation
COMMENT ON POLICY "Merchants can view their payment proofs" ON storage.objects IS 'Allows merchants to view payment proofs uploaded for their checkout links';
COMMENT ON POLICY "Allow payment proof uploads" ON storage.objects IS 'Allows customers to upload payment proofs during checkout flow';
COMMENT ON POLICY "Merchants can manage their logos" ON storage.objects IS 'Allows merchants to upload and manage their logos for checkout customization'; 