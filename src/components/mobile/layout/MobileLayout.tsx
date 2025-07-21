"use client"

import { useState, ReactNode } from "react"
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
    </div>
  )
} 
 