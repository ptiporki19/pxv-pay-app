"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { notificationService, NotificationService } from '@/lib/notification-service'

interface NotificationContextType {
  service: NotificationService
  isInitialized: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize the notification service
    const initializeService = async () => {
      try {
        // The service is already initialized as a singleton
        // Just mark it as ready
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize notification service:', error)
      }
    }

    initializeService()
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        service: notificationService,
        isInitialized
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Export convenience hooks for common notification types
export function useNotificationActions() {
  const { service } = useNotifications()
  
  return {
    showSuccess: service.showSuccess.bind(service),
    showError: service.showError.bind(service),
    showWarning: service.showWarning.bind(service),
    showInfo: service.showInfo.bind(service),
    dismissToast: service.dismissToast.bind(service),
    dismissAll: service.dismissAll.bind(service),
    createDatabaseNotification: service.createDatabaseNotification.bind(service),
    createSystemNotification: service.createSystemNotification.bind(service)
  }
} 