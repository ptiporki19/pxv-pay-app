"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotificationActions } from "@/providers/notification-provider"
import { Theme, themesApi } from "@/lib/supabase/client-api"
import { useRouter } from "next/navigation"

interface ThemeFormSimpleProps {
  initialData?: Theme
}

const fontFamilies = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Ubuntu',
  'Nunito',
  'Raleway'
]

const borderRadiusOptions = [
  { value: 'none', label: 'None (0px)' },
  { value: 'small', label: 'Small (4px)' },
  { value: 'medium', label: 'Medium (8px)' },
  { value: 'large', label: 'Large (12px)' },
  { value: 'xl', label: 'Extra Large (16px)' }
]

export function ThemeFormSimple({ initialData }: ThemeFormSimpleProps) {
  const router = useRouter()
  const { showSuccess, showError } = useNotificationActions()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<Omit<Theme, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    name: initialData?.name || '',
    primary_color: initialData?.primary_color || '#3b82f6',
    secondary_color: initialData?.secondary_color || '#64748b',
    accent_color: initialData?.accent_color || '#06b6d4',
    background_color: initialData?.background_color || '#ffffff',
    text_color: initialData?.text_color || '#0f172a',
    border_color: initialData?.border_color || '#e2e8f0',
    success_color: initialData?.success_color || '#22c55e',
    warning_color: initialData?.warning_color || '#f59e0b',
    error_color: initialData?.error_color || '#ef4444',
    font_family: initialData?.font_family || 'Inter',
    border_radius: initialData?.border_radius || 'medium',
    logo_url: initialData?.logo_url || null,
    favicon_url: initialData?.favicon_url || null,
    custom_css: initialData?.custom_css || null,
    is_active: initialData?.is_active || false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      showError('Validation Error', 'Theme name is required')
      return
    }

    try {
      setLoading(true)
      
      if (initialData?.id) {
        await themesApi.update(initialData.id, formData)
        showSuccess('Success', `Theme "${formData.name}" updated successfully`)
      } else {
        await themesApi.create(formData)
        showSuccess('Success', `Theme "${formData.name}" created successfully`)
      }
      
      router.push('/theme')
    } catch (error: any) {
      console.error('Error saving theme:', error)
      showError('Error', error.message || 'Failed to save theme')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/theme')
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Theme Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter theme name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="font_family">Font Family</Label>
            <Select 
              value={formData.font_family} 
              onValueChange={(value) => setFormData({ ...formData, font_family: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font family" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font} value={font}>{font}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="border_radius">Border Radius</Label>
            <Select 
              value={formData.border_radius} 
              onValueChange={(value) => setFormData({ ...formData, border_radius: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select border radius" />
              </SelectTrigger>
              <SelectContent>
                {borderRadiusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              value={formData.logo_url || ''}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value || null })}
              placeholder="Enter logo URL"
            />
          </div>
        </div>

        {/* Color Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Color Settings</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  placeholder="#3b82f6"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  placeholder="#64748b"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent_color">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  placeholder="#06b6d4"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="background_color">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.background_color}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.background_color}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  placeholder="#ffffff"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="text_color">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.text_color}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.text_color}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  placeholder="#0f172a"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="border_color">Border Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.border_color}
                  onChange={(e) => setFormData({ ...formData, border_color: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.border_color}
                  onChange={(e) => setFormData({ ...formData, border_color: e.target.value })}
                  placeholder="#e2e8f0"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="success_color">Success Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.success_color}
                  onChange={(e) => setFormData({ ...formData, success_color: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.success_color}
                  onChange={(e) => setFormData({ ...formData, success_color: e.target.value })}
                  placeholder="#22c55e"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="warning_color">Warning Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.warning_color}
                  onChange={(e) => setFormData({ ...formData, warning_color: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.warning_color}
                  onChange={(e) => setFormData({ ...formData, warning_color: e.target.value })}
                  placeholder="#f59e0b"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="error_color">Error Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.error_color}
                  onChange={(e) => setFormData({ ...formData, error_color: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.error_color}
                  onChange={(e) => setFormData({ ...formData, error_color: e.target.value })}
                  placeholder="#ef4444"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Advanced Settings</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="favicon_url">Favicon URL</Label>
              <Input
                id="favicon_url"
                value={formData.favicon_url || ''}
                onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value || null })}
                placeholder="Enter favicon URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom_css">Custom CSS</Label>
              <Textarea
                id="custom_css"
                value={formData.custom_css || ''}
                onChange={(e) => setFormData({ ...formData, custom_css: e.target.value || null })}
                placeholder="Enter custom CSS rules..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (initialData ? 'Update Theme' : 'Create Theme')}
          </Button>
        </div>
      </form>
    </div>
  )
} 