'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNotificationActions } from '@/providers/notification-provider'
import { Theme, themesApi } from '@/lib/supabase/client-api'
import { Palette, Plus, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

export default function ThemeCustomizationPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Theme Customization</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Customize your payment portal themes and branding
          </p>
        </div>
        <Link href="/theme/create">
          <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Theme
            </Button>
        </Link>
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
            <Link href="/theme/create">
              <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Theme
            </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <Card key={theme.id} className="relative">
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
                    <Link href={`/theme/edit/${theme.id}`}>
                    <Button 
                      size="sm" 
                      variant="outline"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    </Link>
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