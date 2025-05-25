"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Settings, Moon, Sun, Bell, Shield, Globe, Database, Palette, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { createClient } from '@/lib/supabase/client'
import { useTheme } from "next-themes"
import Link from 'next/link'

interface UserSettings {
  id?: string
  user_id: string
  theme: string
  notifications_enabled: boolean
  email_notifications: boolean
  system_alerts: boolean
  language: string
  timezone: string
  auto_backup: boolean
  created_at?: string
  updated_at?: string
}

export function SettingsContent() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { theme, setTheme } = useTheme()
  
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Try to get existing settings
      const { data: existingSettings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.warn('Error loading settings:', error.message)
      }

      if (existingSettings) {
        setSettings(existingSettings)
      } else {
        // Create default settings
        const defaultSettings: UserSettings = {
          user_id: user.id,
          theme: theme || 'system',
          notifications_enabled: true,
          email_notifications: true,
          system_alerts: true,
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          auto_backup: true
        }
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async (updatedSettings: Partial<UserSettings>) => {
    if (!settings) return

    try {
      setIsSaving(true)
      
      const newSettings = { ...settings, ...updatedSettings }
      setSettings(newSettings)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Upsert settings
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          ...newSettings,
          user_id: user.id,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.warn('Could not save settings:', error.message)
        toast({
          title: "Settings",
          description: "Settings saved locally. Database save may have failed.",
          variant: "default"
        })
      } else {
        toast({
          title: "Success",
          description: "Settings saved successfully",
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    saveSettings({ theme: newTheme })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/super-admin">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8 space-y-8">
            {/* Appearance Settings */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
                <p className="text-sm text-gray-600">Customize the look and feel of your interface</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Theme</Label>
                  <Select value={theme} onValueChange={handleThemeChange}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Language</Label>
                  <Select 
                    value={settings?.language || 'en'} 
                    onValueChange={(value) => saveSettings({ language: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Timezone</Label>
                  <Input 
                    value={settings?.timezone || ''} 
                    onChange={(e) => saveSettings({ timezone: e.target.value })}
                    placeholder="Auto-detected"
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-600">Configure how you receive notifications</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Push Notifications</Label>
                    <p className="text-xs text-gray-500 mt-1">Receive notifications in your browser</p>
                  </div>
                  <Switch
                    checked={settings?.notifications_enabled || false}
                    onCheckedChange={(checked: boolean) => saveSettings({ notifications_enabled: checked })}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email Notifications</Label>
                    <p className="text-xs text-gray-500 mt-1">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings?.email_notifications || false}
                    onCheckedChange={(checked: boolean) => saveSettings({ email_notifications: checked })}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">System Alerts</Label>
                    <p className="text-xs text-gray-500 mt-1">Critical system notifications</p>
                  </div>
                  <Switch
                    checked={settings?.system_alerts || false}
                    onCheckedChange={(checked: boolean) => saveSettings({ system_alerts: checked })}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                <p className="text-sm text-gray-600">Manage your security preferences</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Auto Backup</Label>
                    <p className="text-xs text-gray-500 mt-1">Automatically backup your data</p>
                  </div>
                  <Switch
                    checked={settings?.auto_backup || false}
                    onCheckedChange={(checked: boolean) => saveSettings({ auto_backup: checked })}
                    disabled={isSaving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-11 gap-2" disabled>
                    <Shield className="h-4 w-4" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="h-11 gap-2" disabled>
                    <Database className="h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">System Information</h2>
                <p className="text-sm text-gray-600">Application and system details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">App Version:</span>
                    <span className="text-sm font-medium text-gray-900">1.0.0</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Database:</span>
                    <span className="text-sm font-medium text-gray-900">Supabase</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Environment:</span>
                    <span className="text-sm font-medium text-gray-900">Development</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Backup:</span>
                    <span className="text-sm font-medium text-gray-900">Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 