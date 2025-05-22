-- Setup proper tables with RLS policies for PXV Pay

---------------------
-- USERS TABLE
---------------------
-- Users table already exists in Supabase Auth, but we need to extend it
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  role TEXT NOT NULL DEFAULT 'registered_user' CHECK (role IN ('super_admin', 'registered_user', 'subscriber', 'free_user')),
  active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
-- Allow users to read their own profiles
CREATE POLICY users_read_own ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow super admins to read any user profile
CREATE POLICY users_super_admin_read_all ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Allow users to update their own profiles
CREATE POLICY users_update_own ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow super admins to update any user profile
CREATE POLICY users_super_admin_update_all ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

---------------------
-- PAYMENTS TABLE
---------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  amount TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  user_id UUID NOT NULL REFERENCES public.users(id),
  reference_id TEXT,
  payment_proof TEXT,
  proof_verified BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
-- Allow users to read their own payments
CREATE POLICY payments_read_own ON public.payments
  FOR SELECT USING (user_id = auth.uid());

-- Allow super admins to read all payments
CREATE POLICY payments_super_admin_read_all ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Allow users to create their own payments
CREATE POLICY payments_insert_own ON public.payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow super admins to update any payment
CREATE POLICY payments_super_admin_update_all ON public.payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

---------------------
-- NOTIFICATIONS TABLE
---------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  type TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
-- Allow users to read their own notifications
CREATE POLICY notifications_read_own ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- Allow users to update their own notifications (mark as read)
CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow super admins to create notifications for any user
CREATE POLICY notifications_super_admin_insert_all ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

---------------------
-- FUNCTIONS AND TRIGGERS
---------------------

-- Function to create a notification when a payment status changes
CREATE OR REPLACE FUNCTION create_payment_notification()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_description TEXT;
BEGIN
  -- Set notification title and description based on the new status
  IF NEW.status = 'completed' THEN
    notification_title := 'Payment Completed';
    notification_description := 'Your payment of $' || NEW.amount || ' has been completed.';
  ELSIF NEW.status = 'pending' THEN
    notification_title := 'Payment Processing';
    notification_description := 'Your payment of $' || NEW.amount || ' is being processed.';
  ELSIF NEW.status = 'failed' THEN
    notification_title := 'Payment Failed';
    notification_description := 'Your payment of $' || NEW.amount || ' has failed. Please check details.';
  ELSIF NEW.status = 'refunded' THEN
    notification_title := 'Payment Refunded';
    notification_description := 'Your payment of $' || NEW.amount || ' has been refunded.';
  END IF;

  -- Insert notification
  INSERT INTO public.notifications (title, description, type, user_id)
  VALUES (notification_title, notification_description, 'payment', NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for payment status changes
CREATE TRIGGER payment_status_change_trigger
AFTER INSERT OR UPDATE OF status ON public.payments
FOR EACH ROW
EXECUTE FUNCTION create_payment_notification();

-- Create sample data for testing
-- Insert a super admin user if one doesn't exist
INSERT INTO public.users (id, email, role)
SELECT auth.uid(), (SELECT email FROM auth.users WHERE id = auth.uid()), 'super_admin'
WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid())
AND NOT EXISTS (SELECT 1 FROM public.users WHERE role = 'super_admin')
ON CONFLICT (id) DO NOTHING;

-- You can uncomment and customize this section for test data
/*
-- Insert some sample payments (adjust user_id to a real user in your system)
INSERT INTO public.payments (amount, payment_method, status, user_id)
VALUES 
  ('500.00', 'Bank Transfer', 'completed', 'your-user-id-here'),
  ('350.00', 'Mobile Money', 'pending', 'your-user-id-here'),
  ('1200.00', 'Crypto', 'completed', 'your-user-id-here'),
  ('341.00', 'Bank Transfer', 'pending', 'your-user-id-here');
*/ 