-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for generating secure random values
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Set up realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  user_type TEXT NOT NULL DEFAULT 'customer', -- 'customer', 'merchant', 'admin'
  merchant_id UUID, -- For merchant staff accounts
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alter the pgbouncer user to be able to access the RLS policy data
ALTER USER postgres SET search_path = "$user", public, auth;

-- Add this table to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Create merchants table 
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'suspended'
  owner_id UUID REFERENCES auth.users(id),
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add this table to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE merchants;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  merchant_id UUID REFERENCES merchants(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  country TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add this table to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE payments;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add this table to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'pending', 'inactive'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add this table to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE countries;

-- Create currencies table
CREATE TABLE IF NOT EXISTS currencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  symbol TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'pending', 'inactive'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add this table to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE currencies;

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'bank', 'mobile', 'crypto'
  countries TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'pending', 'inactive'
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add this table to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE payment_methods;

-- Create audit_logs table for tracking administrative actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add this table to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;

-- RLS Policies

-- Profiles: Can be read by the user themselves, their merchant admins, and system admins
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Merchant owners can view their staff profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM merchants m 
      JOIN profiles p ON m.owner_id = p.id 
      WHERE p.id = auth.uid() AND profiles.merchant_id = m.id
    )
  );

-- Merchants: Can be read by everyone, but only updated by owners or admins
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view merchants"
  ON merchants
  FOR SELECT
  USING (true);

CREATE POLICY "Only owners can update merchants"
  ON merchants
  FOR UPDATE
  USING (
    owner_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can delete merchants"
  ON merchants
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Payments: Users can see their own payments, merchants can see payments to them
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Merchants can view payments to them"
  ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM merchants 
      WHERE payments.merchant_id = merchants.id 
      AND (merchants.owner_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM profiles 
             WHERE profiles.id = auth.uid() 
             AND profiles.merchant_id = merchants.id
           )
      )
    )
  );

CREATE POLICY "Admins can view all payments"
  ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Users can create their own payments"
  ON payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Merchants can update payment status"
  ON payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM merchants 
      WHERE payments.merchant_id = merchants.id 
      AND (merchants.owner_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM profiles 
             WHERE profiles.id = auth.uid() 
             AND profiles.merchant_id = merchants.id
           )
      )
    )
  );

CREATE POLICY "Admins can update all payments"
  ON payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Notifications: Users can only see their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Countries, Currencies, Payment Methods: Can be read by everyone, only updated by admins
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read reference data
CREATE POLICY "Everyone can view countries"
  ON countries
  FOR SELECT
  USING (true);

CREATE POLICY "Everyone can view currencies"
  ON currencies
  FOR SELECT
  USING (true);

CREATE POLICY "Everyone can view payment methods"
  ON payment_methods
  FOR SELECT
  USING (true);

-- Only admins can modify reference data
CREATE POLICY "Only admins can modify countries"
  ON countries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can modify currencies"
  ON currencies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can modify payment methods"
  ON payment_methods
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Audit logs: Only viewable by admins
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "System can create audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Function to create notifications when payment status changes
CREATE OR REPLACE FUNCTION create_payment_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (user_id, title, message, type, data)
    VALUES (
      NEW.user_id,
      CASE 
        WHEN NEW.status = 'completed' THEN 'Payment Completed'
        WHEN NEW.status = 'failed' THEN 'Payment Failed'
        WHEN NEW.status = 'refunded' THEN 'Payment Refunded'
        ELSE 'Payment Status Updated'
      END,
      CASE 
        WHEN NEW.status = 'completed' THEN 'Your payment of ' || NEW.amount || ' ' || NEW.currency || ' has been completed.'
        WHEN NEW.status = 'failed' THEN 'Your payment of ' || NEW.amount || ' ' || NEW.currency || ' has failed.'
        WHEN NEW.status = 'refunded' THEN 'Your payment of ' || NEW.amount || ' ' || NEW.currency || ' has been refunded.'
        ELSE 'Your payment status has been updated to ' || NEW.status || '.'
      END,
      CASE 
        WHEN NEW.status = 'completed' THEN 'success'
        WHEN NEW.status = 'failed' THEN 'error'
        WHEN NEW.status = 'refunded' THEN 'info'
        ELSE 'info'
      END,
      jsonb_build_object('payment_id', NEW.id, 'amount', NEW.amount, 'currency', NEW.currency, 'status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment notifications
CREATE TRIGGER payment_status_changed
AFTER UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION create_payment_notification();

-- Trigger function for audit logs
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
DECLARE
  old_data jsonb;
  new_data jsonb;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    old_data = to_jsonb(OLD);
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, old_data);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, old_data, new_data);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    new_data = to_jsonb(NEW);
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, new_data);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit log triggers to important tables
CREATE TRIGGER merchants_audit
AFTER INSERT OR UPDATE OR DELETE ON merchants
FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER payments_audit
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Create a trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update timestamp triggers
CREATE TRIGGER profiles_update_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER merchants_update_timestamp
BEFORE UPDATE ON merchants
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER payments_update_timestamp
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER countries_update_timestamp
BEFORE UPDATE ON countries
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER currencies_update_timestamp
BEFORE UPDATE ON currencies
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER payment_methods_update_timestamp
BEFORE UPDATE ON payment_methods
FOR EACH ROW EXECUTE FUNCTION update_timestamp(); 