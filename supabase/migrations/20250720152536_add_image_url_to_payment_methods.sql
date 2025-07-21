-- Add image_url column to payment_methods table
ALTER TABLE public.payment_methods 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_image_url ON public.payment_methods(image_url);

-- Create storage bucket for payment method images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-method-images',
  'payment-method-images',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow authenticated users to upload payment method images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-method-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow public read access to payment method images"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-method-images');

CREATE POLICY "Allow authenticated users to update payment method images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'payment-method-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete payment method images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'payment-method-images' AND
  auth.role() = 'authenticated'
);