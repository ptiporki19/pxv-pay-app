'use client'

import { useEffect, useState } from 'react'
import { MobileCheckoutForm } from '@/components/checkout/mobile-checkout-form'

interface MobileCheckoutClientProps {
  slug: string
}

export function MobileCheckoutClient({ slug }: MobileCheckoutClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Apply mobile-specific theme handling
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const applyTheme = (isDark: boolean) => {
      const html = document.documentElement
      if (isDark) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }
    
    // Apply initial theme
    applyTheme(mediaQuery.matches)
    
    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      applyTheme(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      <MobileCheckoutForm slug={slug} />
    </div>
  )
}