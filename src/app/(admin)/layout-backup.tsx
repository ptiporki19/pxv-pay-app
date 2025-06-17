'use client'

import { Metadata } from 'next'
import Link from 'next/link'
import { User, Settings, X, Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/server'
import { MobileSidebarToggle } from '@/components/MobileSidebarToggle'
import { ActiveNavLink } from '@/components/ActiveNavLink'
import { LogoutButton } from '@/components/LogoutButton'
import { NotificationsPopover } from '@/components/NotificationsPopover'
import { ThemeToggleButton } from '@/components/theme-toggle-button'
import { RouteGuard } from '@/components/RouteGuard'
import { useState, useEffect } from 'react'

export const metadata: Metadata = {
  title: 'Merchant Dashboard - PXV Pay',
  description: 'Merchant Dashboard for PXV Pay',
}

// Define the user role type
type UserRole = 'super_admin' | 'registered_user' | 'subscriber' | 'free_user'

// Navigation items for merchants
const merchantNavItems = [
  { label: 'Dashboard', path: '/dashboard', iconName: 'Home' },
  { label: 'Checkout Links', path: '/checkout-links', iconName: 'Link2' },
  { label: 'Payment Methods', path: '/payment-methods', iconName: 'CreditCard' },
  { label: 'Theme Customization', path: '/theme', iconName: 'Palette' },
  { label: 'Product Management', path: '/content', iconName: 'Package' },
  { label: 'Payment Verification', path: '/verification', iconName: 'Shield' },
]

// Super admin only items - includes global data management
const superAdminItems = [
  { label: 'Super Admin Dashboard', path: '/super-admin', iconName: 'Crown' },
  { label: 'Users', path: '/users', iconName: 'Users' },
  { label: 'Blog Management', path: '/blog-management', iconName: 'FileText' },
  { label: 'Audit Logs', path: '/audit-logs', iconName: 'FileText' },
]

// Elegant violet-themed logo component (same as landing page)
const Brand = ({ collapsed = false }: { collapsed?: boolean }) => (
  <div className="flex items-center space-x-3 group">
    <div className="relative">
      <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-violet-700 shadow-lg">
        <span className="text-white font-bold text-xl">P</span>
      </div>
    </div>
    {!collapsed && (
      <span className="text-2xl font-bold text-black dark:text-white tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">
        PXV Pay
      </span>
    )}
  </div>
)

function AdminLayoutClient({
  children,
  navItems,
  isSuperAdmin,
  userName,
  userEmail,
}: {
  children: React.ReactNode
  navItems: any[]
  isSuperAdmin: boolean
  userName: string
  userEmail: string
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Floating Sidebar */}
      <aside 
        className={`
          fixed left-4 top-4 bottom-4 z-30 
          ${sidebarCollapsed ? 'w-16' : 'w-64'} 
          ${isMobile ? 'hidden' : 'flex'}
          flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
        `}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Logo and Collapse Button */}
          <div className="flex h-16 flex-shrink-0 items-center justify-between px-4">
            <Link 
              href={isSuperAdmin ? "/super-admin" : "/dashboard"} 
              className="flex items-center transition-opacity duration-300 hover:opacity-80"
            >
              <Brand collapsed={sidebarCollapsed} />
            </Link>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/30 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-4 overflow-y-auto">
            {navItems.map((item) => (
              <ActiveNavLink
                key={item.path}
                href={item.path}
                iconName={item.iconName}
                collapsed={sidebarCollapsed}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
              >
                {!sidebarCollapsed && item.label}
              </ActiveNavLink>
            ))}
          </nav>

          {/* User Profile */}
          {!sidebarCollapsed && (
            <div className="p-4 mt-auto">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-600">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="text-sm bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                    {userName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userEmail}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div 
        className={`
          flex flex-1 flex-col transition-all duration-300 ease-in-out
          ${isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-24' : 'ml-72'}
        `}
      >
        {/* Floating Header */}
        <header className="fixed top-4 right-4 z-40">
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/30 text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}

            {/* Header Actions */}
            <NotificationsPopover />
            <ThemeToggleButton />
            
            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-600">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="text-sm bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                <div className="flex items-center justify-start gap-2 p-3">
                  <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-600">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="text-sm bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">{userName}</p>
                    <p className="text-xs leading-none text-gray-500 dark:text-gray-400">{userEmail}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem className="hover:bg-violet-50 dark:hover:bg-violet-950/30">
                  <Link href="/profile" className="flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-violet-50 dark:hover:bg-violet-950/30">
                  <Link href="/settings" className="flex w-full items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 pt-20">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default async function MerchantDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Create server client for initial data (client-side RouteGuard will handle auth)
  const supabase = await createClient()

  // Get session for initial render
  const { data: { session } } = await supabase.auth.getSession()
  
  // Default values (will be updated by client-side)
  let userRole: UserRole = 'registered_user'
  let isSuperAdmin = false
  let userName = 'User'
  let userEmail = ''

  // Get user profile if session exists
  if (session?.user) {
    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single()

    // Get role from profile or use default
    userRole = (profile?.role as UserRole) || 'registered_user'
    
    // Check if super admin (use ONLY database role)
    isSuperAdmin = userRole === 'super_admin'
    
    console.log('Admin Layout - User Role Check:', {
      userEmail: session.user.email,
      userId: session.user.id,
      databaseRole: userRole,
      isSuperAdmin
    })
    
    userName = profile?.email?.split('@')[0] || session.user.email?.split('@')[0] || 'User'
    userEmail = profile?.email || session.user.email || ''
  }

  // Filter navigation items based on permissions
  const navItems = merchantNavItems.filter(item => {
    if (item.label === 'Theme Customization') {
      return true // Available to all users
    }
    if (item.label === 'Product Management') {
      return true // Available to all users
    }
    return true
  })

  // Add super admin items at the top if applicable
  if (isSuperAdmin) {
    navItems.unshift(...superAdminItems)
  }

  return (
    <RouteGuard>
      <AdminLayoutClient
        navItems={navItems}
        isSuperAdmin={isSuperAdmin}
        userName={userName}
        userEmail={userEmail}
      >
        {children}
      </AdminLayoutClient>
    </RouteGuard>
  )
} 