'use client'

import { usePathname } from 'next/navigation'
import FloatingChat from './floating-chat'

const landingPages = [
  '/',
  '/blog',
  '/features',
  '/features/payment-methods',
  '/features/global-coverage', 
  '/features/security',
  '/features/customization',
  '/terms',
  '/privacy'
]

export default function ConditionalFloatingChat() {
  const pathname = usePathname()
  
  // Show on landing pages or blog pages
  const shouldShow = landingPages.some(page => 
    pathname === page || 
    (page === '/blog' && pathname?.startsWith('/blog'))
  )
  
  if (!shouldShow) return null
  
  return <FloatingChat className="fixed bottom-4 right-4 z-50" />
} 