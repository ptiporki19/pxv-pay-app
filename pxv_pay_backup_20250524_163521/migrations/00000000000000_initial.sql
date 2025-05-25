-- Create user_role enum
CREATE TYPE user_role AS ENUM ('super_admin', 'registered_user', 'subscriber', 'free_user');

-- Create users table
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    role user_role DEFAULT 'registered_user' NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Super admins can view all users
CREATE POLICY "Super admins can view all users" 
ON public.users FOR SELECT 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'super_admin'
));

-- Super admins can update all users
CREATE POLICY "Super admins can update all users" 
ON public.users FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'super_admin'
));

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'registered_user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 