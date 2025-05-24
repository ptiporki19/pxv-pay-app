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
import { Theme, themesApi } from '@/lib/supabase/client-api'
import { Palette, Plus, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const defaultTheme: Omit<Theme, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  name: '',
  primary_color: '#3b82f6',
  secondary_color: '#64748b',
  accent_color: '#06b6d4',
  background_color: '#ffffff',
  text_color: '#0f172a',
  border_color: '#e2e8f0',
  success_color: '#22c55e',
  warning_color: '#f59e0b',
  error_color: '#ef4444',
  font_family: 'Inter',
  border_radius: 'medium',
  logo_url: null,
  favicon_url: null,
  custom_css: null,
  is_active: false
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

export default function ThemeCustomizationPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme as Theme)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Use notification actions hook
  const { showSuccess, showError } = useNotificationActions()

  useEffect(() => {
    loadThemes()
  }, [])

  const loadThemes = async () => {
    try {
      setLoading(true)
      const themesData = await themesApi.getAll()
      setThemes(themesData)
    } catch (error) {
      console.error('Error loading themes:', error)
      showError('Error', 'Failed to load themes')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentTheme.name.trim()) {
      showError('Validation Error', 'Theme name is required')
      return
    }

    try {
      setSaving(true)
      
      if (editingId) {
        // Update existing theme
        const updatedTheme = await themesApi.update(editingId, currentTheme)
        setThemes(themes.map(t => t.id === editingId ? updatedTheme : t))
        showSuccess('Success', `Theme "${updatedTheme.name}" updated successfully`)
      } else {
        // Create new theme
        const newTheme = await themesApi.create(currentTheme)
        setThemes([...themes, newTheme])
        showSuccess('Success', `Theme "${newTheme.name}" created successfully`)
      }
      
      handleCancel()
    } catch (error: any) {
      console.error('Error saving theme:', error)
      showError('Error', error.message || 'Failed to save theme')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (theme: Theme) => {
    setCurrentTheme({ ...theme })
    setEditingId(theme.id!)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (theme: Theme) => {
    if (!confirm(`Are you sure you want to delete the theme "${theme.name}"?`)) {
      return
    }

    try {
      await themesApi.delete(theme.id!)
      setThemes(themes.filter(t => t.id !== theme.id))
      showSuccess('Success', `Theme "${theme.name}" deleted successfully`)
    } catch (error: any) {
      console.error('Error deleting theme:', error)
      showError('Error', error.message || 'Failed to delete theme')
    }
  }

  const handleSetActive = async (theme: Theme) => {
    try {
      const updatedTheme = await themesApi.setActive(theme.id!)
      // Update themes list to reflect the active status change
      setThemes(themes.map(t => ({
        ...t,
        is_active: t.id === theme.id
      })))
      showSuccess('Success', `Theme "${updatedTheme.name}" is now active`)
    } catch (error: any) {
      console.error('Error setting active theme:', error)
      showError('Error', error.message || 'Failed to set active theme')
    }
  }

  const handleCancel = () => {
    setCurrentTheme(defaultTheme as Theme)
    setEditingId(null)
    setIsEditing(false)
    setIsDialogOpen(false)
  }

  const handleCreateNew = () => {
    setCurrentTheme(defaultTheme as Theme)
    setEditingId(null)
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Theme Customization</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Customize your payment portal themes and branding
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Theme
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Theme' : 'Create New Theme'}
              </DialogTitle>
              <DialogDescription>
                {editingId ? 'Update your theme settings' : 'Create a new custom theme for your payment portal'}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Theme Name</Label>
                    <Input
                      id="name"
                      value={currentTheme.name}
                      onChange={(e) => setCurrentTheme({ ...currentTheme, name: e.target.value })}
                      placeholder="Enter theme name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="font_family">Font Family</Label>
                    <Select value={currentTheme.font_family} onValueChange={(value) => setCurrentTheme({ ...currentTheme, font_family: value })}>
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
                  <div className="space-y-2">
                    <Label htmlFor="border_radius">Border Radius</Label>
                    <Select value={currentTheme.border_radius} onValueChange={(value) => setCurrentTheme({ ...currentTheme, border_radius: value })}>
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
                      value={currentTheme.logo_url || ''}
                      onChange={(e) => setCurrentTheme({ ...currentTheme, logo_url: e.target.value || null })}
                      placeholder="Enter logo URL"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="colors" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={currentTheme.primary_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, primary_color: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={currentTheme.primary_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, primary_color: e.target.value })}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={currentTheme.secondary_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, secondary_color: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={currentTheme.secondary_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, secondary_color: e.target.value })}
                        placeholder="#64748b"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent_color">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent_color"
                        type="color"
                        value={currentTheme.accent_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, accent_color: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={currentTheme.accent_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, accent_color: e.target.value })}
                        placeholder="#06b6d4"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="background_color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background_color"
                        type="color"
                        value={currentTheme.background_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, background_color: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={currentTheme.background_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, background_color: e.target.value })}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="text_color">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text_color"
                        type="color"
                        value={currentTheme.text_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, text_color: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={currentTheme.text_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, text_color: e.target.value })}
                        placeholder="#0f172a"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="border_color">Border Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="border_color"
                        type="color"
                        value={currentTheme.border_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, border_color: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={currentTheme.border_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, border_color: e.target.value })}
                        placeholder="#e2e8f0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="success_color">Success Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="success_color"
                        type="color"
                        value={currentTheme.success_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, success_color: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={currentTheme.success_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, success_color: e.target.value })}
                        placeholder="#22c55e"
                      />
                  </div>
                </div>
                  <div className="space-y-2">
                    <Label htmlFor="warning_color">Warning Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="warning_color"
                        type="color"
                        value={currentTheme.warning_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, warning_color: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={currentTheme.warning_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, warning_color: e.target.value })}
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="error_color">Error Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="error_color"
                        type="color"
                        value={currentTheme.error_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, error_color: e.target.value })}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={currentTheme.error_color}
                        onChange={(e) => setCurrentTheme({ ...currentTheme, error_color: e.target.value })}
                        placeholder="#ef4444"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="favicon_url">Favicon URL</Label>
                    <Input
                      id="favicon_url"
                      value={currentTheme.favicon_url || ''}
                      onChange={(e) => setCurrentTheme({ ...currentTheme, favicon_url: e.target.value || null })}
                      placeholder="Enter favicon URL"
                    />
              </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom_css">Custom CSS</Label>
                    <Textarea
                      id="custom_css"
                      value={currentTheme.custom_css || ''}
                      onChange={(e) => setCurrentTheme({ ...currentTheme, custom_css: e.target.value || null })}
                      placeholder="Enter custom CSS rules..."
                      rows={8}
                      className="font-mono text-sm"
                    />
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
                {saving ? 'Saving...' : (editingId ? 'Update Theme' : 'Create Theme')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
      ) : themes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Palette className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Themes Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              Create your first custom theme to personalize your payment portal
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Theme
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <Card key={theme.id} className={`relative ${theme.is_active ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {theme.name}
                    {theme.is_active && <Badge variant="default">Active</Badge>}
                  </CardTitle>
                </div>
                <CardDescription>
                  Font: {theme.font_family} • Radius: {theme.border_radius}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div 
                      className="w-6 h-6 rounded border" 
                      style={{ backgroundColor: theme.primary_color }}
                      title={`Primary: ${theme.primary_color}`}
                    />
                    <div 
                      className="w-6 h-6 rounded border" 
                      style={{ backgroundColor: theme.secondary_color }}
                      title={`Secondary: ${theme.secondary_color}`}
                    />
                    <div 
                      className="w-6 h-6 rounded border" 
                      style={{ backgroundColor: theme.accent_color }}
                      title={`Accent: ${theme.accent_color}`}
                    />
                    <div 
                      className="w-6 h-6 rounded border" 
                      style={{ backgroundColor: theme.success_color }}
                      title={`Success: ${theme.success_color}`}
                    />
                  </div>
                  <div className="flex gap-2">
                    {!theme.is_active && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSetActive(theme)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(theme)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(theme)}
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