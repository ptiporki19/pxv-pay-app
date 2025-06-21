-- Drop existing policies for payments table
DROP POLICY IF EXISTS payments_read_own ON public.payments;
DROP POLICY IF EXISTS payments_insert_own ON public.payments;

-- Check the structure of the payments table
\d public.payments

-- Add missing column if needed
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);

-- Now recreate policies with the correct column name
CREATE POLICY payments_read_own ON public.payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY payments_insert_own ON public.payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users, public.payments, public.notifications; 