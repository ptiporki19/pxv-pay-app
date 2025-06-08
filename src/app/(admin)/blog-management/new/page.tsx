import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BlogPostForm from './BlogPostForm'

export const metadata: Metadata = {
  title: 'Create New Blog Post - PXV Pay',
  description: 'Create a new blog post for your website',
}

export default async function NewBlogPostPage() {
  // Initialize Supabase client
  const supabase = await createClient()
  
  // Get user session and redirect if not authenticated
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/signin')
  }

  // Get user profile including role for super admin check
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Check if user is super admin (use ONLY database role)
  const isSuperAdmin = profile?.role === 'super_admin'
  
  if (!isSuperAdmin) {
    redirect('/dashboard')
  }

  return <BlogPostForm user={session.user} />
} 