"use client"

import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export interface NotificationData {
  id?: string
  title: string
  description?: string
  type: 'success' | 'error' | 'info' | 'warning'
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
  persistent?: boolean
}

export class NotificationService {
  private static instance: NotificationService
  private supabase = createClient()
  private currentUserId: string | null = null
  private subscriptions: any[] = []
  private isInitialized = false

  private constructor() {
    // Initialize asynchronously to avoid blocking
    this.initializeAsync()
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private async initializeAsync() {
    try {
      await this.initializeUser()
      if (this.currentUserId) {
        this.setupRealTimeSubscriptions()
      }
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize notification service:', error)
      // Don't throw error to prevent unhandled rejections
    }
  }

  private async initializeUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      if (error) {
        console.warn('Auth error in notification service:', error)
        return
      }
      this.currentUserId = user?.id || null
    } catch (error) {
      console.warn('Failed to get user for notifications:', error)
    }
  }

  private setupRealTimeSubscriptions() {
    // Only set up subscriptions if we have a user ID
    if (!this.currentUserId) {
      return
    }

    try {
      // Subscribe to real-time notifications from database
      const notificationsSubscription = this.supabase
        .channel('notifications-channel')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${this.currentUserId}`
        }, (payload) => {
          try {
            const notification = payload.new as any
            this.showToast({
              title: notification.title,
              description: notification.message,
              type: this.mapNotificationType(notification.type)
            })
          } catch (error) {
            console.error('Error handling notification payload:', error)
          }
        })
        .subscribe()

      this.subscriptions.push(notificationsSubscription)

      // Subscribe to payment updates
      const paymentsSubscription = this.supabase
        .channel('payments-channel')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${this.currentUserId}`
        }, (payload) => {
          try {
            const payment = payload.new as any
            const oldPayment = payload.old as any
            
            if (payment.status !== oldPayment.status) {
              this.showToast({
                title: 'Payment Status Updated',
                description: `Your payment of $${payment.amount} is now ${payment.status}`,
                type: payment.status === 'completed' ? 'success' : 
                      payment.status === 'failed' ? 'error' : 'info'
              })
            }
          } catch (error) {
            console.error('Error handling payment update:', error)
          }
        })
        .subscribe()

      this.subscriptions.push(paymentsSubscription)

      // Subscribe to theme updates
      const themesSubscription = this.supabase
        .channel('themes-channel')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'themes',
          filter: `user_id=eq.${this.currentUserId}`
        }, (payload) => {
          try {
            if (payload.eventType === 'INSERT') {
              this.showToast({
                title: 'Theme Created',
                description: `New theme "${payload.new.name}" has been created`,
                type: 'success'
              })
            } else if (payload.eventType === 'UPDATE') {
              this.showToast({
                title: 'Theme Updated',
                description: `Theme "${payload.new.name}" has been updated`,
                type: 'info'
              })
            }
          } catch (error) {
            console.error('Error handling theme update:', error)
          }
        })
        .subscribe()

      this.subscriptions.push(themesSubscription)

      // Subscribe to content template updates
      const contentSubscription = this.supabase
        .channel('content-templates-channel')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'content_templates',
          filter: `user_id=eq.${this.currentUserId}`
        }, (payload) => {
          try {
            if (payload.eventType === 'INSERT') {
              this.showToast({
                title: 'Content Template Created',
                description: `New template "${payload.new.title}" has been created`,
                type: 'success'
              })
            } else if (payload.eventType === 'UPDATE') {
              this.showToast({
                title: 'Content Template Updated',
                description: `Template "${payload.new.title}" has been updated`,
                type: 'info'
              })
            }
          } catch (error) {
            console.error('Error handling content template update:', error)
          }
        })
        .subscribe()

      this.subscriptions.push(contentSubscription)

    } catch (error) {
      console.error('Error setting up real-time subscriptions:', error)
    }
  }

  // Clean up subscriptions
  public cleanup() {
    this.subscriptions.forEach(subscription => {
      try {
        this.supabase.removeChannel(subscription)
      } catch (error) {
        console.error('Error removing subscription:', error)
      }
    })
    this.subscriptions = []
  }

  private mapNotificationType(dbType: string): 'success' | 'error' | 'info' | 'warning' {
    switch (dbType) {
      case 'success':
      case 'payment_completed':
        return 'success'
      case 'error':
      case 'payment_failed':
        return 'error'
      case 'warning':
      case 'payment_pending':
        return 'warning'
      default:
        return 'info'
    }
  }

  public showToast(notification: NotificationData): string {
    const toastId = Math.random().toString(36).substr(2, 9)
    
    try {
      const toastOptions = {
        id: toastId,
        duration: notification.persistent ? Infinity : (notification.duration || 4000),
        action: notification.action ? {
          label: notification.action.label,
          onClick: notification.action.onClick
        } : undefined
      }

      switch (notification.type) {
        case 'success':
          toast.success(notification.title, {
            description: notification.description,
            ...toastOptions
          })
          break
        case 'error':
          toast.error(notification.title, {
            description: notification.description,
            ...toastOptions
          })
          break
        case 'warning':
          toast.warning(notification.title, {
            description: notification.description,
            ...toastOptions
          })
          break
        case 'info':
        default:
          toast.info(notification.title, {
            description: notification.description,
            ...toastOptions
          })
          break
      }
    } catch (error) {
      console.error('Error showing toast:', error)
    }

    return toastId
  }

  public showSuccess(title: string, description?: string, action?: NotificationData['action']): string {
    return this.showToast({ title, description, type: 'success', action })
  }

  public showError(title: string, description?: string, action?: NotificationData['action']): string {
    return this.showToast({ title, description, type: 'error', action })
  }

  public showWarning(title: string, description?: string, action?: NotificationData['action']): string {
    return this.showToast({ title, description, type: 'warning', action })
  }

  public showInfo(title: string, description?: string, action?: NotificationData['action']): string {
    return this.showToast({ title, description, type: 'info', action })
  }

  public dismissToast(toastId: string): void {
    try {
      toast.dismiss(toastId)
    } catch (error) {
      console.error('Error dismissing toast:', error)
    }
  }

  public dismissAll(): void {
    try {
      toast.dismiss()
    } catch (error) {
      console.error('Error dismissing all toasts:', error)
    }
  }

  // Create a notification in the database (will trigger real-time update)
  public async createDatabaseNotification(
    title: string,
    description: string,
    type: string = 'info',
    userId?: string
  ): Promise<void> {
    try {
      const targetUserId = userId || this.currentUserId
      if (!targetUserId) {
        console.warn('No user ID available for database notification')
        return
      }

      const { error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          title,
          message: description,
          type,
          is_read: false
        })

      if (error) {
        console.error('Failed to create database notification:', error)
        throw error
      }
    } catch (error) {
      console.error('Error creating database notification:', error)
      throw error
    }
  }

  // Batch notification for multiple users
  public async createBulkNotification(
    title: string,
    description: string,
    type: string = 'info',
    userIds: string[]
  ): Promise<void> {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        title,
        message: description,
        type,
        is_read: false
      }))

      const { error } = await this.supabase
        .from('notifications')
        .insert(notifications)

      if (error) {
        console.error('Failed to create bulk notifications:', error)
        throw error
      }
    } catch (error) {
      console.error('Error creating bulk notifications:', error)
      throw error
    }
  }

  // System-wide notification for all users
  public async createSystemNotification(
    title: string,
    description: string,
    type: string = 'info'
  ): Promise<void> {
    try {
      // Get all active users
      const { data: users, error } = await this.supabase
        .from('users')
        .select('id')
        .eq('is_active', true)

      if (error) {
        console.error('Failed to get users for system notification:', error)
        throw error
      }

      if (users && users.length > 0) {
        const userIds = users.map(user => user.id)
        await this.createBulkNotification(title, description, type, userIds)
      }
    } catch (error) {
      console.error('Error creating system notification:', error)
      throw error
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance()

// Export helper functions for easier usage
export const {
  showToast,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  dismissToast,
  dismissAll,
  createDatabaseNotification,
  createBulkNotification,
  createSystemNotification
} = notificationService 