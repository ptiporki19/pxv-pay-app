"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNotificationActions } from "@/providers/notification-provider"
import { useRouter } from "next/navigation"
import { Plus, X, Upload, Image as ImageIcon } from 'lucide-react'
import { currenciesApi } from "@/lib/supabase/client-api"
import { productTemplatesApi, type CreateProductTemplateData } from "@/lib/supabase/product-templates-api"
import type { ProductTemplate } from "@/types/content"

// Validation schema
const productTemplateSchema = z.object({
  product_key: z.string().min(1, "Product key is required").max(50),
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().min(1, "Description is required"),
  short_description: z.string().max(300).optional(),
  category: z.enum(['digital', 'physical', 'service', 'subscription', 'donation']),
  pricing_type: z.enum(['fixed', 'flexible', 'tiered']),
  price: z.number().min(0).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  currency: z.string().optional(),
  features: z.array(z.string()).optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
})

type ProductTemplateFormData = z.infer<typeof productTemplateSchema>

const productCategories = [
  { value: 'digital', label: 'Digital Product', description: 'Courses, ebooks, software, etc.' },
  { value: 'physical', label: 'Physical Product', description: 'Shipped items, merchandise' },
  { value: 'service', label: 'Service', description: 'Consulting, coaching, etc.' },
  { value: 'subscription', label: 'Subscription', description: 'Recurring payments' },
  { value: 'donation', label: 'Donation', description: 'Charitable contributions' },
]

const pricingTypes = [
  { value: 'fixed', label: 'Fixed Price', description: 'Set a specific price' },
  { value: 'flexible', label: 'Flexible Pricing', description: 'Customer sets amount within limits' },
  { value: 'tiered', label: 'Tiered Pricing', description: 'Multiple price options' },
]

interface ProductTemplateFormProps {
  initialData?: ProductTemplate
  onSuccess?: () => void
}

export function ProductTemplateForm({ initialData, onSuccess }: ProductTemplateFormProps) {
  const router = useRouter()
  const { showSuccess, showError } = useNotificationActions()
  const [loading, setLoading] = useState(false)
  const [currencies, setCurrencies] = useState<any[]>([])
  const [features, setFeatures] = useState<string[]>(initialData?.features || [])
  const [newFeature, setNewFeature] = useState('')

  const form = useForm<ProductTemplateFormData>({
    resolver: zodResolver(productTemplateSchema),
    defaultValues: {
      product_key: initialData?.product_key || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      short_description: initialData?.short_description || '',
      category: initialData?.category || 'digital',
      pricing_type: initialData?.pricing_type || 'fixed',
      price: initialData?.price || 0,
      min_price: initialData?.min_price || 0,
      max_price: initialData?.max_price || 0,
      currency: initialData?.currency || 'USD',
      is_active: initialData?.is_active ?? true,
      is_featured: initialData?.is_featured ?? false,
    },
  })

  const pricingType = form.watch('pricing_type')

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const data = await currenciesApi.getAll()
        setCurrencies(data)
      } catch (error) {
        console.error('Failed to load currencies:', error)
      }
    }
    loadCurrencies()
  }, [])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    form.setValue('name', name)
    if (!initialData) {
      // Auto-generate product key for new products
      const slug = generateSlug(name)
      form.setValue('product_key', slug)
    }
  }

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      const updatedFeatures = [...features, newFeature.trim()]
      setFeatures(updatedFeatures)
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    const updatedFeatures = features.filter((_, i) => i !== index)
    setFeatures(updatedFeatures)
  }

  const onSubmit = async (data: ProductTemplateFormData) => {
    try {
      setLoading(true)
      
      const productData: CreateProductTemplateData = {
        ...data,
        features,
        content_blocks: initialData?.content_blocks || [],
        gallery_images: initialData?.gallery_images || [],
        specifications: initialData?.specifications || {},
      }

      let result: ProductTemplate

      if (initialData?.id) {
        // Update existing product
        result = await productTemplatesApi.update(initialData.id, productData)
        showSuccess('Success', `Product template "${data.name}" updated successfully`)
      } else {
        // Create new product
        result = await productTemplatesApi.create(productData)
        showSuccess('Success', `Product template "${data.name}" created successfully`)
      }
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/content')
      }
    } catch (error: any) {
      console.error('Error saving product template:', error)
      showError('Error', error.message || 'Failed to save product template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          {initialData ? 'Edit Product Template' : 'Create Product Template'}
        </h1>
        <p className="text-muted-foreground mt-2">
          Create rich product experiences that can be used in checkout links
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Premium Web Development Course"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="product_key">Product Key *</Label>
                <Input
                  id="product_key"
                  {...form.register('product_key')}
                  placeholder="premium-web-dev-course"
                  disabled={!!initialData}
                />
                {form.formState.errors.product_key && (
                  <p className="text-sm text-red-600">{form.formState.errors.product_key.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {initialData ? 'Product key cannot be changed after creation' : 'Auto-generated from product name'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                {...form.register('short_description')}
                placeholder="A comprehensive course covering React, Node.js, and database design"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground">
                Brief summary shown in product selection (max 300 characters)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                rows={6}
                placeholder="Complete full-stack web development course with React, Node.js, and database design. Includes 50+ hours of video content, projects, and lifetime access."
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Detailed description shown on checkout page
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={form.watch('category')} 
                  onValueChange={(value) => form.setValue('category', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div>
                          <div className="font-medium">{category.label}</div>
                          <div className="text-xs text-muted-foreground">{category.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select 
                  value={form.watch('currency')} 
                  onValueChange={(value) => form.setValue('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.id} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pricing_type">Pricing Type *</Label>
              <Select 
                value={form.watch('pricing_type')} 
                onValueChange={(value) => form.setValue('pricing_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pricingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {pricingType === 'fixed' && (
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('price', { valueAsNumber: true })}
                  placeholder="99.99"
                />
                <p className="text-xs text-muted-foreground">
                  Default price (can be overridden in checkout links)
                </p>
              </div>
            )}

            {pricingType === 'flexible' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_price">Minimum Price</Label>
                  <Input
                    id="min_price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register('min_price', { valueAsNumber: true })}
                    placeholder="10.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_price">Maximum Price</Label>
                  <Input
                    id="max_price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register('max_price', { valueAsNumber: true })}
                    placeholder="1000.00"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features & Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a feature (e.g., 50+ hours of content)"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <Button type="button" onClick={addFeature} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {feature}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFeature(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Key selling points and features that will be displayed on checkout pages
            </p>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Product is available for use in checkout links</p>
              </div>
              <Switch
                checked={form.watch('is_active')}
                onCheckedChange={(checked) => form.setValue('is_active', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Featured</Label>
                <p className="text-sm text-muted-foreground">Show this product prominently in product selection</p>
              </div>
              <Switch
                checked={form.watch('is_featured')}
                onCheckedChange={(checked) => form.setValue('is_featured', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/content')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
          </Button>
        </div>
      </form>
    </div>
  )
} 