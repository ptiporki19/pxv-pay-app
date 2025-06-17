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
          <div className="border rounded-lg">
            {/* Table Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors duration-200 font-geist font-semibold text-sm">
              <div className="w-[200px]">Title</div>
              <div className="w-[100px]">Status</div>
              <div className="w-[120px]">Author</div>
              <div className="w-[100px]">Created</div>
              <div className="w-[100px]">Updated</div>
              <div className="w-[100px] text-right">Actions</div>
            </div>
            
            {/* Table Body */}
              {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between px-4 py-3 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                <div className="w-[200px]">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100 font-geist">
                    {post.title}
                  </div>
                  <div className="text-xs text-muted-foreground font-geist">
                    {post.slug}
                      </div>
                  <div className="text-xs text-muted-foreground mt-1 font-geist">
                    {post.content && post.content.length > 100 
                      ? post.content.substring(0, 100) + '...' 
                      : post.content || 'No content'
                    }
                        </div>
                    </div>
                <div className="w-[100px]">
                    <Badge 
                    variant={post.published ? 'default' : 'secondary'}
                    className="font-geist"
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </Badge>
                </div>
                <div className="w-[120px]">
                  <div className="text-sm text-gray-900 dark:text-gray-100 font-geist">
                        {authors[post.author_id]?.email?.split('@')[0] || 'Unknown'}
                  </div>
                </div>
                <div className="w-[100px]">
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-geist">
                    {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                <div className="w-[100px]">
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-geist">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </span>
                    </div>
                <div className="w-[100px] text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                        <Link href={`/blog-management/${post.id}/edit`} className="font-geist">
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                        <Link 
                          href={`/blog/${post.slug}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-geist"
                        >
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => togglePublished(post)}
                        className="text-red-600 font-geist"
                        >
                          {post.published ? 'Unpublish' : 'Publish'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(post)}
                        className="text-red-600 font-geist"
                        >
                        Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
} 