"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  created_at: string
  read: boolean
}

export function MobileNotifications() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications()
    }
  }, [showNotifications])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.email) return

      // Get user notifications from database
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching notifications:', error)
        // Set empty array on error to prevent crash
        setNotifications([])
      } else {
        // Map the database fields to match our interface
        const mappedNotifications = (data || []).map(item => ({
          id: item.id,
          title: item.title,
          message: item.message,
          type: item.type as 'info' | 'success' | 'warning' | 'error',
          created_at: item.created_at,
          read: item.is_read || false
        }))
        setNotifications(mappedNotifications)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 hover:bg-muted rounded-full transition-colors h-8 w-8 flex items-center justify-center"
      >
        <Bell className="size-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
        )}
      </button>
      
      {showNotifications && (
        <div className="absolute top-10 right-0 bg-card border border-border rounded-lg shadow-lg w-80 z-30 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-card-foreground text-sm font-lato">
              Recent Activity
            </h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600 mx-auto mb-2"></div>
                <p className="text-xs text-muted-foreground font-lato">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">
                <Bell className="size-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-lato">No notifications yet</p>
                <p className="text-xs text-muted-foreground font-lato">You'll see updates about your checkout links here</p>
              </div>
            ) : (
              <div className="space-y-0">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getNotificationIcon(notification.type)}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-card-foreground font-medium font-lato">
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-xs text-muted-foreground font-lato mt-1">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground font-lato mt-1">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border bg-muted/30">
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full text-xs text-violet-600 hover:text-violet-700 font-medium font-lato transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 