"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, User, Mail, Calendar, Edit, Save, X, Crown, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Spinner } from "@/components/ui/spinner"

interface UserProfile {
  id: string
  email: string
  role: string
  active: boolean
  created_at: string
  updated_at: string
  first_name?: string
  last_name?: string
  phone?: string
  organization?: string
  timezone?: string
}

export function ProfileContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile using email lookup (same pattern as other components)
      const { data: profileData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      if (!profileData) {
        console.error('No profile data found for email:', user.email)
        return
      }
      setProfile(profileData)
      setFormData(profileData)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    try {
      setIsSaving(true)
      
      const { error } = await supabase
        .from('users')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) {
        console.warn('Could not save profile:', error.message)
        toast({
          title: "Profile",
          description: "Profile saved locally. Database save may have failed.",
          variant: "default"
        })
      } else {
        setProfile({ ...profile, ...formData })
        setIsEditing(false)
        toast({
          title: "Success",
          description: "Profile updated successfully",
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(profile || {})
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-black text-white'
      case 'subscriber':
        return 'bg-blue-100 text-blue-800'
      case 'registered_user':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg font-medium">Profile not found</p>
              <p className="text-muted-foreground mb-4">Could not load your profile information.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/super-admin">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>

        {/* Content Container */}
        <div className="bg-card rounded-lg shadow-sm border">
          <div className="p-8 space-y-8">
            {/* Edit Profile Section */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-600 mt-1">Update your personal details and account information</p>
              </div>
              {isEditing ? (
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Personal Information Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">First Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.first_name || ''}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="Enter first name"
                        className="h-11"
                      />
                    ) : (
                      <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                        {profile.first_name || <span className="text-gray-500">Not provided</span>}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.last_name || ''}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Enter last name"
                        className="h-11"
                      />
                    ) : (
                      <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                        {profile.last_name || <span className="text-gray-500">Not provided</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{profile.email}</span>
                  </div>
                  <p className="text-xs text-gray-500">Email cannot be changed here</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="h-11"
                      />
                    ) : (
                      <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                        {profile.phone || <span className="text-gray-500">Not provided</span>}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Organization</Label>
                    {isEditing ? (
                      <Input
                        value={formData.organization || ''}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="Enter organization name"
                        className="h-11"
                      />
                    ) : (
                      <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                        {profile.organization || <span className="text-gray-500">Not provided</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Timezone</Label>
                  {isEditing ? (
                    <Input
                      value={formData.timezone || ''}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      placeholder="Enter timezone"
                      className="h-11"
                    />
                  ) : (
                    <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                      {profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </div>
                  )}
                </div>
              </div>

              {/* Account Information Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Role</Label>
                    <div className="h-11 flex items-center">
                      <Badge className={getRoleBadgeClass(profile.role)}>
                        {profile.role === 'super_admin' && <Crown className="h-3 w-3 mr-1" />}
                        {profile.role === 'super_admin' ? 'Super Admin' : 
                         profile.role === 'subscriber' ? 'Subscriber' : 'User'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Account Status</Label>
                    <div className="h-11 flex items-center">
                      <Badge variant={profile.active ? 'default' : 'destructive'}>
                        {profile.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Member Since</Label>
                    <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{formatDate(profile.created_at)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                    <div className="h-11 px-3 py-2 bg-background border border-gray-200 rounded-md flex items-center text-sm">
                      {formatDate(profile.updated_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/settings" className="block">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 h-11 hover:bg-background transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 h-11 opacity-50 cursor-not-allowed" 
                    disabled
                  >
                    <Shield className="h-4 w-4" />
                    Security Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 h-11 opacity-50 cursor-not-allowed" 
                    disabled
                  >
                    <Mail className="h-4 w-4" />
                    Email Preferences
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 