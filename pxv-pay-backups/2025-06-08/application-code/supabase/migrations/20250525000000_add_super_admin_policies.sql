-- Add super admin policies for viewing all user data
-- Migration: 20250525000000_add_super_admin_policies.sql

-- Super admins can view all payments
CREATE POLICY "super_admin_view_all_payments" 
ON public.payments 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Super admins can view all countries
CREATE POLICY "super_admin_view_all_countries" 
ON public.countries 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Super admins can view all currencies
CREATE POLICY "super_admin_view_all_currencies" 
ON public.currencies 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Super admins can view all payment methods
CREATE POLICY "super_admin_view_all_payment_methods" 
ON public.payment_methods 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Super admins can update/manage all payments
CREATE POLICY "super_admin_manage_all_payments" 
ON public.payments 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Super admins can manage all countries
CREATE POLICY "super_admin_manage_all_countries" 
ON public.countries 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Super admins can manage all currencies
CREATE POLICY "super_admin_manage_all_currencies" 
ON public.currencies 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Super admins can manage all payment methods
CREATE POLICY "super_admin_manage_all_payment_methods" 
ON public.payment_methods 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Add comment
COMMENT ON POLICY "super_admin_view_all_payments" ON public.payments IS 'Allows super admins to view all payments for user management'; 