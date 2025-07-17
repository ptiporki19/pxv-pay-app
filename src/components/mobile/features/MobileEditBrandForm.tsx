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
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { MobileHeader } from "@/components/mobile/layout/MobileHeader"
import { brandsApi, type Brand } from "@/lib/supabase/client-api"

// Validation schema matching desktop version
const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(100, "Name must be less than 100 characters"),
  logo_url: z.string().optional(),
})

type BrandFormData = z.infer<typeof brandSchema>

interface MobileEditBrandFormProps {
  brandId: string
}

export function MobileEditBrandForm({ brandId }: MobileEditBrandFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [brand, setBrand] = useState<Brand | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      logo_url: "",
    },
  })

  useEffect(() => {
    loadBrand()
  }, [brandId])

  const loadBrand = async () => {
    try {
      setIsLoadingData(true)
      const data = await brandsApi.getById(brandId)
      
      if (data) {
        setBrand(data)
        form.reset({
          name: data.name,
          logo_url: data.logo_url || "",
        })
        setLogoPreview(data.logo_url || "")
      }
    } catch (error) {
      console.error("Failed to load brand:", error)
      toast({
        title: "Load failed",
        description: "Failed to load brand data",
        variant: "destructive"
      })
      router.push("/m/brands")
    } finally {
      setIsLoadingData(false)
    }
  }

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
      
      // Upload logo using the brandsApi
      const uploadResult = await brandsApi.uploadLogo(file)
      
      if (uploadResult.success && uploadResult.data) {
        form.setValue('logo_url', uploadResult.data.publicUrl)
        setLogoPreview(uploadResult.data.publicUrl)
        
        toast({
          title: "Logo uploaded",
          description: "Brand logo uploaded successfully",
        })
      } else {
        throw new Error(uploadResult.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Logo upload error:', error)
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
    form.setValue('logo_url', '')
    setLogoPreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (data: BrandFormData) => {
    try {
      setIsLoading(true)

      const updateData = {
        name: data.name,
        logo_url: data.logo_url || '',
      }

      await brandsApi.update(brandId, updateData)

      toast({
        title: "Brand updated",
        description: "Brand has been updated successfully",
      })

      router.push("/m/brands")
    } catch (error) {
      console.error("Failed to update brand:", error)
      toast({
        title: "Update failed",
        description: "Failed to update brand. Please try again.",
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
          title="Edit Brand"
          showBack={true}
          onBackClick={() => router.back()}
        />
        
        <div className="px-4 py-3 pb-20 pt-16">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
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

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader 
          title="Edit Brand"
          showBack={true}
          onBackClick={() => router.back()}
        />
        
        <div className="px-4 py-3 pb-20 pt-16">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Brand not found</h3>
            <p className="text-gray-500">The brand you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title="Edit Brand"
        showBack={true}
        onBackClick={() => router.back()}
      />
      
      <div className="px-4 py-3 pb-20 pt-16">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Brand Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900">Brand Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter brand name"
                      className="h-12 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-violet-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Brand Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Brand Logo
              </label>
              
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-full h-48 object-contain rounded-lg border border-gray-200 bg-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeLogo}
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
                  <p className="text-gray-600 mb-1">Click to upload logo</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || uploadingLogo}
              className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-medium"
            >
              {isLoading ? "Updating Brand..." : "Update Brand"}
            </Button>

          </form>
        </Form>
      </div>
    </div>
  )
} 