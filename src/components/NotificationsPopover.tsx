'use client'

import { useState, useEffect } from 'react'
import { 
  BellIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  CreditCardIcon, 
  InformationCircleIcon, 
  UserPlusIcon 
} from '@heroicons/react/24/solid'
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
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  is_read: boolean
  type: string
  created_at: string
  user_id: string
  data?: any // Changed to any to fix type casting issues
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
        const formattedNotifications = (data || []).map(notification => ({
          ...notification,
          data: notification.data as any, // Type cast to fix JSON type issues
          time: formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }),
        }))
        setNotifications(formattedNotifications)
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
              time: formatDistanceToNow(new Date(newNotification.created_at), { addSuffix: true })
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
    if (notification.data?.ticket_id) {
      // For support ticket notifications, trigger the floating widget
      // We'll dispatch a custom event to open the widget and show the specific ticket
      const event = new CustomEvent('openSupportWidget', { 
        detail: { 
          ticketId: notification.data.ticket_id,
          tab: 'history'
        } 
      })
      window.dispatchEvent(event)
      return
    }
    
    if (notification.data?.payment_id) {
      // For payment-related notifications, redirect to transaction detail page
      if (notification.title.includes('Payment Received') || notification.title.includes('Payment Submitted')) {
        // Navigate to transaction detail page with the specific payment
        router.push(`/transactions/${notification.data.payment_id}`)
      } else {
        // Default to transaction detail page for any payment-related notification
        router.push(`/transactions/${notification.data.payment_id}`)
      }
    } else {
      // Check if it's a support-related notification by title/message content
      const isSupportNotification = notification.title.includes('Support') || 
                                   notification.title.includes('Ticket') || 
                                   notification.title.includes('Reply') ||
                                   notification.message.includes('ticket') ||
                                   notification.message.includes('support')
      
      if (isSupportNotification) {
        // Open the floating widget for support notifications
        const event = new CustomEvent('openSupportWidget', { 
          detail: { 
            tab: 'history'
          } 
        })
        window.dispatchEvent(event)
    } else {
      // Default fallback: navigate to transactions page
      router.push('/transactions')
    }
    }
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CreditCardIcon className="h-4 w-4 text-gray-500" />
      case 'user':
        return <UserPlusIcon className="h-4 w-4 text-gray-500" />
      case 'system':
        return <InformationCircleIcon className="h-4 w-4 text-gray-500" />
      default:
        return <InformationCircleIcon className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-[10px] w-[10px] items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75 animate-ping"></span>
              <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-violet-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 font-roboto">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Notifications</h4>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs hover:bg-transparent hover:text-gray-600 dark:hover:text-gray-400"
              onClick={markAllAsRead}
            >
              <CheckCircleIcon className="mr-1 h-3 w-3" />
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
                    "flex gap-3 p-3 cursor-pointer transition-colors duration-200 border-b border-gray-100 dark:border-gray-700/50",
                    notification.is_read 
                      ? "hover:bg-gray-50 dark:hover:bg-gray-800" 
                      : "bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className={cn(
                        "text-sm font-roboto",
                        !notification.is_read && "font-medium"
                      )}>
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-1">
                        {!notification.is_read && (
                          <span className="h-2 w-2 rounded-full bg-violet-500"></span>
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
              <BellIcon className="h-5 w-5 text-violet-400" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          </div>
        )}

      </PopoverContent>
    </Popover>
  )
} 