-- Fix storage policy for payment proofs to allow anonymous uploads during checkout

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "payment_proofs_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "payment_proofs_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "Allow payment proof uploads" ON storage.objects;
DROP POLICY IF EXISTS "Merchants can view their payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Super admins can view all payment proofs" ON storage.objects;

-- Create new policies that allow anonymous uploads during checkout
CREATE POLICY "Allow anonymous payment proof uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'payment-proofs' AND
  auth.role() = 'anon'
);

-- Allow authenticated users (merchants/admins) to view payment proofs
CREATE POLICY "Allow authenticated users to view payment proofs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'payment-proofs' AND
  auth.role() = 'authenticated'
);

-- Allow service role to manage all payment proofs (for API operations)
CREATE POLICY "Allow service role to manage payment proofs" ON storage.objects
FOR ALL USING (
  bucket_id = 'payment-proofs' AND
  auth.role() = 'service_role'
);

-- Ensure the payment-proofs bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payment-proofs', 'payment-proofs', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf'])
ON CONFLICT (id) DO NOTHING; 