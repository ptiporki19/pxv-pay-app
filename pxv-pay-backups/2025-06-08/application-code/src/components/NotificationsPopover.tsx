'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle2, Clock, CreditCard, Info, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  is_read: boolean
  type: string
  created_at: string
  user_id: string
  data?: {
    payment_id?: string
    customer_name?: string
    amount?: number
    currency?: string
    checkout_link_id?: string
    merchant_id?: string
  }
}

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  
  const unreadCount = notifications.filter(notification => !notification.is_read).length
  const supabase = createClient()
  const router = useRouter()
  
  // Fetch notifications from Supabase
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      const { data: sessionData } = await supabase.auth.getSession()
      const userEmail = sessionData?.session?.user?.email
      
      if (!userEmail) return
      
      // Get database user ID using email (same pattern as dashboard fix)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single()
      
      if (userError || !userData) {
        console.error('Failed to get user data:', userError)
        return
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      
      if (data) {
        setNotifications(data.map(notification => ({
          ...notification,
          time: getRelativeTime(notification.created_at)
        })))
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error.message)
    } finally {
      setLoading(false)
    }
  }
  
  // Set up real-time subscription for new notifications
  useEffect(() => {
    fetchNotifications()
    
    const setupSubscription = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const userEmail = sessionData?.session?.user?.email
      
      if (!userEmail) return
      
      // Get database user ID for subscription filtering
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single()
      
      if (!userData) return
      
      // Subscribe to new notifications for this specific user
      const subscription = supabase
        .channel('notifications-channel')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userData.id}`
        }, (payload) => {
          // Add the new notification to the list
          const newNotification = payload.new as Notification
          setNotifications(prev => [
            {
              ...newNotification,
              time: getRelativeTime(newNotification.created_at)
            },
            ...prev
          ])
          
          // Show toast notification
          toast.info(newNotification.title, {
            description: newNotification.message,
          })
        })
        .subscribe()
      
      return () => {
        supabase.removeChannel(subscription)
      }
    }
    
    setupSubscription()
  }, [])
  
  // Convert timestamp to relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return date.toLocaleDateString()
  }
  
  const markAllAsRead = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const userEmail = sessionData?.session?.user?.email
      
      if (!userEmail) return
      
      // Get database user ID using email
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single()
      
      if (!userData) return
      
      // Update all unread notifications in Supabase
      const unreadIds = notifications
        .filter(notification => !notification.is_read)
        .map(notification => notification.id)
      
      if (unreadIds.length > 0) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', unreadIds)
        
        if (error) throw error
      }
      
      // Update local state
      setNotifications(notifications.map(notification => ({
        ...notification,
        is_read: true
      })))
    } catch (error: any) {
      console.error('Error marking notifications as read:', error.message)
    }
  }
  
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first
    await markAsRead(notification.id)
    
    // Close the popover
    setOpen(false)
    
    // Navigate based on notification type and data
    if (notification.data?.payment_id) {
      // For payment-related notifications, redirect to verification page
      if (notification.title.includes('Payment Received') || notification.title.includes('Payment Submitted')) {
        // Navigate to verification page with the specific payment
        router.push(`/verification?payment_id=${notification.data.payment_id}`)
      }
    }
    
    // Default fallback: navigate to verification page
    if (!notification.data?.payment_id) {
      router.push('/verification')
    }
  }

  const markAsRead = async (id: string) => {
    try {
      // Update notification in Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ))
    } catch (error: any) {
      console.error('Error marking notification as read:', error.message)
    }
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="h-4 w-4 text-gray-500" />
      case 'user':
        return <UserPlus className="h-4 w-4 text-gray-500" />
      case 'system':
        return <Info className="h-4 w-4 text-gray-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-[10px] w-[10px] items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
              <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-black"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Notifications</h4>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-black/10 px-2 py-0.5 text-xs font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs hover:bg-transparent hover:text-gray-900"
              onClick={markAllAsRead}
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-[100px]">
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <ScrollArea className="h-[320px]">
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-3 cursor-pointer border-b border-gray-100 transition-colors",
                    notification.is_read 
                      ? "hover:bg-background" 
                      : "bg-black/[0.02]"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className={cn(
                        "text-sm",
                        !notification.is_read && "font-medium"
                      )}>
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-1">
                        {!notification.is_read && (
                          <span className="h-2 w-2 rounded-full bg-black"></span>
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-[100px]">
            <div className="flex flex-col items-center gap-2">
              <Bell className="h-5 w-5 text-gray-400" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          </div>
        )}
        <div className="p-3 border-t">
          <Button variant="outline" size="sm" className="w-full text-xs gap-1">
            <Clock className="h-3.5 w-3.5" />
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
} 