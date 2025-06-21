import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BackgroundEffects, { PaymentShapes, ParticleField, GradientOverlay, GeometricAccents } from '@/components/ui/background-effects'
import { DepthLayers, AmbientLighting } from '@/components/ui/scroll-effects'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { 
  Calendar, 
  User, 
  Clock,
  ArrowLeft,
  Tag,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

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

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params
  
  // Fetch the post by slug
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  
  if (!post) {
    return {
      title: 'Post Not Found - PXV Pay',
      description: 'The requested blog post could not be found.'
    }
  }
  
  return {
    title: post.meta_title || post.title + ' - PXV Pay Blog',
    description: post.meta_description || post.excerpt || 'Read our latest blog post on PXV Pay',
    openGraph: post.featured_image ? {
      images: [post.featured_image]
    } : undefined
  }
}

// Calculate reading time
function calculateReadingTime(content: string) {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await params
  
  // Fetch the post by slug
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  
  if (error || !post) {
    notFound()
  }
  
  // Get author info
  const { data: author } = await supabase
    .from('users')
    .select('id, email, full_name, avatar_url')
    .eq('id', post.author_id)
    .single()
  
  // Get related posts with similar tags
  let relatedPosts: BlogPost[] = []
  
  if (post.tags && post.tags.length > 0) {
    const { data: relatedData } = await supabase
      .from('blog_posts')
      .select('*')
      .neq('id', post.id)
      .eq('published', true)
      .contains('tags', post.tags)
      .order('published_at', { ascending: false })
      .limit(3)
    
    if (relatedData && relatedData.length > 0) {
      relatedPosts = relatedData
    } else {
      // If no related posts found, get latest posts
      const { data: latestPosts } = await supabase
        .from('blog_posts')
        .select('*')
        .neq('id', post.id)
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(3)
      
      if (latestPosts) {
        relatedPosts = latestPosts
      }
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-transparent">
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
          {/* Back to Blog Link */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
              asChild
            >
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
          
          <article className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-12">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags?.map((tag: string) => (
                  <Badge
                    key={tag}
                    className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-black dark:text-white mb-6">
                {post.title}
              </h1>
              
              {/* Meta */}
              <div className="flex flex-wrap gap-6 items-center mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="mr-2 h-4 w-4" />
                  {post.published_at 
                    ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true })
                    : formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
                </div>
                
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <User className="mr-2 h-4 w-4" />
                  {author?.full_name || 
                   author?.email?.split('@')[0] || 
                   'PXV Pay Team'}
                </div>
                
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="mr-2 h-4 w-4" />
                  {calculateReadingTime(post.content)} min read
                </div>
              </div>
              
              {/* Excerpt */}
              {post.excerpt && (
                <div className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed border-l-4 border-violet-500 pl-4 py-2 mb-8">
                  {post.excerpt}
                </div>
              )}
              
              {/* Featured Image */}
              {post.featured_image && (
                <img 
                  src={post.featured_image} 
                  alt={post.title}
                  className="w-full h-auto rounded-2xl shadow-lg mb-12"
                />
              )}
            </header>
            
            {/* Content */}
            <div 
              className="prose prose-lg dark:prose-invert prose-headings:text-black dark:prose-headings:text-white prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-a:text-violet-600 dark:prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg max-w-none mb-16"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 py-8 border-t border-b border-gray-200 dark:border-gray-800 mb-16">
              {post.tags?.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-gray-700 dark:text-gray-300"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </article>
          
          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-8">
                Related Articles
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                    <div className="group h-full bg-white dark:bg-gray-900 rounded-2xl p-6 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1">
                      <h3 className="text-lg font-bold text-black dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">
                        {relatedPost.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      
                      <span className="text-violet-600 dark:text-violet-400 text-sm font-medium flex items-center group-hover:translate-x-0.5 transition-transform duration-300">
                        Read article
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* CTA Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
                Ready to optimize your payments?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
                Join thousands of businesses using PXV Pay to accept global payments with local methods.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white" asChild>
                  <Link href="/signup">Get Started Free</Link>
                </Button>
                <Button variant="outline" className="border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 