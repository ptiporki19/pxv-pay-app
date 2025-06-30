-- Fix Support Tables - Remove Foreign Key Constraints Temporarily
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS support_ticket_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS support_categories CASCADE;

-- Recreate support categories table
CREATE TABLE support_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Recreate support tickets table WITHOUT foreign key constraint for now
CREATE TABLE support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL, -- No foreign key constraint for now
    category_id UUID NOT NULL REFERENCES support_categories(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Recreate support ticket messages table WITHOUT foreign key constraint for now
CREATE TABLE support_ticket_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- No foreign key constraint for now
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_category_id ON support_tickets(category_id);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX idx_support_ticket_messages_created_at ON support_ticket_messages(created_at);

-- Insert default support categories
INSERT INTO support_categories (name, description) VALUES
    ('General', 'General support questions and inquiries'),
    ('Technical', 'Technical issues and troubleshooting'),
    ('Billing', 'Billing and payment related questions'),
    ('Feature Request', 'Suggestions for new features or improvements'),
    ('Bug Report', 'Report bugs or issues with the application')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE support_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_categories
-- Anyone can read categories (needed for creating tickets)
CREATE POLICY "Anyone can read support categories" ON support_categories
    FOR SELECT USING (true);

-- Only super admins can manage categories
CREATE POLICY "Super admins can manage support categories" ON support_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- RLS Policies for support_tickets
-- Users can read their own tickets
CREATE POLICY "Users can read their own tickets" ON support_tickets
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can create their own tickets
CREATE POLICY "Users can create their own tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own tickets (limited fields)
CREATE POLICY "Users can update their own tickets" ON support_tickets
    FOR UPDATE USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

-- Super admins can read all tickets
CREATE POLICY "Super admins can read all tickets" ON support_tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- Super admins can update all tickets
CREATE POLICY "Super admins can update all tickets" ON support_tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- RLS Policies for support_ticket_messages
-- Users can read messages for their own tickets
CREATE POLICY "Users can read messages for their own tickets" ON support_ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE support_tickets.id = ticket_id 
            AND support_tickets.user_id::text = auth.uid()::text
        )
    );

-- Users can create messages for their own tickets
CREATE POLICY "Users can create messages for their own tickets" ON support_ticket_messages
    FOR INSERT WITH CHECK (
        auth.uid()::text = user_id::text AND
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE support_tickets.id = ticket_id 
            AND support_tickets.user_id::text = auth.uid()::text
        )
    );

-- Super admins can read all messages
CREATE POLICY "Super admins can read all messages" ON support_ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- Super admins can create messages on any ticket
CREATE POLICY "Super admins can create messages on any ticket" ON support_ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- Create function to update ticket updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_support_ticket_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON support_categories TO authenticated;
GRANT ALL ON support_tickets TO authenticated;
GRANT ALL ON support_ticket_messages TO authenticated;

-- Success message
SELECT 'Support tables created successfully without foreign key constraints!' as status; 