"use client"

import { useState, ReactNode } from "react"
import { Toaster } from "sonner"
import { MobileHeader } from "./MobileHeader"

interface MobileLayoutProps {
  children: ReactNode
  showNavigation?: boolean
}

export function MobileLayout({ children, showNavigation = false }: MobileLayoutProps) {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-background w-full min-h-screen relative">
        {/* Mobile Header */}
        <MobileHeader
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto h-screen pb-4">
          {children}
        </div>
      </div>
      
      {/* Mobile Toast Container */}
      <Toaster
        position="bottom-center"
        expand={false}
        richColors={false}
        closeButton={false}
        toastOptions={{
          style: {
            maxWidth: '280px',
            minHeight: '48px',
            padding: '8px 12px',
            fontSize: '14px',
            lineHeight: '1.3',
            borderRadius: '8px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            border: 'none'
          },
          duration: 2500
        }}
      />
    </div>
  )
} 
 