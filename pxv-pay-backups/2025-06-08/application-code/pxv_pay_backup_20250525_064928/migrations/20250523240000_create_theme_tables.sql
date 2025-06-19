-- Create Theme Tables Migration
-- Migration: 20250523240000_create_theme_tables.sql
-- Purpose: Create theme and content management tables for customization functionality

-- STEP 1: Create themes table for user-specific theme customization
CREATE TABLE IF NOT EXISTS public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#64748b',
  accent_color TEXT DEFAULT '#06b6d4',
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#0f172a',
  border_color TEXT DEFAULT '#e2e8f0',
  success_color TEXT DEFAULT '#22c55e',
  warning_color TEXT DEFAULT '#f59e0b',
  error_color TEXT DEFAULT '#ef4444',
  font_family TEXT DEFAULT 'Inter',
  border_radius TEXT DEFAULT 'medium',
  logo_url TEXT,
  favicon_url TEXT,
  custom_css TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, name)
);

-- STEP 2: Create content_templates table for user-specific content management
CREATE TABLE IF NOT EXISTS public.content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text',
  category TEXT DEFAULT 'general',
  language TEXT DEFAULT 'en',
  variables JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, template_key)
);

-- STEP 3: Create theme_settings table for additional theme configurations
CREATE TABLE IF NOT EXISTS public.theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'string',
  description TEXT,
  is_advanced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, theme_id, setting_key)
);

-- STEP 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS themes_user_id_idx ON themes(user_id);
CREATE INDEX IF NOT EXISTS themes_user_active_idx ON themes(user_id, is_active);
CREATE INDEX IF NOT EXISTS content_templates_user_id_idx ON content_templates(user_id);
CREATE INDEX IF NOT EXISTS content_templates_user_key_idx ON content_templates(user_id, template_key);
CREATE INDEX IF NOT EXISTS content_templates_user_category_idx ON content_templates(user_id, category);
CREATE INDEX IF NOT EXISTS theme_settings_user_id_idx ON theme_settings(user_id);
CREATE INDEX IF NOT EXISTS theme_settings_theme_id_idx ON theme_settings(theme_id);

-- STEP 5: Enable RLS on all new tables
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create RLS policies for themes table
CREATE POLICY "themes_select_own" ON public.themes 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "themes_insert_own" ON public.themes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "themes_update_own" ON public.themes 
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "themes_delete_own" ON public.themes 
  FOR DELETE USING (auth.uid() = user_id);

-- STEP 7: Create RLS policies for content_templates table
CREATE POLICY "content_templates_select_own" ON public.content_templates 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "content_templates_insert_own" ON public.content_templates 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "content_templates_update_own" ON public.content_templates 
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "content_templates_delete_own" ON public.content_templates 
  FOR DELETE USING (auth.uid() = user_id);

-- STEP 8: Create RLS policies for theme_settings table
CREATE POLICY "theme_settings_select_own" ON public.theme_settings 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "theme_settings_insert_own" ON public.theme_settings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "theme_settings_update_own" ON public.theme_settings 
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "theme_settings_delete_own" ON public.theme_settings 
  FOR DELETE USING (auth.uid() = user_id);

-- STEP 9: Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_theme_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
DROP TRIGGER IF EXISTS update_themes_updated_at ON themes;
CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW EXECUTE FUNCTION update_theme_updated_at_column();

DROP TRIGGER IF EXISTS update_content_templates_updated_at ON content_templates;
CREATE TRIGGER update_content_templates_updated_at
  BEFORE UPDATE ON content_templates
  FOR EACH ROW EXECUTE FUNCTION update_theme_updated_at_column();

DROP TRIGGER IF EXISTS update_theme_settings_updated_at ON theme_settings;
CREATE TRIGGER update_theme_settings_updated_at
  BEFORE UPDATE ON theme_settings
  FOR EACH ROW EXECUTE FUNCTION update_theme_updated_at_column();

-- STEP 10: Insert default themes for existing users
INSERT INTO public.themes (
  user_id, name, primary_color, secondary_color, accent_color,
  background_color, text_color, border_color, success_color,
  warning_color, error_color, font_family, border_radius, is_active
)
SELECT 
  id,
  'Default Theme',
  '#3b82f6',
  '#64748b', 
  '#06b6d4',
  '#ffffff',
  '#0f172a',
  '#e2e8f0',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  'Inter',
  'medium',
  true
FROM public.users
ON CONFLICT (user_id, name) DO NOTHING;

-- STEP 11: Insert default content templates for existing users
INSERT INTO public.content_templates (
  user_id, template_key, title, content, category
)
SELECT 
  u.id,
  template.template_key,
  template.title,
  template.content,
  template.category
FROM public.users u
CROSS JOIN (
  VALUES 
    ('welcome_message', 'Welcome Message', 'Welcome to our secure payment portal. Please complete your payment safely.', 'checkout'),
    ('payment_instructions', 'Payment Instructions', 'Please follow the instructions below to complete your payment.', 'checkout'),
    ('success_message', 'Success Message', 'Your payment has been processed successfully. Thank you!', 'checkout'),
    ('footer_text', 'Footer Text', 'Secure payments powered by PXV Pay', 'general'),
    ('support_contact', 'Support Contact', 'For support, please contact us.', 'general')
) AS template(template_key, title, content, category)
ON CONFLICT (user_id, template_key) DO NOTHING; 