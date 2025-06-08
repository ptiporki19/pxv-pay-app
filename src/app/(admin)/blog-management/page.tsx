import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  FileText,
  Calendar,
  User,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import BlogManagementClient from './BlogManagementClient'

export const metadata: Metadata = {
  title: 'Blog Management - PXV Pay',
  description: 'Manage blog posts and website content',
}

export default async function BlogManagementPage() {
  // Initialize Supabase client
  const supabase = await createClient()
  
  // Get user session and redirect if not authenticated
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    // Let the RouteGuard component handle the redirect
    return null
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
    // Let the RouteGuard component handle the redirect
    return null
  }

  // Fetch all blog posts
  const { data: blogPosts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
  }

  const posts = blogPosts || []

  // Fetch user information for authors
  const authorIds = [...new Set(posts.map(post => post.author_id))]
  const { data: authors } = await supabase
    .from('users')
    .select('id, email')
    .in('id', authorIds)

  const authorsMap = new Map(authors?.map(author => [author.id, author]) || [])

  // Calculate statistics
  const totalPosts = posts.length
  const publishedPosts = posts.filter(post => post.published).length
  const draftPosts = posts.filter(post => !post.published).length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Blog Management
          </h1>
          <p className="text-muted-foreground">
            Create, edit, and manage all website content and blog posts
          </p>
        </div>
        <Button asChild className="btn-primary">
          <Link href="/blog-management/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Post
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All blog posts
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedPosts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Live on website
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{draftPosts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unpublished posts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Blog Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>
            Manage all your blog posts and content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlogManagementClient 
            initialPosts={posts} 
            authorsMap={Object.fromEntries(authorsMap)} 
          />
        </CardContent>
      </Card>
    </div>
  )
} 