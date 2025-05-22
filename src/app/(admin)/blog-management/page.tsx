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
  MoreHorizontal
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

  // Get user profile including role and email for super admin check
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Check if user is super admin (using both role and direct email check)
  const userEmail = session.user.email || ''
  const isSuperAdminEmail = userEmail === 'dev-admin@pxvpay.com' || userEmail === 'superadmin@pxvpay.com'
  const isSuperAdminRole = profile?.role === 'super_admin'
  
  if (!isSuperAdminRole && !isSuperAdminEmail) {
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
        <Button asChild className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200">
          <Link href="/blog-management/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Blog Post
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
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Blog Posts</CardTitle>
          <CardDescription>
            Manage all blog posts and website content from this central location
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{post.title}</div>
                          {post.excerpt && (
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {post.excerpt}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            /{post.slug}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={post.published ? "default" : "secondary"}
                          className={post.published 
                            ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
                            : "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                          }
                        >
                          {post.published ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {authorsMap.get(post.author_id)?.email?.split('@')[0] || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.slice(0, 2).map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags && post.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link 
                                href={`/blog-management/${post.id}/edit`}
                                className="flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {post.published && (
                              <DropdownMenuItem asChild>
                                <Link 
                                  href={`/blog/${post.slug}`}
                                  target="_blank"
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 flex items-center gap-2">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-semibold">No blog posts yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by creating your first blog post.
              </p>
              <Button asChild className="mt-4">
                <Link href="/blog-management/new">
                  Create First Post
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 