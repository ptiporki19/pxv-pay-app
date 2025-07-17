'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useMerchantUIStore } from '@/lib/store'
import { 
  HomeIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  LinkIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  BoltIcon,
  CubeIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/solid'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ActiveNavLinkProps {
  href: string
  iconName: string
  children: React.ReactNode
  collapsed?: boolean
  onClick?: () => void
  className?: string
}

export function ActiveNavLink({ href, iconName, children, collapsed = false, onClick, className }: ActiveNavLinkProps) {
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
  
  // Render the appropriate icon based on iconName - using Heroicons solid
  const renderIcon = () => {
    const iconClassName = cn("h-5 w-5 transition-all duration-200",
      collapsed ? "mx-auto" : "mr-3",
      isActive 
        ? "text-white drop-shadow-sm" 
        : "text-violet-200 group-hover:text-white group-hover:drop-shadow-sm"
    )
    
    switch (iconName) {
      case 'Home':
        return <HomeIcon className={iconClassName} />
      case 'Globe':
        return <GlobeAltIcon className={iconClassName} />
      case 'DollarSign':
        return <CurrencyDollarIcon className={iconClassName} />
      case 'CreditCard':
        return <CreditCardIcon className={iconClassName} />
      case 'Link2':
        return <LinkIcon className={iconClassName} />
      case 'Palette':
        return <PaintBrushIcon className={iconClassName} />
      case 'FileText':
        return <DocumentTextIcon className={iconClassName} />
      case 'Shield':
        return <ShieldCheckIcon className={iconClassName} />
      case 'Users':
        return <UsersIcon className={iconClassName} />
      case 'Activity':
        return <ChartBarIcon className={iconClassName} />
      case 'Clock':
        return <ClockIcon className={iconClassName} />
      case 'Zap':
        return <BoltIcon className={iconClassName} />
      case 'Crown':
        return <ShieldCheckIcon className={iconClassName} /> // Using ShieldCheck as Crown alternative
      case 'Package':
        return <CubeIcon className={iconClassName} />
      case 'Building2':
        return <BuildingStorefrontIcon className={iconClassName} /> // Brand Management icon
      default:
        return <HomeIcon className={iconClassName} />
    }
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center rounded-xl px-3 py-3 text-sm font-bold font-roboto transition-all duration-200 hover:scale-[1.02] transform-gpu tracking-wide",
        collapsed ? "justify-center" : "gap-3",
        isActive
          ? "bg-violet-500/80 dark:bg-violet-800/80 text-white shadow-lg backdrop-blur-sm border border-violet-400/30"
          : "text-violet-200 hover:bg-violet-500/60 dark:hover:bg-violet-800/60 hover:text-white hover:shadow-md backdrop-blur-sm",
        className
      )}
      title={collapsed ? children?.toString() : undefined}
    >
      {renderIcon()}
      {!collapsed && (
        <span className="transition-colors duration-200 font-bold font-roboto tracking-wide">
          {children}
        </span>
      )}
    </Link>
  )
} 