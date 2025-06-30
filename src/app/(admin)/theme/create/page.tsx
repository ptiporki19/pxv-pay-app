"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNotificationActions } from '@/providers/notification-provider'
import { brandsApi } from '@/lib/supabase/client-api'
import { Building2, Upload, Image, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateBrandPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    logoFile: null as File | null,
    logoPreview: null as string | null
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Use notification actions hook
  const { showSuccess, showError } = useNotificationActions()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showError('Error', 'Logo file size must be less than 2MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Error', 'Please select a valid image file')
        return
      }

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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      showError('Error', 'Brand name is required')
      return
    }

    if (!formData.logoFile) {
      showError('Error', 'Brand logo is required')
      return
    }

    setLoading(true)
    
    try {
      // Upload logo first
      const logoUrl = await brandsApi.uploadLogo(formData.logoFile, formData.name)
      
      // Create brand with logo URL
      await brandsApi.create({
        name: formData.name.trim(),
        logo_url: logoUrl,
        is_active: true
      })
      
      showSuccess('Success', 'Brand created successfully')
      router.push('/theme')
    } catch (error: any) {
      console.error('Error creating brand:', error)
      showError('Error', error.message || 'Failed to create brand')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/theme">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Brand Management
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Brand</h1>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Basic Information Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <CardTitle>Basic Information</CardTitle>
                </div>
                <CardDescription>
                  Set up your brand identity for checkout pages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Brand Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter brand name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                      <span className="text-sm text-muted-foreground">Active (Default)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brand Logo Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  <CardTitle>Brand Logo</CardTitle>
                </div>
                <CardDescription>
                  Upload your brand logo that will appear on checkout pages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {/* Logo Preview */}
                  {formData.logoPreview && (
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium">Preview:</div>
                      <img 
                        src={formData.logoPreview} 
                        alt="Logo preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>
                  )}
                  
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="logo">Upload Logo *</Label>
                    <div className="flex items-center gap-4">
                      <input
                        ref={fileInputRef}
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {formData.logoFile ? 'Change Logo' : 'Select Logo'}
                      </Button>
                      {formData.logoFile && (
                        <span className="text-sm text-muted-foreground">
                          {formData.logoFile.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: Square image, max 2MB. Will be displayed as circular logo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Link href="/theme">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={loading || !formData.name.trim() || !formData.logoFile}
              >
                {loading ? 'Creating...' : 'Create Brand'}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
} 