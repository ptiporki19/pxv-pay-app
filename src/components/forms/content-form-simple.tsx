"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotificationActions } from "@/providers/notification-provider"
import { ContentTemplate, contentTemplatesApi } from "@/lib/supabase/client-api"
import { useRouter } from "next/navigation"

interface ContentFormSimpleProps {
  initialData?: ContentTemplate
}

const contentCategories = [
  { value: 'general', label: 'General' },
  { value: 'checkout', label: 'Checkout' },
  { value: 'payment', label: 'Payment' },
  { value: 'success', label: 'Success' },
  { value: 'error', label: 'Error' },
  { value: 'email', label: 'Email' },
  { value: 'notification', label: 'Notification' }
]

const contentTypes = [
  { value: 'text', label: 'Plain Text' },
  { value: 'html', label: 'HTML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'json', label: 'JSON' }
]

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' }
]

export function ContentFormSimple({ initialData }: ContentFormSimpleProps) {
  const router = useRouter()
  const { showSuccess, showError } = useNotificationActions()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<Omit<ContentTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    template_key: initialData?.template_key || '',
    title: initialData?.title || '',
    content: initialData?.content || '',
    content_type: initialData?.content_type || 'text',
    category: initialData?.category || 'general',
    language: initialData?.language || 'en',
    variables: initialData?.variables || {},
    metadata: initialData?.metadata || {},
    is_active: initialData?.is_active ?? true,
    version: initialData?.version || 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.template_key.trim()) {
      showError('Validation Error', 'Template key is required')
      return
    }

    if (!formData.title.trim()) {
      showError('Validation Error', 'Template title is required')
      return
    }

    if (!formData.content.trim()) {
      showError('Validation Error', 'Template content is required')
      return
    }

    try {
      setLoading(true)
      
      if (initialData?.id) {
        await contentTemplatesApi.update(initialData.id, formData)
        showSuccess('Success', `Template "${formData.title}" updated successfully`)
      } else {
        await contentTemplatesApi.create(formData)
        showSuccess('Success', `Template "${formData.title}" created successfully`)
      }
      
      router.push('/content')
    } catch (error: any) {
      console.error('Error saving content template:', error)
      showError('Error', error.message || 'Failed to save content template')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/content')
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="template_key">Template Key *</Label>
            <Input
              id="template_key"
              value={formData.template_key}
              onChange={(e) => setFormData({ ...formData, template_key: e.target.value })}
              placeholder="e.g., welcome_message"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter template title"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {contentCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content_type">Content Type</Label>
            <Select 
              value={formData.content_type} 
              onValueChange={(value) => setFormData({ ...formData, content_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select 
              value={formData.language} 
              onValueChange={(value) => setFormData({ ...formData, language: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input 
              id="version"
              type="number"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: parseInt(e.target.value) || 1 })}
              min="1"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Enter your content here..."
            rows={8}
            className="font-mono text-sm"
            required
          />
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Advanced Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="variables">Variables (JSON)</Label>
              <Textarea
                id="variables"
                value={JSON.stringify(formData.variables, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    setFormData({ ...formData, variables: parsed })
                  } catch {
                    // Invalid JSON, keep the text for editing
                  }
                }}
                placeholder='{"variable1": "value1"}'
                rows={4}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metadata">Metadata (JSON)</Label>
              <Textarea
                id="metadata"
                value={JSON.stringify(formData.metadata, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    setFormData({ ...formData, metadata: parsed })
                  } catch {
                    // Invalid JSON, keep the text for editing
                  }
                }}
                placeholder='{"description": "Template description"}'
                rows={4}
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
            {loading ? 'Saving...' : (initialData ? 'Update Template' : 'Create Template')}
          </Button>
        </div>
      </form>
    </div>
  )
} 