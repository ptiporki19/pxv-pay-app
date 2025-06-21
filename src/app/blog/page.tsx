'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import BackgroundEffects, { PaymentShapes, ParticleField, GradientOverlay, GeometricAccents } from '@/components/ui/background-effects'
import { DepthLayers, AmbientLighting } from '@/components/ui/scroll-effects'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { 
  Calendar, 
  User, 
  ChevronRight, 
  Tag, 
  Clock,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { ToastDisplay } from '@/components/ui/toast-display'

// Define types
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
  full_name?: string
  avatar_url?: string
}

// Calculate reading time for post content
function calculateReadingTime(content: string) {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

export default function BlogPage() {
  const supabase = createClient()
  const { toasts, success, error, removeToast } = useToast()
  
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null)
  const [authors, setAuthors] = useState<{[key: string]: Author}>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  
  // Fetch posts and authors
  const fetchData = async () => {
    try {
      // Query published posts
      const { data: postsData, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
      
      if (error) throw error
      
      if (postsData && postsData.length > 0) {
        // Set the first post as featured
        setFeaturedPost(postsData[0])
        setPosts(postsData)
        
        // Extract all unique tags
        const tags = postsData.flatMap(post => post.tags || [])
        setAllTags([...new Set(tags)])
        
        // Fetch authors info
        const authorIds = [...new Set(postsData.map(post => post.author_id))]
        const { data: authorsData } = await supabase
          .from('users')
          .select('id, email')
          .in('id', authorIds)
        
        if (authorsData) {
          const authorsMap: {[key: string]: Author} = {}
          authorsData.forEach(author => {
            authorsMap[author.id] = author
          })
          setAuthors(authorsMap)
        }
      } else {
        setPosts([])
        setFeaturedPost(null)
        setAllTags([])
      }
    } catch (err) {
      console.error('Error fetching blog data:', err)
      error('Failed to load blog posts', 'Please refresh the page to try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [supabase])

  // Set up real-time subscription for blog posts
  useEffect(() => {
    const channel = supabase
      .channel('blog_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts',
        },
        (payload) => {
          console.log('Blog post change detected:', payload)
          
          // Refresh data when any blog post changes
          fetchData()
          
          // Show appropriate toast notification
          if (payload.eventType === 'INSERT') {
            success('New blog post published!', 'A new article is now available.')
          } else if (payload.eventType === 'UPDATE') {
            success('Blog post updated', 'An article has been updated.')
          } else if (payload.eventType === 'DELETE') {
            success('Blog post removed', 'An article has been removed from the blog.')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, success])
  
  // Filter posts based on search term and selected tag
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
      
    const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag))
    
    return matchesSearch && matchesTag
  })

  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
      {/* Toast Notifications */}
      <ToastDisplay toasts={toasts} onRemove={removeToast} />
      
      {/* Background Effects */}
      <AmbientLighting />
      <DepthLayers />
      <GradientOverlay />
      <BackgroundEffects />
      <PaymentShapes />
      <ParticleField />
      <GeometricAccents />
      
      <Header />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-6">
          {/* Blog Header */}
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900 text-sm font-medium text-violet-700 dark:text-violet-300 backdrop-blur-sm">
              <div className="w-2 h-2 bg-violet-500 rounded-full mr-2 animate-pulse"></div>
              Latest Insights
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black dark:text-white">
              PXV Pay <span className="bg-gradient-to-r from-violet-600 via-violet-500 to-violet-700 bg-clip-text text-transparent">Blog</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Insights, updates, and thought leadership on payments, fintech, and global commerce.
            </p>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search articles..."
                className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedTag && (
                <Badge
                  className="cursor-pointer bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800"
                  onClick={() => setSelectedTag(null)}
                >
                  Clear Filter
                </Badge>
              )}
              
              {allTags.slice(0, 8).map((tag: string) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer",
                    selectedTag === tag 
                      ? "bg-violet-600 hover:bg-violet-700 text-white"
                      : "hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-900 dark:hover:text-violet-300"
                  )}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                >
                  <Tag className="mr-1 h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin"></div>
            </div>
          ) : (
            <>
              {filteredPosts.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-4">
                    No posts found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    {searchTerm || selectedTag 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Check back soon for new content'}
                  </p>
                  {(searchTerm || selectedTag) && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedTag(null)
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Featured Post */}
                  {featuredPost && !selectedTag && !searchTerm && (
                    <div className="mb-16">
                      <Link href={`/blog/${featuredPost.slug}`}>
                        <div className="group relative bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20 rounded-3xl p-8 md:p-10 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                          {featuredPost.featured_image && (
                            <div className="absolute inset-0 opacity-10">
                              <img
                                src={featuredPost.featured_image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-violet-900/20" />
                            </div>
                          )}
                          
                          <div className="relative z-10">
                            <div className="space-y-4 mb-6">
                              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-600 text-white">
                                Featured
                              </div>
                              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black dark:text-white">
                                {featuredPost.title}
                              </h2>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
                              {featuredPost.excerpt || featuredPost.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'}
                            </p>
                            
                            <div className="flex flex-wrap gap-6 mb-6">
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="mr-2 h-4 w-4" />
                                {featuredPost.published_at 
                                  ? formatDistanceToNow(new Date(featuredPost.published_at), { addSuffix: true })
                                  : formatDistanceToNow(new Date(featuredPost.updated_at), { addSuffix: true })}
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <User className="mr-2 h-4 w-4" />
                                {authors[featuredPost.author_id]?.email?.split('@')[0] || 'PXV Pay Team'}
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="mr-2 h-4 w-4" />
                                {calculateReadingTime(featuredPost.content)} min read
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-8">
                              {featuredPost.tags?.map((tag: string) => (
                                <Badge
                                  key={tag}
                                  className="bg-white/60 dark:bg-black/60 text-gray-700 dark:text-gray-300"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <Button className="group bg-violet-600 hover:bg-violet-700 text-white">
                              Read Article
                              <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </Button>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}
                  
                  {/* All Posts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts
                      .filter(post => !featuredPost || post.id !== featuredPost.id || selectedTag || searchTerm)
                      .map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`}>
                          <div className="group h-full bg-white dark:bg-gray-900 rounded-2xl p-6 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                            {/* Featured Image */}
                            {post.featured_image && (
                              <div className="aspect-video overflow-hidden rounded-lg mb-4">
                                <img
                                  src={post.featured_image}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags?.slice(0, 3).map((tag: string) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-xl font-bold text-black dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">
                              {post.title}
                            </h3>
                            
                            {/* Excerpt */}
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                              {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}
                            </p>
                            
                            {/* Metadata */}
                            <div className="mt-auto">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <User className="mr-2 h-3 w-3" />
                                  <span className="truncate max-w-[100px]">
                                    {authors[post.author_id]?.email?.split('@')[0] || 'PXV Pay Team'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <Calendar className="mr-2 h-3 w-3" />
                                  {post.published_at 
                                    ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true })
                                    : formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
                                </div>
                              </div>
                              
                              <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {calculateReadingTime(post.content)} min read
                                </div>
                                
                                <span className="text-violet-600 dark:text-violet-400 text-sm font-medium flex items-center group-hover:translate-x-0.5 transition-transform duration-300">
                                  Read article
                                  <ChevronRight className="ml-1 h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 