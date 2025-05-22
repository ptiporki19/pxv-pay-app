'use client'

import { useEffect } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMerchantUIStore } from '@/lib/store'

export function MobileSidebarToggle() {
  const { toggleSidebar } = useMerchantUIStore()

  useEffect(() => {
    const handleSidebarOpen = () => {
      document.getElementById('mobile-sidebar-container')?.classList.remove('hidden')
    }

    const handleSidebarClose = () => {
      document.getElementById('mobile-sidebar-container')?.classList.add('hidden')
    }

    // Add event listeners
    const openBtns = document.querySelectorAll('.mobile-sidebar-open')
    const closeBtns = document.querySelectorAll('.mobile-sidebar-close')
    
    openBtns.forEach(btn => btn.addEventListener('click', handleSidebarOpen))
    closeBtns.forEach(btn => btn.addEventListener('click', handleSidebarClose))

    // Cleanup
    return () => {
      openBtns.forEach(btn => btn.removeEventListener('click', handleSidebarOpen))
      closeBtns.forEach(btn => btn.removeEventListener('click', handleSidebarClose))
    }
  }, [])

  return (
    <Button variant="ghost" size="icon" className="mobile-sidebar-open" onClick={toggleSidebar}>
      <Menu className="h-6 w-6" />
      <span className="sr-only">Open sidebar</span>
    </Button>
  )
} 