'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useNotificationActions } from '@/providers/notification-provider'
import { ContentTemplate, contentTemplatesApi } from '@/lib/supabase/client-api'
import { FileText, Plus, Edit, Trash2, Search } from 'lucide-react'
import Link from 'next/link'

const contentCategories = [
  { value: 'general', label: 'General' },
  { value: 'checkout', label: 'Checkout' },
  { value: 'payment', label: 'Payment' },
  { value: 'success', label: 'Success' },
  { value: 'error', label: 'Error' },
  { value: 'email', label: 'Email' },
  { value: 'notification', label: 'Notification' }
]

export default function ContentCustomizationPage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([])
  const [loading, setLoading] = useState(true)
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
        <Link href="/content/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </Link>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-4">
        <div className="relative flex-1">
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
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
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
              {searchQuery || selectedCategory !== 'all' ? 'No Templates Found' : 'No Templates Yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Create your first content template to customize your payment portal messaging'
              }
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <Link href="/content/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="relative hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-1">
                      {template.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {template.template_key}
                    </CardDescription>
                  </div>
                  {template.is_active && (
                    <Badge variant="default" className="ml-2">Active</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {contentCategories.find(c => c.value === template.category)?.label || template.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.content_type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      v{template.version}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {template.content.length > 100 
                      ? `${template.content.substring(0, 100)}...` 
                      : template.content
                    }
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Link href={`/content/edit/${template.id}`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
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