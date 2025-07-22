"use client"

import { useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeftIcon, PhotoIcon, PlusIcon } from "@heroicons/react/24/solid"
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
import { productTemplatesApi, type CreateProductTemplateData } from "@/lib/supabase/product-templates-api"
import { storageService } from "@/lib/supabase/storage"
import { createClient } from "@/lib/supabase/client"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

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

export function MobileCreateProductForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [descriptionError, setDescriptionError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "digital",
      featured_image: "",
    },
  })

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
      
      // Create a preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Supabase storage
      const fileName = `product-images/${Date.now()}-${file.name}`
      const imageUrl = await storageService.uploadFile(file, fileName)
      
      form.setValue("featured_image", imageUrl)
      
      toast({
        title: "Image uploaded",
        description: "Product image uploaded successfully"
      })
    } catch (error) {
      console.error("Upload error:", error)
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
    setImagePreview("")
    form.setValue("featured_image", "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function onSubmit(values: ProductFormData) {
    // Validate description if provided
    if (description && description.trim().length < 10) {
      setDescriptionError("Description must be at least 10 characters")
      return
    }
    setDescriptionError("")

    try {
      setIsLoading(true)
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !user.email) {
        toast({
          title: "Error",
          description: "You must be logged in to create products",
          variant: "destructive"
        })
        return
      }

      // Get the database user ID using email lookup
      const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', user.email)
        .single()

      if (userError || !dbUser) {
        toast({
          title: "Error",
          description: "Unable to verify user account. Please try logging in again.",
          variant: "destructive"
        })
        return
      }

      // Generate unique slug
      const baseSlug = generateSlug(values.name)
      const timestamp = Date.now()
      const slug = `${baseSlug}-${timestamp}`

      // Prepare product data
      const productData: CreateProductTemplateData = {
        name: values.name,
        slug: slug,
        category: values.category,
        description: description || "",
        featured_image: values.featured_image || null,
        is_active: true,
        is_featured: false,
        created_by: dbUser.id,
      }

      // Create product
      await productTemplatesApi.create(productData)

      toast({ 
        title: "Success", 
        description: "Product created successfully" 
      })
      
      router.push('/m/products')
    } catch (error) {
      console.error("Product creation error:", error)
      
      let errorMessage = "There was an error creating the product"
      
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="px-4 py-3 pb-20 pt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeftIcon className="size-4 text-muted-foreground" />
        </button>
        <div className="text-right">
          <h1 className="text-lg font-semibold text-foreground font-roboto">
            Create Product
          </h1>
          <p className="text-xs text-muted-foreground font-roboto">
            Set up a new product
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          
          {/* Basic Information */}
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium font-roboto">Product Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter product name" 
                      {...field}
                      className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium font-roboto">Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value} className="text-xs">
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Product Description */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5 font-roboto">
              Description (Optional)
            </label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Enter product description..."
            />
            {descriptionError && (
              <p className="text-xs text-destructive mt-1">{descriptionError}</p>
            )}
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5 font-roboto">
              Featured Image (Optional)
            </label>
            
            {!imagePreview ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <PhotoIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground mb-2 font-roboto">Upload a product image</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="text-xs"
                >
                  {uploadingImage ? "Uploading..." : "Choose Image"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-32 object-cover rounded-lg border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2 text-xs"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-violet-600 hover:bg-violet-700 text-white font-roboto font-normal"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span className="text-xs">Creating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <PlusIcon className="size-3" />
                  <span className="text-xs">Create Product</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 