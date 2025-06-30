"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNotificationActions } from '@/providers/notification-provider'
import { Brand, brandsApi } from '@/lib/supabase/client-api'
import { Building2, Upload, Image, ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { useParams } from "next/navigation"

export default function EditBrandPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [brand, setBrand] = useState<Brand | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    logoFile: null as File | null,
    logoPreview: null as string | null,
    currentLogoUrl: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Use notification actions hook
  const { showSuccess, showError } = useNotificationActions()

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        if (params?.id) {
          const brandData = await brandsApi.getById(params.id as string)
          setBrand(brandData)
          setFormData({
            name: brandData.name,
            logoFile: null,
            logoPreview: null,
            currentLogoUrl: brandData.logo_url
          })
        }
      } catch (error) {
        console.error("Error fetching brand:", error)
        showError('Error', 'Failed to load brand')
      } finally {
        setLoading(false)
      }
    }

    fetchBrand()
  }, [params?.id, showError])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Error', 'Please select an image file')
      return
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      showError('Error', 'Image file must be less than 2MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        logoFile: file,
        logoPreview: e.target?.result as string
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      showError('Error', 'Brand name is required')
      return
    }

    if (!brand) {
      showError('Error', 'Brand not found')
      return
    }

    setSaving(true)

    try {
      let logoUrl = formData.currentLogoUrl

      // Upload new logo if file selected
      if (formData.logoFile) {
        logoUrl = await brandsApi.uploadLogo(formData.logoFile, formData.name)
      }

      // Update brand
      const updatedBrand = await brandsApi.update(brand.id!, {
        name: formData.name.trim(),
        logo_url: logoUrl,
      })

      showSuccess('Success', `Brand "${updatedBrand.name}" updated successfully`)
      router.push('/theme')
    } catch (error: any) {
      console.error('Error updating brand:', error)
      showError('Error', error.message || 'Failed to update brand')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-red-600">Brand not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/theme" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Brands
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Brand</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Update your brand identity for checkout pages
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Brand Details
          </CardTitle>
          <CardDescription>
            Update your brand name and logo for checkout customization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Dog.com, MyStore, etc."
                maxLength={50}
                required
              />
              <p className="text-sm text-gray-500">
                This name will be displayed on your checkout pages
              </p>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Brand Logo</Label>
              <div className="flex items-start gap-4">
                {/* Logo Preview */}
                <div className="flex-shrink-0">
                  {formData.logoPreview ? (
                    <div className="relative">
                      <img 
                        src={formData.logoPreview} 
                        alt="Logo preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, logoFile: null, logoPreview: null }))
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ) : formData.currentLogoUrl ? (
                    <img 
                      src={formData.currentLogoUrl} 
                      alt="Current logo"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div 
                      className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {formData.logoFile ? 'Change Logo' : 'Update Logo'}
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG, or GIF. Max 2MB. Will be displayed as circular image.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving || !formData.name.trim()}
                className="flex-1"
              >
                {saving ? 'Updating Brand...' : 'Update Brand'}
              </Button>
              <Link href="/theme">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 