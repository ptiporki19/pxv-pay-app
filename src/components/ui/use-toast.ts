"use client"

import { notificationService } from '@/lib/notification-service'

interface ToastProps {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

// Updated toast implementation using our notification service
export function toast(props: ToastProps): string {
  const type = props.variant === 'destructive' ? 'error' : 'success'
  return notificationService.showToast({
    title: props.title,
    description: props.description,
    type
  })
}

// Export additional helper functions for backwards compatibility
export const useToast = () => ({
  toast: (props: ToastProps) => toast(props),
  dismiss: (toastId: string) => notificationService.dismissToast(toastId),
  dismissAll: () => notificationService.dismissAll()
}) 