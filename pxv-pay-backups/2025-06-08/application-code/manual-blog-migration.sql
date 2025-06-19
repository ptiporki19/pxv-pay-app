-- Manual Blog Posts Migration for PXV Pay
-- Copy and paste this entire script into Supabase Studio SQL Editor

-- Create blog_posts table for content management
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    published BOOLEAN DEFAULT false NOT NULL,
    author_id UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    meta_title TEXT,
    meta_description TEXT,
    tags TEXT[] DEFAULT '{}' NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can view published blog posts
CREATE POLICY "Public can view published blog posts" 
ON blog_posts FOR SELECT 
TO anon, authenticated 
USING (published = true);

-- Super admins can do everything with blog posts
CREATE POLICY "Super admins can manage all blog posts" 
ON blog_posts FOR ALL 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'super_admin'
));

-- Authors can view their own drafts
CREATE POLICY "Authors can view own blog posts" 
ON blog_posts FOR SELECT 
TO authenticated 
USING (author_id = auth.uid());

-- Authors can create blog posts
CREATE POLICY "Authors can create blog posts" 
ON blog_posts FOR INSERT 
TO authenticated 
WITH CHECK (author_id = auth.uid());

-- Authors can update their own blog posts
CREATE POLICY "Authors can update own blog posts" 
ON blog_posts FOR UPDATE 
TO authenticated 
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    
    -- Set published_at when published status changes to true
    IF NEW.published = true AND OLD.published = false THEN
        NEW.published_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE OR REPLACE TRIGGER blog_posts_updated_at_trigger
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_posts_updated_at();

-- Add table and column comments
COMMENT ON TABLE blog_posts IS 'Stores blog posts and website content';
COMMENT ON COLUMN blog_posts.slug IS 'URL-friendly identifier for the blog post';
COMMENT ON COLUMN blog_posts.published IS 'Whether the blog post is visible to the public';
COMMENT ON COLUMN blog_posts.tags IS 'Array of tags for categorization';

-- Insert a sample blog post (optional)
INSERT INTO public.blog_posts (
    title,
    slug,
    content,
    excerpt,
    published,
    author_id,
    tags
) VALUES (
    'Welcome to PXV Pay Blog',
    'welcome-to-pxv-pay-blog',
    '# Welcome to PXV Pay Blog

This is our first blog post! Here you''ll find updates about our payment platform, tutorials, and industry insights.

## Features

- Real-time payment processing
- Multi-currency support
- Secure transactions
- Easy integration

Stay tuned for more updates!',
    'Welcome to our blog! Learn about PXV Pay features and updates.',
    true,
    (SELECT id FROM public.users WHERE role = 'super_admin' LIMIT 1),
    ARRAY['announcement', 'welcome']
) 
ON CONFLICT (slug) DO NOTHING; 