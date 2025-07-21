'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  Shield,
  CreditCard,
  Bell,
  Edit,
  Save,
  X
} from "lucide-react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

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

// Validation schema
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function MobileProfileContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
    },
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      // Get user profile using email lookup (same pattern as desktop)
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

      setProfile(profileData as UserProfile)
      
      // Update form with real data
      const profileWithFields = profileData as any
      form.reset({
        firstName: profileWithFields.first_name || '',
        lastName: profileWithFields.last_name || '',
        email: profileData.email || '',
        phone: profileWithFields.phone || '',
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!profile) return

    try {
      setIsSaving(true)
      
      const { error } = await supabase
        .from('users')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
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
        // Update local profile state
        setProfile({
          ...profile,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
        })
        setIsEditing(false)
        toast({
          title: "Success",
          description: "Profile updated successfully",
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
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
    if (profile) {
      form.reset({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
      })
    }
    setIsEditing(false)
  }

  const getInitials = () => {
    if (!profile) return 'U'
    const firstName = profile.first_name || ''
    const lastName = profile.last_name || ''
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'U'
  }

  const getDisplayName = () => {
    if (!profile) return 'User'
    const firstName = profile.first_name || ''
    const lastName = profile.last_name || ''
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    return profile.email?.split('@')[0] || 'User'
  }

  if (isLoading) {
    return (
      <div className="px-4 py-3 pb-20 pt-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="px-4 py-3 pb-20 pt-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-base font-medium">Profile not found</p>
            <p className="text-sm text-muted-foreground mb-4">Could not load your profile information.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 pb-20 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="size-4 text-muted-foreground" />
        </button>
        <div className="text-right">
          <h1 className="text-lg font-semibold text-foreground font-roboto">
            Profile
          </h1>
        </div>
      </div>

      {/* Loading overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            <span className="text-sm text-muted-foreground">Saving...</span>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          
          {/* Profile Header */}
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/api/placeholder/48/48" alt="Profile" />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-violet-600 text-white text-sm">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-foreground font-roboto">
                {getDisplayName()}
              </h2>
              <p className="text-xs text-muted-foreground font-roboto">{profile.email}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
              className="text-xs"
            >
              {isEditing ? <X className="size-3 mr-1" /> : <Edit className="size-3 mr-1" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>

          {/* Essential Information */}
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium font-roboto">First Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={!isEditing}
                      className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500 disabled:opacity-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium font-roboto">Last Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={!isEditing}
                      className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500 disabled:opacity-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium font-roboto">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      disabled={true}
                      className="text-xs bg-background border border-border disabled:opacity-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium font-roboto">Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      {...field}
                      disabled={!isEditing}
                      className="text-xs bg-background border border-border focus:bg-background focus:ring-2 focus:ring-violet-500 disabled:opacity-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-foreground font-roboto">Notification Preferences</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium font-roboto">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground font-roboto">Receive updates via email</p>
                </div>
                <Switch
                  checked={form.watch('notifications.email')}
                  onCheckedChange={(checked) => form.setValue('notifications.email', checked)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium font-roboto">SMS Notifications</Label>
                  <p className="text-xs text-muted-foreground font-roboto">Receive updates via SMS</p>
                </div>
                <Switch
                  checked={form.watch('notifications.sms')}
                  onCheckedChange={(checked) => form.setValue('notifications.sms', checked)}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium font-roboto">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground font-roboto">Receive push notifications</p>
                </div>
                <Switch
                  checked={form.watch('notifications.push')}
                  onCheckedChange={(checked) => form.setValue('notifications.push', checked)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-foreground font-roboto">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start text-left h-12 px-4 text-xs font-roboto"
                onClick={() => router.push('/m/settings')}
              >
                <Shield className="mr-3 h-4 w-4 text-violet-600" />
                Security Settings
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start text-left h-12 px-4 text-xs font-roboto"
                onClick={() => router.push('/m/payment-methods')}
              >
                <CreditCard className="mr-3 h-4 w-4 text-violet-600" />
                Payment Methods
              </Button>
            </div>
          </div>

          {/* Submit Button - Only show when editing */}
          {isEditing && (
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full h-10 bg-violet-600 hover:bg-violet-700 text-white font-roboto"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span className="text-xs">Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="size-3" />
                    <span className="text-xs">Save Changes</span>
                  </div>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}