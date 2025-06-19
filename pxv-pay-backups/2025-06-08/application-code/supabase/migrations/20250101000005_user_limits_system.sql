-- User Limits System Migration
-- Adding future-ready restrictions for checkout links and other features
-- This system is inactive for MVP but ready to be activated later

-- Create user_limits table for managing user restrictions
CREATE TABLE IF NOT EXISTS user_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL DEFAULT 'registered_user' CHECK (user_role IN ('super_admin', 'registered_user', 'subscriber', 'free_user')),
  
  -- Checkout Links Limits
  max_checkout_links INTEGER DEFAULT NULL, -- NULL means unlimited (for MVP)
  current_checkout_links INTEGER DEFAULT 0,
  
  -- Payment Limits (for future use)
  max_monthly_payments INTEGER DEFAULT NULL,
  current_monthly_payments INTEGER DEFAULT 0,
  
  -- Storage Limits (for future use)
  max_storage_mb INTEGER DEFAULT NULL,
  current_storage_mb INTEGER DEFAULT 0,
  
  -- Feature Access Flags (for future use)
  can_use_analytics BOOLEAN DEFAULT true,
  can_use_webhooks BOOLEAN DEFAULT true,
  can_customize_branding BOOLEAN DEFAULT true,
  can_export_data BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per user
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_limits_user_id ON user_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_limits_role ON user_limits(user_role);

-- Enable RLS
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_limits
CREATE POLICY "Users can view own limits" ON user_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all limits" ON user_limits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update all limits" ON user_limits
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "System can insert limits" ON user_limits
  FOR INSERT WITH CHECK (true);

-- Function to initialize user limits when a user is created
CREATE OR REPLACE FUNCTION initialize_user_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- Get user role from users table
  DECLARE
    user_role_val TEXT;
  BEGIN
    SELECT role INTO user_role_val 
    FROM users 
    WHERE id = NEW.id;
    
    -- Set default limits based on role (all unlimited for MVP)
    INSERT INTO user_limits (
      user_id, 
      user_role,
      max_checkout_links,
      max_monthly_payments,
      max_storage_mb,
      can_use_analytics,
      can_use_webhooks,
      can_customize_branding,
      can_export_data
    ) VALUES (
      NEW.id,
      COALESCE(user_role_val, 'registered_user'),
      NULL, -- Unlimited for MVP
      NULL, -- Unlimited for MVP
      NULL, -- Unlimited for MVP
      true, -- All features enabled for MVP
      true,
      true,
      true
    ) ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize limits for new users
DROP TRIGGER IF EXISTS initialize_user_limits_trigger ON auth.users;
CREATE TRIGGER initialize_user_limits_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_limits();

-- Function to update checkout links count
CREATE OR REPLACE FUNCTION update_checkout_links_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment count
    UPDATE user_limits 
    SET current_checkout_links = current_checkout_links + 1,
        updated_at = NOW()
    WHERE user_id = NEW.merchant_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement count
    UPDATE user_limits 
    SET current_checkout_links = GREATEST(current_checkout_links - 1, 0),
        updated_at = NOW()
    WHERE user_id = OLD.merchant_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update checkout links count
DROP TRIGGER IF EXISTS update_checkout_links_count_trigger ON checkout_links;
CREATE TRIGGER update_checkout_links_count_trigger
  AFTER INSERT OR DELETE ON checkout_links
  FOR EACH ROW
  EXECUTE FUNCTION update_checkout_links_count();

-- Function to check if user can create checkout link (for future use)
CREATE OR REPLACE FUNCTION can_create_checkout_link(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_limits_rec user_limits%ROWTYPE;
BEGIN
  SELECT * INTO user_limits_rec 
  FROM user_limits 
  WHERE user_id = user_id_param;
  
  -- If no limits record exists, allow (shouldn't happen but safe fallback)
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  -- If max_checkout_links is NULL, unlimited (MVP behavior)
  IF user_limits_rec.max_checkout_links IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if under limit
  RETURN user_limits_rec.current_checkout_links < user_limits_rec.max_checkout_links;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initialize limits for existing users
INSERT INTO user_limits (user_id, user_role, max_checkout_links)
SELECT 
  u.id,
  COALESCE(u.role, 'registered_user'),
  NULL -- Unlimited for MVP
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_limits ul WHERE ul.user_id = u.id
);

-- Update current checkout links count for existing users
UPDATE user_limits 
SET current_checkout_links = (
  SELECT COUNT(*) 
  FROM checkout_links 
  WHERE checkout_links.merchant_id = user_limits.user_id
);

-- Add comments for documentation
COMMENT ON TABLE user_limits IS 'User limits and restrictions system - inactive for MVP, ready for post-MVP activation';
COMMENT ON COLUMN user_limits.max_checkout_links IS 'Maximum checkout links allowed (NULL = unlimited, used in MVP)';
COMMENT ON FUNCTION can_create_checkout_link IS 'Check if user can create new checkout link based on their limits';

-- Create view for easy limit checking (for future use)
CREATE OR REPLACE VIEW user_limits_summary AS
SELECT 
  ul.*,
  u.email,
  u.role as actual_user_role,
  CASE 
    WHEN ul.max_checkout_links IS NULL THEN 'Unlimited'
    ELSE ul.current_checkout_links || '/' || ul.max_checkout_links
  END as checkout_links_usage,
  CASE 
    WHEN ul.max_checkout_links IS NULL THEN true
    ELSE ul.current_checkout_links < ul.max_checkout_links
  END as can_create_more_links
FROM user_limits ul
JOIN users u ON u.id = ul.user_id; 