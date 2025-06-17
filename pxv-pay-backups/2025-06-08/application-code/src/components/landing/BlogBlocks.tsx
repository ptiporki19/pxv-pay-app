'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  User, 
  Clock,
  ArrowRight,
  FileText
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string | null
  published: boolean
  author_id: string
  created_at: string
  updated_at: string
  published_at: string | null
  tags: string[]
}

interface Author {
  id: string
  email: string
  full_name?: string
}

export default function BlogBlocks() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [authors, setAuthors] = useState<{[key: string]: Author}>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Calculate reading time
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)
    return readingTime
  }

  // Fetch blog posts
  const fetchPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(6) // Show latest 6 posts

      if (error) throw error

      if (postsData && postsData.length > 0) {
        setPosts(postsData)

        // Fetch authors
        const authorIds = [...new Set(postsData.map(post => post.author_id))]
        const { data: authorsData } = await supabase
          .from('users')
          .select('id, email, full_name')
          .in('id', authorIds)

        if (authorsData) {
          const authorsMap: {[key: string]: Author} = {}
          authorsData.forEach(author => {
            authorsMap[author.id] = author
          })
          setAuthors(authorsMap)
        }
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()

    // Set up real-time subscription
    const subscription = supabase
      .channel('blog_blocks_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'blog_posts' 
      }, () => {
        fetchPosts() // Refetch when changes occur
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  if (isLoading) {
    return (
      <section className="py-20 bg-transparent dark:bg-transparent">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
              <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
              Latest Insights
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white">
              Latest from our <span className="bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 bg-clip-text text-transparent">Blog</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (posts.length === 0) {
    return null // Don't show the section if no posts
  }

  return (
    <section className="py-20 bg-transparent dark:bg-transparent">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
            <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
            Latest Insights
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white">
            Latest from our <span className="bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 bg-clip-text text-transparent">Blog</span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Stay updated with the latest insights on payments, fintech innovations, and global commerce trends.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="group h-full bg-white dark:bg-gray-900 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                {/* Featured Image */}
                {post.featured_image && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags?.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-black dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  {/* Excerpt */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                    {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}
                  </p>
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>
                          {authors[post.author_id]?.full_name || 
                            authors[post.author_id]?.email?.split('@')[0] || 
                            'PXV Team'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{calculateReadingTime(post.content)} min read</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {post.published_at 
                          ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true })
                          : formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3">
            <Link href="/blog" className="flex items-center gap-2">
              View All Articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
} 