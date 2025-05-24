'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useNotificationActions } from '@/providers/notification-provider'
import { ContentTemplate, contentTemplatesApi } from '@/lib/supabase/client-api'
import { FileText, Plus, Edit, Trash2, Save, X, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const defaultTemplate: Omit<ContentTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  template_key: '',
  title: '',
  content: '',
  content_type: 'text',
  category: 'general',
  language: 'en',
  variables: {},
  metadata: {},
  is_active: true,
  version: 1
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

export default function ContentCustomizationPage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([])
  const [currentTemplate, setCurrentTemplate] = useState<ContentTemplate>(defaultTemplate as ContentTemplate)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Use notification actions hook
  const { showSuccess, showError } = useNotificationActions()

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const templatesData = await contentTemplatesApi.getAll()
      setTemplates(templatesData)
    } catch (error) {
      console.error('Error loading content templates:', error)
      showError('Error', 'Failed to load content templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentTemplate.template_key.trim()) {
      showError('Validation Error', 'Template key is required')
      return
    }

    if (!currentTemplate.title.trim()) {
      showError('Validation Error', 'Template title is required')
      return
    }

    if (!currentTemplate.content.trim()) {
      showError('Validation Error', 'Template content is required')
      return
    }

    try {
      setSaving(true)
      
      if (editingId) {
        // Update existing template
        const updatedTemplate = await contentTemplatesApi.update(editingId, currentTemplate)
        setTemplates(templates.map(t => t.id === editingId ? updatedTemplate : t))
        showSuccess('Success', `Template "${updatedTemplate.title}" updated successfully`)
      } else {
        // Create new template
        const newTemplate = await contentTemplatesApi.create(currentTemplate)
        setTemplates([...templates, newTemplate])
        showSuccess('Success', `Template "${newTemplate.title}" created successfully`)
      }
      
      handleCancel()
    } catch (error: any) {
      console.error('Error saving content template:', error)
      showError('Error', error.message || 'Failed to save content template')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (template: ContentTemplate) => {
    setCurrentTemplate({ ...template })
    setEditingId(template.id!)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (template: ContentTemplate) => {
    if (!confirm(`Are you sure you want to delete the template "${template.title}"?`)) {
      return
    }

    try {
      await contentTemplatesApi.delete(template.id!)
      setTemplates(templates.filter(t => t.id !== template.id))
      showSuccess('Success', `Template "${template.title}" deleted successfully`)
    } catch (error: any) {
      console.error('Error deleting content template:', error)
      showError('Error', error.message || 'Failed to delete content template')
    }
  }

  const handleCancel = () => {
    setCurrentTemplate(defaultTemplate as ContentTemplate)
    setEditingId(null)
    setIsEditing(false)
    setIsDialogOpen(false)
  }

  const handleCreateNew = () => {
    setCurrentTemplate(defaultTemplate as ContentTemplate)
    setEditingId(null)
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.template_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Customization</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your payment portal content templates and messaging
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Content Template' : 'Create New Content Template'}
              </DialogTitle>
              <DialogDescription>
                {editingId ? 'Update your content template' : 'Create a new content template for your payment portal'}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template_key">Template Key</Label>
                    <Input
                      id="template_key"
                      value={currentTemplate.template_key}
                      onChange={(e) => setCurrentTemplate({ ...currentTemplate, template_key: e.target.value })}
                      placeholder="e.g., welcome_message"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={currentTemplate.title}
                      onChange={(e) => setCurrentTemplate({ ...currentTemplate, title: e.target.value })}
                      placeholder="Enter template title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={currentTemplate.category} onValueChange={(value) => setCurrentTemplate({ ...currentTemplate, category: value })}>
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
                    <Select value={currentTemplate.content_type} onValueChange={(value) => setCurrentTemplate({ ...currentTemplate, content_type: value })}>
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
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={currentTemplate.language} onValueChange={(value) => setCurrentTemplate({ ...currentTemplate, language: value })}>
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
                      value={currentTemplate.version}
                      onChange={(e) => setCurrentTemplate({ ...currentTemplate, version: parseInt(e.target.value) || 1 })}
                      min="1"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="content" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={currentTemplate.content}
                      onChange={(e) => setCurrentTemplate({ ...currentTemplate, content: e.target.value })}
                      placeholder="Enter your content here..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="variables">Variables (JSON)</Label>
                      <Textarea
                        id="variables"
                        value={JSON.stringify(currentTemplate.variables, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value)
                            setCurrentTemplate({ ...currentTemplate, variables: parsed })
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
                        value={JSON.stringify(currentTemplate.metadata, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value)
                            setCurrentTemplate({ ...currentTemplate, metadata: parsed })
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
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : (editingId ? 'Update Template' : 'Create Template')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {contentCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {templates.length === 0 ? 'No Content Templates Yet' : 'No Templates Found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              {templates.length === 0 
                ? 'Create your first content template to customize your payment portal messaging'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {templates.length === 0 && (
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {template.title}
                    {template.is_active && <Badge variant="default">Active</Badge>}
                  </CardTitle>
                </div>
                <CardDescription>
                  {template.template_key} • {template.category} • {template.content_type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {template.content}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(template)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 