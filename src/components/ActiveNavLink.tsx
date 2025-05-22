'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useMerchantUIStore } from '@/lib/store'
import { Home, Globe, DollarSign, CreditCard, Link2, Palette, FileText, Shield, Users, Activity, Clock } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ActiveNavLinkProps {
  href: string
  iconName: string
  children: React.ReactNode
}

export function ActiveNavLink({ href, iconName, children }: ActiveNavLinkProps) {
  const pathname = usePathname()
  const { setActiveNav } = useMerchantUIStore()
  
  // Check if the current route matches this navigation item
  const isActive = pathname === href

  // Update active nav item when path changes
  useEffect(() => {
    if (isActive) {
      setActiveNav(href)
    }
  }, [isActive, href, setActiveNav])
  
  // Render the appropriate icon based on iconName
  const renderIcon = () => {
    const className = cn("mr-3 h-5 w-5",
      isActive 
        ? "text-black dark:text-white" 
        : "text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white"
    )
    
    switch (iconName) {
      case 'Home':
        return <Home className={className} />
      case 'Globe':
        return <Globe className={className} />
      case 'DollarSign':
        return <DollarSign className={className} />
      case 'CreditCard':
        return <CreditCard className={className} />
      case 'Link2':
        return <Link2 className={className} />
      case 'Palette':
        return <Palette className={className} />
      case 'FileText':
        return <FileText className={className} />
      case 'Shield':
        return <Shield className={className} />
      case 'Users':
        return <Users className={className} />
      case 'Activity':
        return <Activity className={className} />
      case 'Clock':
        return <Clock className={className} />
      default:
        return <Home className={className} />
    }
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive 
          ? "bg-black/5 dark:bg-white/10 text-black dark:text-white font-medium" 
          : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
      )}
    >
      {renderIcon()}
      {children}
    </Link>
  )
} 