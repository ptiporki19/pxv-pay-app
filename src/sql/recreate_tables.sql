-- Recreate tables for PXV Pay

-- Drop tables if they exist
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.payments;
-- Don't drop users table as it's linked to auth

-- Create tables
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  role TEXT NOT NULL DEFAULT 'registered_user',
  active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  amount TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  user_id UUID NOT NULL REFERENCES public.users(id),
  reference_id TEXT,
  payment_proof TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  type TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY users_select ON public.users FOR SELECT USING (true);
CREATE POLICY payments_select ON public.payments FOR SELECT USING (true);
CREATE POLICY payments_insert ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY notifications_select ON public.notifications FOR SELECT USING (true);
CREATE POLICY notifications_update ON public.notifications FOR UPDATE USING (true);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.users, public.payments, public.notifications;

-- Insert sample data to test
INSERT INTO public.notifications (title, description, type, user_id)
SELECT 
  'Welcome to PXV Pay', 
  'Thank you for joining our payment platform. Get started by exploring the dashboard.', 
  'system',
  id
FROM public.users 
LIMIT 1;

-- Output for confirmation
SELECT 'Tables recreated successfully' AS result; 