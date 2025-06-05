import { Metadata } from 'next'
import Link from 'next/link'
import { User, Settings, X } from 'lucide-react'
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
  { label: 'Product Management', path: '/content', iconName: 'ShoppingBag' },
  { label: 'Payment Verification', path: '/verification', iconName: 'Shield' },
  { label: 'Real-Time Test', path: '/test-realtime', iconName: 'Zap' },
]

// Super admin only items - includes global data management
const superAdminItems = [
  { label: 'Super Admin Dashboard', path: '/super-admin', iconName: 'Crown' },
  { label: 'Users', path: '/users', iconName: 'Users' },
  { label: 'Blog Management', path: '/blog-management', iconName: 'FileText' },
  { label: 'Audit Logs', path: '/audit-logs', iconName: 'FileText' },
]

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
    .eq('id', session.user.id)
    .single()

    // Get role from profile or use default
    userRole = (profile?.role as UserRole) || 'registered_user'
    
    // Check if super admin (use both DB role and email check)
    isSuperAdmin = userRole === 'super_admin' || 
      (session.user.email === 'admin@pxvpay.com' || 
       session.user.email === 'dev-admin@pxvpay.com' || 
       session.user.email === 'superadmin@pxvpay.com')
    
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
      <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col border-r border-gray-200">
          <div className="flex h-full flex-col overflow-y-auto bg-white">
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
              <Link href={isSuperAdmin ? "/super-admin" : "/dashboard"} className="flex items-center">
                <span className="text-xl font-bold text-black">PXV Pay</span>
            </Link>
          </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navItems.map((item) => (
                <ActiveNavLink
                  key={item.path}
                  href={item.path}
                    iconName={item.iconName}
                >
                  {item.label}
                </ActiveNavLink>
              ))}
          </nav>
            <div className="p-4 mt-auto border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-gray-200">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="text-sm bg-gray-100 text-gray-800">{userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate max-w-[140px]">{userName}</span>
                  <span className="text-xs text-gray-500 truncate max-w-[140px]">{userEmail}</span>
                </div>
              </div>
            </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <div id="mobile-sidebar-container" className="fixed inset-0 z-40 hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
                <Link href={isSuperAdmin ? "/super-admin" : "/dashboard"} className="flex items-center">
                  <span className="text-xl font-bold text-black">PXV Pay</span>
              </Link>
              <Button variant="ghost" size="icon" className="mobile-sidebar-close">
                  <X className="h-5 w-5" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>
              <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => (
                  <ActiveNavLink
                    key={item.path}
                    href={item.path}
                      iconName={item.iconName}
                  >
                    {item.label}
                  </ActiveNavLink>
                ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
          <header className="w-full h-16 border-b border-gray-200 bg-white shadow-sm">
            <div className="flex h-full items-center justify-between px-4">
            <div className="flex items-center md:hidden">
              <MobileSidebarToggle />
            </div>
            
            {/* Right side header items */}
              <div className="flex flex-1 justify-end items-center gap-3">
                <NotificationsPopover />
                <ThemeToggleButton />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8 border border-gray-200">
                      <AvatarImage src="" alt={userName} />
                        <AvatarFallback className="text-sm bg-gray-100 text-gray-800">{userName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <Avatar className="h-9 w-9 border border-gray-200">
                        <AvatarImage src="" alt={userName} />
                        <AvatarFallback className="text-sm bg-gray-100 text-gray-800">{userName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-gray-500">{userEmail}</p>
                      </div>
                    </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                      <Link href="/profile" className="flex w-full items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                      <Link href="/settings" className="flex w-full items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                    <LogoutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
    </RouteGuard>
  )
} 