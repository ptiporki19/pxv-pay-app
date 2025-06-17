-- Storage RLS Policies for PXV Pay

-- Payment Proofs bucket policies (private)
CREATE POLICY "Users can upload their own payment proofs"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'payment-proofs' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Users can view their own payment proofs"
ON storage.objects FOR SELECT 
TO authenticated
USING (bucket_id = 'payment-proofs' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Super admins can view all payment proofs"
ON storage.objects FOR SELECT 
TO authenticated
USING (bucket_id = 'payment-proofs' AND EXISTS (
  SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'super_admin'
));

CREATE POLICY "Super admins can manage all payment proofs"
ON storage.objects FOR ALL 
TO authenticated
USING (bucket_id = 'payment-proofs' AND EXISTS (
  SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'super_admin'
));

-- Merchant Logos bucket policies (public read, restricted upload)
CREATE POLICY "Anyone can view merchant logos"
ON storage.objects FOR SELECT 
USING (bucket_id = 'merchant-logos');

CREATE POLICY "Merchant owners can upload logos"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'merchant-logos' AND EXISTS (
  SELECT 1 FROM public.merchants WHERE merchants.owner_id = auth.uid()
));

CREATE POLICY "Super admins can manage all merchant logos"
ON storage.objects FOR ALL 
TO authenticated
USING (bucket_id = 'merchant-logos' AND EXISTS (
  SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'super_admin'
));

-- Payment Method Icons bucket policies (public read, admin only upload)
CREATE POLICY "Anyone can view payment method icons"
ON storage.objects FOR SELECT 
USING (bucket_id = 'payment-method-icons');

CREATE POLICY "Super admins can manage payment method icons"
ON storage.objects FOR ALL 
TO authenticated
USING (bucket_id = 'payment-method-icons' AND EXISTS (
  SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'super_admin'
));

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

CREATE POLICY "Super admins can view all avatars"
ON storage.objects FOR SELECT 
TO authenticated
USING (bucket_id = 'user-avatars' AND EXISTS (
  SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'super_admin'
));

-- Blog Images bucket policies (public read, admin only upload)
CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT 
USING (bucket_id = 'blog-images');

CREATE POLICY "Super admins can manage blog images"
ON storage.objects FOR ALL 
TO authenticated
USING (bucket_id = 'blog-images' AND EXISTS (
  SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'super_admin'
)); 