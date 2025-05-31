"use client"

import { useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useNotificationActions } from "@/providers/notification-provider"
import { useRouter } from "next/navigation"
import { Upload, Image as ImageIcon, Eye, Package, ArrowLeft, X } from 'lucide-react'
import { productTemplatesApi, type CreateProductTemplateData } from "@/lib/supabase/product-templates-api"
import { storageService } from "@/lib/supabase/storage"
import type { ProductTemplate } from "@/types/content"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

// Product categories
const productCategories = [
  { value: 'digital', label: 'Digital Products' },
  { value: 'physical', label: 'Physical Products' },
  { value: 'service', label: 'Services' },
  { value: 'subscription', label: 'Subscriptions' },
  { value: 'donation', label: 'Donations' }
]

// Simplified validation schema - remove pricing fields
const simpleProductSchema = z.object({
  name: z.string().min(1, "Product title is required").max(100, "Title must be less than 100 characters"),
  category: z.string().min(1, "Category is required"),
  featured_image: z.string().optional(),
})

type SimpleProductFormData = z.infer<typeof simpleProductSchema>

interface SimpleProductFormProps {
  initialData?: ProductTemplate
  onSuccess?: () => void
}

export function SimpleProductForm({ initialData, onSuccess }: SimpleProductFormProps) {
  const router = useRouter()
  const { showSuccess, showError } = useNotificationActions()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(initialData?.featured_image || '')
  const [description, setDescription] = useState<string>(initialData?.description || '')
  const [descriptionError, setDescriptionError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<SimpleProductFormData>({
    resolver: zodResolver(simpleProductSchema),
    defaultValues: {
      name: initialData?.name || '',
      category: initialData?.category || 'digital',
      featured_image: initialData?.featured_image || '',
    },
  })

  const watchedValues = form.watch()

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Error', 'Please select a valid image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showError('Error', 'Image size must be less than 5MB')
      return
    }

    try {
      setUploadingImage(true)
      
      // Get current user
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Upload to Supabase Storage
      const result = await storageService.uploadProductImage(file, user.id)
      
      setImagePreview(result.url)
      form.setValue('featured_image', result.url)
      
      showSuccess('Success', 'Image uploaded successfully!')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      showError('Error', error.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const validateDescription = (desc: string): boolean => {
    // Strip HTML tags for validation
    const div = document.createElement('div')
    div.innerHTML = desc
    const textContent = div.textContent || div.innerText || ''
    
    if (!textContent.trim()) {
      setDescriptionError('Product description is required')
      return false
    }
    
    setDescriptionError('')
    return true
  }

  const onSubmit = async (data: SimpleProductFormData) => {
    try {
      // Validate description separately since it's not in the Zod schema
      if (!validateDescription(description)) {
        return
      }

      setLoading(true)
      
      const productData: CreateProductTemplateData = {
        product_key: generateSlug(data.name),
        name: data.name,
        description: description,
        category: data.category as 'digital' | 'physical' | 'service' | 'subscription' | 'donation',
        featured_image: imagePreview,
        pricing_type: 'fixed', // Default to fixed, pricing will be set during checkout creation
        is_active: true,
        is_featured: false,
      }

      let result: ProductTemplate

      if (initialData?.id) {
        result = await productTemplatesApi.update(initialData.id, productData)
        showSuccess('Success', `Product "${data.name}" updated successfully`)
      } else {
        result = await productTemplatesApi.create(productData)
        showSuccess('Success', `Product "${data.name}" created successfully`)
      }
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/content')
      }
    } catch (error: any) {
      console.error('Error saving product:', error)
      showError('Error', error.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  // Check if form is valid for submit button - remove price validation
  const isFormValid = () => {
    const formValues = form.getValues()
    const hasValidDescription = description.trim().length > 0
    
    return (
      formValues.name && 
      formValues.name.trim().length > 0 &&
      formValues.category &&
      hasValidDescription
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header - Same style as payment methods page */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/content">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Product Management
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">
            {initialData ? 'Edit Product' : 'Create Product'}
          </h1>
        </div>

        {/* Form Container - White box like payment methods page */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="max-w-7xl mx-auto p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Fill in the essential information about your product
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Product Title */}
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Title *</Label>
                        <Input
                          id="name"
                          {...form.register('name')}
                          placeholder="Premium Online Course"
                          className="text-lg"
                        />
                        {form.formState.errors.name && (
                          <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          This will be the main heading customers see
                        </p>
                      </div>

                      {/* Category Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select 
                          value={form.watch('category')} 
                          onValueChange={(value) => form.setValue('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {productCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.category && (
                          <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
                        )}
                      </div>

                      {/* Product Image */}
                      <div className="space-y-2">
                        <Label>Product Image</Label>
                        <div className="space-y-4">
                          {/* Image Upload Area */}
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {imagePreview ? (
                              <div className="space-y-3">
                                <div className="relative inline-block">
                                  <img 
                                    src={imagePreview} 
                                    alt="Product preview" 
                                    className="h-32 w-32 object-cover rounded-lg mx-auto"
                                  />
                                  <Button 
                                    type="button" 
                                    variant="destructive" 
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setImagePreview('')
                                      form.setValue('featured_image', '')
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Click to change image
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                  {uploadingImage ? (
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                                  ) : (
                                    <Upload className="h-6 w-6 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PNG, JPG, GIF up to 5MB
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Hidden file input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploadingImage}
                          />

                          {/* Image URL Input */}
                          <div className="space-y-2">
                            <Label htmlFor="image_url">Or enter image URL</Label>
                            <Input
                              id="image_url"
                              placeholder="https://example.com/image.jpg"
                              value={imagePreview}
                              onChange={(e) => {
                                setImagePreview(e.target.value)
                                form.setValue('featured_image', e.target.value)
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Product Description */}
                      <div className="space-y-2">
                        <Label>Product Description *</Label>
                        <RichTextEditor
                          content={description}
                          onChange={(content) => {
                            setDescription(content)
                            validateDescription(content)
                          }}
                          placeholder="Describe your product in detail. What makes it special? What will customers get?"
                          maxHeight="200px"
                        />
                        {descriptionError && (
                          <p className="text-sm text-red-600">{descriptionError}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Use the toolbar above to format your description with bold, lists, etc.
                        </p>
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex justify-end gap-4 pt-6">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => router.push('/content')}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={loading || uploadingImage || !isFormValid()} 
                          className="gap-2"
                        >
                          {loading ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Live Preview Section - Matching Checkout Page Design */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Live Preview
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      See how your product will look to customers
                    </p>
                  </CardHeader>
                  <CardContent>
                    {/* Product Preview - Matching Checkout Design */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {/* Product Image */}
                      <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt={watchedValues.name || "Product"} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center text-gray-400">
                            <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                            <p className="text-sm">No image uploaded</p>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="p-6">
                        {/* Product Title */}
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">
                          {watchedValues.name || "Your Product Title"}
                        </h2>

                        {/* Category Badge */}
                        {watchedValues.category && (
                          <div className="mb-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {productCategories.find(c => c.value === watchedValues.category)?.label}
                            </span>
                          </div>
                        )}

                        {/* Product Description */}
                        <div className="mb-6">
                          {description ? (
                            <div 
                              className="prose prose-sm max-w-none text-gray-600 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 max-h-48 overflow-y-auto"
                              dangerouslySetInnerHTML={{ __html: description }} 
                            />
                          ) : (
                            <p className="text-gray-400 italic">
                              Your product description will appear here...
                            </p>
                          )}
                        </div>

                        {/* Add a note about pricing */}
                        <div className="border-t pt-4">
                          <div className="text-center">
                            <span className="text-sm text-gray-600">💰 Pricing will be configured when creating checkout links</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview Tips */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Preview Tips</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• This preview matches your checkout page design</li>
                        <li>• Changes update in real-time as you type</li>
                        <li>• Upload high-quality images for best results</li>
                        <li>• Use formatting to make descriptions engaging</li>
                        <li>• Pricing will be set when creating checkout links</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 