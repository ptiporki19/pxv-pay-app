import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BlogPostEditForm from './BlogPostEditForm'

export const metadata: Metadata = {
  title: 'Edit Blog Post - PXV Pay',
  description: 'Edit an existing blog post',
}

export default async function EditBlogPostPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const id = params.id
  
  // Initialize Supabase client
  const supabase = await createClient()
  
  // Get user session and redirect if not authenticated
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/signin')
  }

  // Get user profile including role and email for super admin check
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Check if user is super admin (using both role and direct email check)
  const userEmail = session.user.email || ''
  const isSuperAdminEmail = userEmail === 'admin@pxvpay.com' || 
                            userEmail === 'dev-admin@pxvpay.com' || 
                            userEmail === 'superadmin@pxvpay.com'
  const isSuperAdminRole = profile?.role === 'super_admin'
  
  if (!isSuperAdminRole && !isSuperAdminEmail) {
    redirect('/dashboard')
  }

  // Fetch the blog post
  const { data: blogPost, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !blogPost) {
    notFound()
  }

  return <BlogPostEditForm user={session.user} initialData={blogPost} />
} 