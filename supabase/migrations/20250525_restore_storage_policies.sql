-- Restore Storage RLS Policies for PXV Pay
-- This migration restores all storage bucket policies that were lost during database reset

-- Payment Proofs bucket policies (private)
CREATE POLICY "Users can upload their own payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-proofs' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can view their own payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment-proofs' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can update their own payment proofs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'payment-proofs' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can delete their own payment proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'payment-proofs' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Super admins can access all payment proofs"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'payment-proofs' AND auth.email() = 'admin@pxvpay.com')
WITH CHECK (bucket_id = 'payment-proofs' AND auth.email() = 'admin@pxvpay.com');

-- Merchant Logos bucket policies (public)
CREATE POLICY "Anyone can view merchant logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'merchant-logos');

CREATE POLICY "Authenticated users can upload merchant logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'merchant-logos');

CREATE POLICY "Authenticated users can update merchant logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'merchant-logos');

CREATE POLICY "Super admins can manage merchant logos"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'merchant-logos' AND auth.email() = 'admin@pxvpay.com')
WITH CHECK (bucket_id = 'merchant-logos' AND auth.email() = 'admin@pxvpay.com');

-- Payment Method Icons bucket policies (public)
CREATE POLICY "Anyone can view payment method icons"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-method-icons');

CREATE POLICY "Authenticated users can upload payment method icons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-method-icons');

CREATE POLICY "Authenticated users can update payment method icons"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'payment-method-icons');

CREATE POLICY "Super admins can manage payment method icons"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'payment-method-icons' AND auth.email() = 'admin@pxvpay.com')
WITH CHECK (bucket_id = 'payment-method-icons' AND auth.email() = 'admin@pxvpay.com');

-- User Avatars bucket policies (private)
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-avatars' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can view their own avatar"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user-avatars' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user-avatars' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-avatars' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Super admins can access all user avatars"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'user-avatars' AND auth.email() = 'admin@pxvpay.com')
WITH CHECK (bucket_id = 'user-avatars' AND auth.email() = 'admin@pxvpay.com');

-- Blog Images bucket policies (public)
CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images');

CREATE POLICY "Super admins can manage blog images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'blog-images' AND auth.email() = 'admin@pxvpay.com')
WITH CHECK (bucket_id = 'blog-images' AND auth.email() = 'admin@pxvpay.com'); 