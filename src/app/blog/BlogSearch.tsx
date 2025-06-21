'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  Tag, 
  X,
  Filter,
  User,
  Calendar,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
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

interface BlogSearchProps {
  initialPosts: BlogPost[]
  initialTags: string[]
  authors: {[key: string]: Author}
}

export default function BlogSearch({ initialPosts, initialTags, authors }: BlogSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  
  // Filter posts based on search term and selected tag
  useEffect(() => {
    const filtered = initialPosts.filter(post => {
      const matchesSearch = !searchTerm || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
        
      const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag))
      
      return matchesSearch && matchesTag
    })
    
    setFilteredPosts(filtered)
  }, [searchTerm, selectedTag, initialPosts])

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedTag(null)
  }

  return (
    <div className="mb-16">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
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
          {(searchTerm || selectedTag) && (
            <Badge
              className="cursor-pointer bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800"
              onClick={clearFilters}
            >
              <X className="mr-1 h-3 w-3" />
              Clear Filters
            </Badge>
          )}
          
          {initialTags.slice(0, 8).map((tag) => (
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
      
      {/* Search Results */}
      {(searchTerm || selectedTag) && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Search Results
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Found {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
            </div>
          </div>
          
          {filteredPosts.length === 0 ? (
            <Card className="bg-white dark:bg-gray-900">
              <CardContent className="py-12 text-center">
                <div className="flex justify-center mb-4">
                  <Filter className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                  No matching posts found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Try adjusting your search terms or filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <div className="group h-full bg-white dark:bg-gray-900 rounded-2xl p-6 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
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
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags?.slice(0, 2).map((tag: string) => (
                        <Badge
                          key={tag}
                          className={cn(
                            "text-xs bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
                            selectedTag === tag && "bg-violet-100 text-violet-800 dark:bg-violet-800 dark:text-violet-200"
                          )}
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
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">
                          {authors[post.author_id]?.full_name || 
                           authors[post.author_id]?.email?.split('@')[0] || 
                           'PXV Team'}
                        </span>
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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 