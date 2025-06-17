"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNotificationActions } from '@/providers/notification-provider'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle, Zap, Database, Users, Radio } from 'lucide-react'

export function NotificationDemo() {
  const [title, setTitle] = useState('Test Notification')
  const [description, setDescription] = useState('This is a test notification message')
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'warning' | 'info'>('info')
  const [duration, setDuration] = useState(4000)
  const [persistent, setPersistent] = useState(false)
  
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissAll,
    createDatabaseNotification,
    createSystemNotification
  } = useNotificationActions()

  // Test different notification types
  const testQuickNotifications = () => {
    showSuccess('Success!', 'Operation completed successfully')
    setTimeout(() => showError('Error!', 'Something went wrong'), 1000)
    setTimeout(() => showWarning('Warning!', 'Please be careful'), 2000)
    setTimeout(() => showInfo('Info', 'Here is some information'), 3000)
  }

  // Test custom notification
  const testCustomNotification = () => {
    const notificationMethods = {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo
    }

    const toastId = notificationMethods[notificationType](
      title,
      description,
      persistent ? undefined : { // Action only for non-persistent
        label: 'Undo',
        onClick: () => console.log('Undo clicked')
      }
    )

    console.log('Toast ID:', toastId)
  }

  // Test database notification (will trigger real-time update)
  const testDatabaseNotification = async () => {
    try {
      await createDatabaseNotification(
        'Database Notification',
        'This notification was created in the database and will appear in real-time',
        'info'
      )
      showInfo('Database Notification Sent', 'Check your notifications popover to see it')
    } catch (error) {
      showError('Failed', 'Could not create database notification')
    }
  }

  // Test system-wide notification
  const testSystemNotification = async () => {
    try {
      await createSystemNotification(
        'System Announcement',
        'This is a system-wide notification sent to all users',
        'warning'
      )
      showSuccess('System Notification Sent', 'All users will receive this notification')
    } catch (error) {
      showError('Failed', 'Could not create system notification')
    }
  }

  // Test action notification
  const testActionNotification = () => {
    showInfo('Action Required', 'Click the action button to proceed', {
      label: 'Take Action',
      onClick: () => {
        showSuccess('Action Completed', 'You clicked the action button!')
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Real-Time Notification Demo
          </CardTitle>
          <CardDescription>
            Test the comprehensive real-time notification system across the entire app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Tests */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Quick Tests</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={testQuickNotifications}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Test All Types
              </Button>
              <Button 
                onClick={testActionNotification}
                variant="outline"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Test Action
              </Button>
              <Button 
                onClick={dismissAll}
                variant="outline"
                className="flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Dismiss All
              </Button>
            </div>
          </div>

          {/* Custom Notification Builder */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Custom Notification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={notificationType} 
                  onValueChange={(value: any) => setNotificationType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Success
                      </div>
                    </SelectItem>
                    <SelectItem value="error">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Error
                      </div>
                    </SelectItem>
                    <SelectItem value="warning">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Warning
                      </div>
                    </SelectItem>
                    <SelectItem value="info">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        Info
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notification description"
                rows={3}
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={testCustomNotification}>
                Show Custom Notification
              </Button>
            </div>
          </div>

          {/* Real-time Database Tests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Real-Time Database Notifications</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={testDatabaseNotification}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Test Database Notification
              </Button>
              <Button 
                onClick={testSystemNotification}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Radio className="h-4 w-4" />
                Test System Notification
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              <p>• Database notifications will appear in the notifications popover</p>
              <p>• System notifications are sent to all active users</p>
              <p>• Real-time updates happen automatically via Supabase subscriptions</p>
            </div>
          </div>

          {/* Status Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Notification Features</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <Badge variant="outline">✅ Real-time subscriptions</Badge>
                <Badge variant="outline">✅ Multi-user support</Badge>
                <Badge variant="outline">✅ Action buttons</Badge>
                <Badge variant="outline">✅ Custom duration</Badge>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">✅ Theme integration</Badge>
                <Badge variant="outline">✅ Database persistence</Badge>
                <Badge variant="outline">✅ Toast positioning</Badge>
                <Badge variant="outline">✅ Dismissal controls</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 