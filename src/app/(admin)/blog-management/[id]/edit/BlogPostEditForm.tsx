'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus,
  X,
  Upload,
  Trash2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useToast } from '@/hooks/use-toast'
import { ToastDisplay } from '@/components/ui/toast-display'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string | null
  published: boolean
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  tags: string[]
}

interface BlogPostEditFormProps {
  user: User
  initialData: BlogPost
}

export default function BlogPostEditForm({ user, initialData }: BlogPostEditFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toasts, success, error, removeToast } = useToast()

  const [formData, setFormData] = useState({
    title: initialData.title,
    slug: initialData.slug,
    content: initialData.content,
    excerpt: initialData.excerpt || '',
    featured_image: initialData.featured_image || '',
    published: initialData.published,
    published_at: initialData.published_at || null,
    meta_title: initialData.meta_title || '',
    meta_description: initialData.meta_description || '',
    tags: initialData.tags || []
  })

  const [newTag, setNewTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error('Invalid file type', 'Please select a valid image file')
      return
    }

    // Validate file size (10MB limit - will be automatically resized)
    if (file.size > 10 * 1024 * 1024) {
      error('File too large', 'Image size must be less than 10MB')
      return
    }

    try {
      setUploadingImage(true)

      console.log('📤 Uploading blog image via API...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })

      // Create FormData and call API route (same pattern as payment proof upload)
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/blog/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image')
      }

      console.log('✅ Image uploaded and resized successfully:', result.imageUrl)
      
      setFormData(prev => ({
        ...prev,
        featured_image: result.imageUrl
      }))

      success('Image uploaded successfully', 'Your featured image has been uploaded, automatically resized to 1200x675px, and optimized for web display.')

    } catch (err: any) {
      console.error('Error uploading image:', err)
      error('Upload failed', `Failed to upload image: ${err.message || 'Unknown error'}. You can use the URL input instead.`)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = '' // Reset file input
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      error('Title required', 'Please enter a title for your blog post.')
      return
    }

    if (!formData.content.trim()) {
      error('Content required', 'Please add some content to your blog post.')
      return
    }

    setIsLoading(true)

    try {
      const updateData = {
        ...formData,
        published_at: formData.published && !initialData.published ? new Date().toISOString() : (formData.published ? initialData.published_at : null),
        updated_at: new Date().toISOString()
      }

      const { data, error: updateError } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', initialData.id)
        .select()
        .single()

      if (updateError) throw updateError

      success('Blog post updated!', `Your ${formData.published ? 'published' : 'draft'} blog post has been updated successfully.`)
      
      // Small delay to show the success message before redirecting
      setTimeout(() => {
        router.push('/blog-management')
      }, 1500)

    } catch (err: any) {
      console.error('Error updating blog post:', err)
      error('Failed to update blog post', err.message || 'Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)

    try {
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', initialData.id)

      if (deleteError) throw deleteError

      success('Blog post deleted', 'The blog post has been permanently deleted.')
      
      // Small delay to show the success message before redirecting
      setTimeout(() => {
        router.push('/blog-management')
      }, 1500)

    } catch (err: any) {
      console.error('Error deleting blog post:', err)
      error('Failed to delete blog post', err.message || 'Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePreview = () => {
    if (formData.slug) {
      window.open(`/blog/${formData.slug}`, '_blank')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notifications */}
      <ToastDisplay toasts={toasts} onRemove={removeToast} />
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/blog-management" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog Management
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Blog Post
          </h1>
          <p className="text-muted-foreground">
            Update your blog post content and settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handlePreview}
            disabled={!formData.slug}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !formData.title || !formData.content}
            className="btn-primary"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Updating...' : 'Update Post'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
              <CardDescription>
                Update your blog post content using the rich text editor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-slug"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Will be used in the URL: /blog/{formData.slug}
                </p>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the post..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Write your blog post content here..."
                  maxHeight="400px"
                  outputFormat="html"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use the toolbar above to format your content with headings, lists, links, and more
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
              <CardDescription>
                Upload an image for the blog post. Images are automatically resized to 1200x675px and optimized for web display.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Preview */}
              {formData.featured_image && (
                <div className="relative">
                  <img
                    src={formData.featured_image}
                    alt="Featured image preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Upload Button */}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <p className="text-xs text-muted-foreground">
                  Supports: JPEG, PNG, GIF, WebP • Max size: 10MB<br />
                  Images are automatically resized to 1200×675px for consistency
                </p>
                
                {/* Alternative direct URL input */}
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    Or enter image URL directly:
                  </p>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.featured_image || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Published</Label>
                <Switch
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.published 
                  ? 'Post is visible to the public'
                  : 'Post is saved as a draft'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Add tags to categorize your post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" size="sm" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your post for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="SEO title (optional)"
                />
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO description (optional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
} 