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
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { brandsApi } from "@/lib/supabase/client-api"
import { createClient } from "@/lib/supabase/client"

// Validation schema matching desktop version
const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100, "Name must be less than 100 characters"),
  logo_url: z.string().optional(),
})

type BrandFormData = z.infer<typeof brandSchema>

export function MobileCreateBrandForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      logo_url: "",
    },
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setUploadingLogo(true)
      
      // Create a preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Supabase storage
      const logoUrl = await brandsApi.uploadLogo(file, form.getValues().name || 'brand')
      
      form.setValue("logo_url", logoUrl)
      
      toast({
        title: "Logo uploaded",
        description: "Brand logo uploaded successfully"
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  const removeLogo = () => {
    setLogoPreview("")
    form.setValue("logo_url", "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function onSubmit(values: BrandFormData) {
    try {
      setIsLoading(true)
      
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || !user.email) {
        toast({
          title: "Error",
          description: "You must be logged in to create brands",
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

      // Prepare brand data
      const brandData = {
        name: values.name,
        logo_url: values.logo_url || '',
        is_active: true,
        created_by: dbUser.id,
      }

      // Create brand
      await brandsApi.create(brandData)

      toast({ 
        title: "Success", 
        description: "Brand created successfully" 
      })
      
      router.push('/m/brands')
    } catch (error) {
      console.error("Brand creation error:", error)
      
      let errorMessage = "There was an error creating the brand"
      
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
            Create Brand
          </h1>
          <p className="text-xs text-muted-foreground font-roboto">
            Set up a new brand
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
                  <FormLabel className="text-xs font-medium font-roboto">Brand Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter brand name" 
                      {...field}
                      className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Brand Logo */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5 font-roboto">
              Brand Logo (Optional)
            </label>
            
            {!logoPreview ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <PhotoIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground mb-2 font-roboto">Upload a brand logo</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="text-xs"
                >
                  {uploadingLogo ? "Uploading..." : "Choose Logo"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Brand logo preview"
                  className="w-full h-32 object-cover rounded-lg border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeLogo}
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
              className="w-full h-10 bg-violet-600 hover:bg-violet-700 text-white font-roboto"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span className="text-xs">Creating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <PlusIcon className="size-3" />
                  <span className="text-xs">Create Brand</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 