"use client"

import { useState, useRef, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeftIcon, PhotoIcon } from "@heroicons/react/24/solid"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { MobileHeader } from "@/components/mobile/layout/MobileHeader"
import { productTemplatesApi, type UpdateProductTemplateData } from "@/lib/supabase/product-templates-api"
import { storageService } from "@/lib/supabase/storage"
import { createClient } from "@/lib/supabase/client"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import type { ProductTemplate } from "@/types/content"

// Product categories from desktop version
const productCategories = [
  { value: 'digital', label: 'Digital Products' },
  { value: 'physical', label: 'Physical Products' },
  { value: 'service', label: 'Services' },
  { value: 'subscription', label: 'Subscriptions' },
  { value: 'donation', label: 'Donations' }
]

// Validation schema matching desktop version
const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Name must be less than 100 characters"),
  category: z.string().min(1, "Category is required"),
  featured_image: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface MobileEditProductFormProps {
  productId: string
}

export function MobileEditProductForm({ productId }: MobileEditProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [descriptionError, setDescriptionError] = useState<string>("")
  const [product, setProduct] = useState<ProductTemplate | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "digital",
      featured_image: "",
    },
  })

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    try {
      setIsLoadingData(true)
      const data = await productTemplatesApi.getById(productId)
      
      if (data) {
        setProduct(data)
        form.reset({
          name: data.name,
          category: data.category,
          featured_image: data.featured_image || "",
        })
        setDescription(data.description || "")
        setImagePreview(data.featured_image || "")
      }
    } catch (error) {
      console.error("Failed to load product:", error)
      toast({
        title: "Load failed",
        description: "Failed to load product data",
        variant: "destructive"
      })
      router.push("/m/products")
    } finally {
      setIsLoadingData(false)
    }
  }

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
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file",
        variant: "destructive"
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size must be less than 5MB",
        variant: "destructive"
      })
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
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const filePath = `product-images/${fileName}`

      const uploadResult = await storageService.uploadFile('product-assets', filePath, file)
      
      if (uploadResult.success && uploadResult.data) {
        const publicUrl = storageService.getPublicUrl('product-assets', filePath)
        form.setValue('featured_image', publicUrl)
        setImagePreview(publicUrl)
        
        toast({
          title: "Image uploaded",
          description: "Product image uploaded successfully",
        })
      } else {
        throw new Error(uploadResult.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    form.setValue('featured_image', '')
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true)
      setDescriptionError('')

      // Validate description
      if (!description.trim()) {
        setDescriptionError('Description is required')
        return
      }

      const slug = generateSlug(data.name)

      const updateData: UpdateProductTemplateData = {
        name: data.name,
        category: data.category,
        description: description,
        featured_image: data.featured_image || '',
        slug: slug,
      }

      await productTemplatesApi.update(productId, updateData)

      toast({
        title: "Product updated",
        description: "Product has been updated successfully",
      })

      router.push("/m/products")
    } catch (error) {
      console.error("Failed to update product:", error)
      toast({
        title: "Update failed",
        description: "Failed to update product. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader 
          title="Edit Product"
          showBack={true}
          onBackClick={() => router.back()}
        />
        
        <div className="px-4 py-3 pb-20 pt-16">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader 
          title="Edit Product"
          showBack={true}
          onBackClick={() => router.back()}
        />
        
        <div className="px-4 py-3 pb-20 pt-16">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Product not found</h3>
            <p className="text-gray-500">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title="Edit Product"
        showBack={true}
        onBackClick={() => router.back()}
      />
      
      <div className="px-4 py-3 pb-20 pt-16">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Product Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900">Product Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter product name"
                      className="h-12 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-violet-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900">Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-violet-500">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description
              </label>
              <RichTextEditor
                content={description}
                onChange={setDescription}
                placeholder="Enter product description..."
                className="min-h-[120px]"
                outputFormat="text"
              />
              {descriptionError && (
                <p className="text-sm text-red-600 mt-1">{descriptionError}</p>
              )}
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Featured Image
              </label>
              
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-violet-400 transition-colors"
                >
                  <PhotoIcon className="size-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-1">Click to upload image</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || uploadingImage}
              className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-medium"
            >
              {isLoading ? "Updating Product..." : "Update Product"}
            </Button>

          </form>
        </Form>
      </div>
    </div>
  )
} 