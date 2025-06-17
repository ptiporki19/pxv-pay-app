import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning'
  duration?: number
}

let toastCount = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastCount}`
    const newToast: Toast = {
      id,
      duration: 5000,
      variant: 'default',
      ...toast,
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((toast: Omit<Toast, 'id'>) => {
    return addToast(toast)
  }, [addToast])

  // Convenience methods
  const success = useCallback((title: string, description?: string) => {
    return addToast({ title, description, variant: 'success' })
  }, [addToast])

  const error = useCallback((title: string, description?: string) => {
    return addToast({ title, description, variant: 'error' })
  }, [addToast])

  const warning = useCallback((title: string, description?: string) => {
    return addToast({ title, description, variant: 'warning' })
  }, [addToast])

  return {
    toasts,
    toast,
    success,
    error,
    warning,
    removeToast,
  }
} 