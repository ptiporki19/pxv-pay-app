'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Edit, 
  Eye, 
  Trash2, 
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
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { ToastDisplay } from '@/components/ui/toast-display'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string | null
  published: boolean
  author_id: string
  created_at: string
  updated_at: string
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  tags: string[]
}

interface Author {
  id: string
  email: string
}

interface BlogManagementClientProps {
  initialPosts: BlogPost[]
  authorsMap: { [key: string]: Author }
}

export default function BlogManagementClient({ 
  initialPosts, 
  authorsMap 
}: BlogManagementClientProps) {
  const supabase = createClient()
  const { toasts, success, error, removeToast } = useToast()
  
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [authors, setAuthors] = useState<{ [key: string]: Author }>(authorsMap)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Set up real-time subscription for blog posts
  useEffect(() => {
    const channel = supabase
      .channel('blog_management_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts',
        },
        async (payload) => {
          console.log('Blog post change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            const newPost = payload.new as BlogPost
            setPosts(prev => [newPost, ...prev])
            success('New blog post created!', 'A new blog post has been added.')
          } else if (payload.eventType === 'UPDATE') {
            const updatedPost = payload.new as BlogPost
            setPosts(prev => prev.map(post => 
              post.id === updatedPost.id ? updatedPost : post
            ))
            success('Blog post updated', 'The blog post has been updated successfully.')
          } else if (payload.eventType === 'DELETE') {
            const deletedPost = payload.old as BlogPost
            setPosts(prev => prev.filter(post => post.id !== deletedPost.id))
            success('Blog post deleted', 'The blog post has been removed.')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, success])

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(post.id)

    try {
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', post.id)

      if (deleteError) throw deleteError

      // The real-time subscription will handle updating the UI
      success('Blog post deleted', `"${post.title}" has been permanently deleted.`)

    } catch (err: any) {
      console.error('Error deleting blog post:', err)
      error('Failed to delete blog post', err.message || 'Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const togglePublished = async (post: BlogPost) => {
    try {
      const newPublishedState = !post.published
      const updateData = {
        published: newPublishedState,
        published_at: newPublishedState ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', post.id)

      if (updateError) throw updateError

      // The real-time subscription will handle updating the UI
      success(
        newPublishedState ? 'Post published' : 'Post unpublished',
        `"${post.title}" is now ${newPublishedState ? 'live' : 'a draft'}.`
      )

    } catch (err: any) {
      console.error('Error updating blog post:', err)
      error('Failed to update blog post', err.message || 'Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Toast Notifications */}
      <ToastDisplay toasts={toasts} onRemove={removeToast} />
      
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No blog posts found.</p>
          <Button asChild className="mt-4">
            <Link href="/blog-management/new">
              Create your first blog post
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm text-muted-foreground">
                        /blog/{post.slug}
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={post.published ? "default" : "secondary"}
                      className={post.published ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : ""}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {authors[post.author_id]?.email?.split('@')[0] || 'Unknown'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/blog-management/${post.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => togglePublished(post)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {post.published ? 'Unpublish' : 'Publish'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(post)}
                          disabled={deletingId === post.id}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === post.id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
} 