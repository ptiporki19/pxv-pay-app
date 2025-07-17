"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useTheme } from "@/providers/theme-provider"

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      className="toaster group"
      toastOptions={{
        style: {
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        classNames: {
          success: 'toast-success',
          error: 'toast-error',
          warning: 'toast-warning',
          info: 'toast-info',
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "transparent",
          "--success-bg": "#10b981",
          "--success-text": "#ffffff", 
          "--error-bg": "#ef4444",
          "--error-text": "#ffffff",
          "--warning-bg": "#f59e0b",
          "--warning-text": "#ffffff",
          "--info-bg": "#3b82f6",
          "--info-text": "#ffffff",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
