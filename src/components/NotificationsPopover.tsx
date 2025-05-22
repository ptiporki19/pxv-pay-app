'use client'

import { useState } from 'react'
import { Bell, CheckCircle2, Clock, CreditCard, Info, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// Mock notifications data - this would be fetched from API in a real application
const mockNotifications = [
  {
    id: '1',
    title: 'New payment received',
    description: 'You received a payment of $240.00',
    time: '2 minutes ago',
    read: false,
    type: 'payment',
  },
  {
    id: '2',
    title: 'New user signed up',
    description: 'john.doe@example.com has created an account',
    time: '1 hour ago',
    read: false,
    type: 'user',
  },
  {
    id: '3',
    title: 'System update',
    description: 'PXV Pay system was updated to version 1.2.0',
    time: '3 hours ago',
    read: true,
    type: 'system',
  },
  {
    id: '4',
    title: 'Payment method added',
    description: 'New payment method "Bank Transfer" was added',
    time: 'Yesterday',
    read: true,
    type: 'system',
  },
  {
    id: '5',
    title: 'Failed transaction',
    description: 'Transaction #TX123458 has failed',
    time: 'Yesterday',
    read: true,
    type: 'payment',
  },
]

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [open, setOpen] = useState(false)
  
  const unreadCount = notifications.filter(notification => !notification.read).length
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })))
  }
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ))
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
              <span className="absolute inline-flex h-full w-full rounded-full bg-black dark:bg-white opacity-75"></span>
              <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-black dark:bg-white"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Notifications</h4>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-black/10 dark:bg-white/10 px-2 py-0.5 text-xs font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-xs hover:bg-transparent hover:text-gray-900 dark:hover:text-gray-100"
              onClick={markAllAsRead}
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
          )}
        </div>
        {notifications.length > 0 ? (
          <ScrollArea className="h-[320px]">
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-3 cursor-pointer border-b border-gray-100 dark:border-gray-800 transition-colors",
                    notification.read 
                      ? "hover:bg-gray-50 dark:hover:bg-gray-800/60" 
                      : "bg-black/[0.02] dark:bg-white/[0.02]"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className={cn(
                        "text-sm",
                        !notification.read && "font-medium"
                      )}>
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-black dark:bg-white"></span>
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.description}
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