'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  BellIcon,
  MoonIcon,
  KeyIcon
} from "@heroicons/react/24/outline"
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { mobileToastMessages } from '@/lib/mobile-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// Validation schema
const settingsSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    marketing: z.boolean(),
    security: z.boolean(),
  }),
  appearance: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string(),
  }),
  security: z.object({
    twoFactor: z.boolean(),
    biometric: z.boolean(),
    rememberMe: z.boolean(),
  }),
  privacy: z.object({
    shareData: z.boolean(),
    personalizedAds: z.boolean(),
    locationTracking: z.boolean(),
  }),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export function MobileSettingsContent() {
  const [isLoading, setIsLoading] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      notifications: {
        email: true,
        sms: false,
        push: true,
        marketing: false,
        security: true,
      },
      appearance: {
        theme: 'system',
        language: 'en',
      },
      security: {
        twoFactor: true,
        biometric: false,
        rememberMe: true,
      },
      privacy: {
        shareData: false,
        personalizedAds: false,
        locationTracking: true,
      },
    },
  })

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true)
    try {
      // API call would go here
      console.log('Settings updated:', data)
      mobileToastMessages.settings.updated()
    } catch (error) {
      console.error('Failed to update settings:', error)
      mobileToastMessages.settings.updateError(error instanceof Error ? error.message : undefined)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="px-4 py-3 pb-20 pt-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeftIcon className="size-4 text-muted-foreground" />
        </button>
        <div className="text-right">
          <h1 className="text-lg font-normal text-foreground font-roboto">
            Settings
          </h1>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            <span className="text-sm text-muted-foreground">Saving...</span>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          
          {/* Essential Settings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-normal font-roboto">Email Notifications</Label>
              <Switch
                checked={form.watch('notifications.email')}
                onCheckedChange={(checked) => form.setValue('notifications.email', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs font-normal font-roboto">Push Notifications</Label>
              <Switch
                checked={form.watch('notifications.push')}
                onCheckedChange={(checked) => form.setValue('notifications.push', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs font-normal font-roboto flex items-center">
                <MoonIcon className="mr-2 h-3 w-3" />
                Dark Mode
              </Label>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs font-normal font-roboto flex items-center">
                <ShieldCheckIcon className="mr-2 h-3 w-3" />
                Two-Factor Auth
              </Label>
              <Switch
                checked={form.watch('security.twoFactor')}
                onCheckedChange={(checked) => form.setValue('security.twoFactor', checked)}
              />
            </div>
          </div>

          {/* Account Management */}
          <div className="space-y-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start text-left h-10 px-3 text-xs font-roboto"
              onClick={() => router.push('/m/change-password')}
            >
              <KeyIcon className="mr-2 h-3 w-3 text-violet-600" />
              Change Password
            </Button>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-violet-600 hover:bg-violet-700 text-white font-roboto font-normal"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span className="text-xs">Saving...</span>
                </div>
              ) : (
                <span className="text-xs">Save Changes</span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}