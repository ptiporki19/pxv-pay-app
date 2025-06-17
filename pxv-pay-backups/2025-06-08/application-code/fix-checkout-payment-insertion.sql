-- Fix checkout payment insertion by allowing service role to insert payments
-- This is needed for the checkout API to work properly when customers submit payment proofs

-- Allow service role (used by API) to insert payment records during checkout
CREATE POLICY IF NOT EXISTS "service_role_payments_insert" ON public.payments
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow service role to update payment records (for status updates)
CREATE POLICY IF NOT EXISTS "service_role_payments_update" ON public.payments
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service role to select payment records (for API responses)
CREATE POLICY IF NOT EXISTS "service_role_payments_select" ON public.payments
FOR SELECT
TO service_role
USING (true);

-- Add comment to document the purpose
COMMENT ON POLICY "service_role_payments_insert" ON public.payments IS 'Allows checkout API to create payment records during customer submissions';
COMMENT ON POLICY "service_role_payments_update" ON public.payments IS 'Allows API to update payment status during verification process';
COMMENT ON POLICY "service_role_payments_select" ON public.payments IS 'Allows API to retrieve payment data for responses and verification'; 