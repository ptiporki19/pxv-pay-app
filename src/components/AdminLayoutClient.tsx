'use client'

import Link from 'next/link'
import { 
  User as UserIcon, 
  Settings as Cog6ToothIcon, 
  X as XMarkIcon, 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon, 
  Menu as Bars3Icon 
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ActiveNavLink } from '@/components/ActiveNavLink'
import { LogoutButton } from '@/components/LogoutButton'
import { NotificationsPopover } from '@/components/NotificationsPopover'
import { ThemeToggleButton } from '@/components/theme-toggle-button'
import { useState } from 'react'

// Desktop logo component with working SVG logo
const DashboardBrand = ({ collapsed = false }: { collapsed?: boolean }) => (
  <div className="flex items-center space-x-2 group">
    <div className="relative">
      <img
        src="/logo.svg"
        alt="Company Logo"
        className="w-12 h-12 transition-all duration-300 group-hover:scale-105"
      />
    </div>
    {!collapsed && (
      <div className="transition-all duration-300">
        <span className="text-3xl font-black text-white tracking-tight group-hover:text-violet-100 transition-colors duration-300 font-fascinate">
          PXV
        </span>
      </div>
    )}
  </div>
)

// Define the user role type
type UserRole = 'super_admin' | 'registered_user' | 'subscriber' | 'free_user'

// Navigation items for merchants
const merchantNavItems = [
  { label: 'Dashboard', path: '/dashboard', iconName: 'Home' },
  { label: 'Checkout Links', path: '/checkout-links', iconName: 'Link2' },
  { label: 'Payment Methods', path: '/payment-methods', iconName: 'CreditCard' },
  { label: 'Brand Management', path: '/theme', iconName: 'Building2' },
  { label: 'Product Management', path: '/content', iconName: 'Package' },
  { label: 'Payment Verification', path: '/verification', iconName: 'Shield' },
]

// Hidden navigation items (accessible via URL but not shown in nav)
const hiddenNavItems = [
  { label: 'Analytics', path: '/old-dashboard', iconName: 'Activity' },
]

// Super admin only items
const superAdminItems = [
  { label: 'Super Admin Dashboard', path: '/super-admin', iconName: 'Crown' },
  { label: 'Support Tickets', path: '/super-admin/support-tickets', iconName: 'MessageCircle' },
  { label: 'Users', path: '/users', iconName: 'Users' },
  { label: 'Blog Management', path: '/blog-management', iconName: 'FileText' },
  { label: 'Audit Logs', path: '/audit-logs', iconName: 'FileText' },
]

interface AdminLayoutClientProps {
  children: React.ReactNode
  userRole: UserRole
  isSuperAdmin: boolean
  userName: string
  userEmail: string
}

export function AdminLayoutClient({ 
  children, 
  userRole, 
  isSuperAdmin, 
  userName, 
  userEmail 
}: AdminLayoutClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Filter navigation items based on permissions
  const navItems = [...merchantNavItems]

  // Add super admin items at the top if applicable
  if (isSuperAdmin) {
    navItems.unshift(...superAdminItems)
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Floating Sidebar */}
      <aside className={`hidden md:flex md:flex-col fixed left-4 top-4 bottom-4 z-30 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div className="flex h-full flex-col bg-gradient-to-b from-violet-600 via-violet-650 to-violet-700 dark:from-violet-700 dark:via-violet-750 dark:to-violet-800 rounded-2xl shadow-2xl border border-violet-500/20">
          {/* Enhanced Logo Section */}
          <div className="flex h-18 flex-shrink-0 items-center justify-between px-4 py-3 border-b border-violet-500/30">
            <Link href={isSuperAdmin ? "/super-admin" : "/dashboard"} className="flex items-center">
              <DashboardBrand collapsed={sidebarCollapsed} />
            </Link>
            {!sidebarCollapsed && (
              <div
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-10 w-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
              >
                <Bars3Icon className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-6">
            {navItems.map((item) => (
              <ActiveNavLink
                key={item.path}
                href={item.path}
                iconName={item.iconName}
                collapsed={sidebarCollapsed}
                className="font-bold text-white hover:text-white text-sm tracking-wide font-roboto"
              >
                {!sidebarCollapsed && item.label}
              </ActiveNavLink>
            ))}
          </nav>

          {/* Enhanced Footer Section */}
          <div className="mt-auto border-t border-violet-500/30">
            {/* Logout Button */}
            {!sidebarCollapsed && (
              <div className="p-4">
                <LogoutButton variant="button" />
              </div>
            )}

            {/* Divider Line */}
            {!sidebarCollapsed && (
              <div className="px-4">
                <div className="border-t border-violet-400/40"></div>
              </div>
            )}

            {/* Enhanced Company Footer */}
            {!sidebarCollapsed && (
              <div className="px-4 py-4">
                <p className="text-xs text-violet-100/90 dark:text-violet-200/90 text-center font-bold tracking-wide font-roboto">
                  © All rights reserved to
                </p>
                <p className="text-xs text-white font-black text-center tracking-wider mt-1 font-roboto">
                  Primex Vanguard
                </p>
              </div>
            )}

            {/* Collapsed User Avatar */}
            {sidebarCollapsed && (
              <div className="p-4 flex justify-center">
                <Avatar className="h-10 w-10 border-2 border-violet-300/60 hover:border-violet-200 transition-all duration-200 hover:scale-105">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="text-sm bg-violet-500 text-white font-bold font-roboto">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>

      </aside>

      {/* Sidebar Toggle Button - Outside sidebar */}
      {sidebarCollapsed && (
        <div 
          onClick={() => setSidebarCollapsed(false)}
          className="fixed left-28 top-8 h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center cursor-pointer transition-all duration-200 hover:from-violet-400 hover:to-violet-600 shadow-lg hover:shadow-xl transform hover:scale-105 z-40"
        >
          <Bars3Icon className="h-6 w-6 text-white" />
        </div>
      )}

      {/* Enhanced Mobile sidebar overlay */}
      <div className={`md:hidden fixed inset-0 z-40 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-gradient-to-b from-violet-600 to-violet-700 rounded-r-2xl shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-violet-500/30">
            <Link href={isSuperAdmin ? "/super-admin" : "/dashboard"} className="flex items-center">
              <DashboardBrand />
            </Link>
            <Button onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:bg-violet-500">
              <XMarkIcon className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
          <nav className="flex-1 space-y-2 px-3 py-6">
            {navItems.map((item) => (
              <ActiveNavLink
                key={item.path}
                href={item.path}
                iconName={item.iconName}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-bold text-white hover:text-white text-sm tracking-wide font-roboto"
              >
                {item.label}
              </ActiveNavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content area - Fixed scroll issue */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'md:ml-28' : 'md:ml-72'
      }`}>
        {/* Simple Scrollable Header */}
        <header className="relative top-0 z-20 transition-all duration-300 ease-in-out">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-600 dark:text-violet-600 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-5 w-5" />
            </Button>

            {/* Desktop spacer */}
            <div className="hidden md:block flex-1"></div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <div className="[&_button]:text-violet-600 [&_button]:dark:text-violet-600 [&_button:hover]:bg-violet-100 [&_button:hover]:dark:bg-violet-900/30">
            <NotificationsPopover />
              </div>
              <div className="[&_button]:text-violet-600 [&_button]:dark:text-violet-600 [&_button:hover]:bg-violet-100 [&_button:hover]:dark:bg-violet-900/30">
            <ThemeToggleButton />
              </div>
            
              {/* User Profile Section */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-violet-100 dark:hover:bg-violet-900/30 p-2 rounded-xl transition-all duration-200">
                    <Avatar className="h-7 w-7 border border-violet-200 dark:border-violet-700">
                    <AvatarImage src="" alt={userName} />
                      <AvatarFallback className="text-xs bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 font-bold font-roboto">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                    <span className="text-sm font-bold text-violet-600 dark:text-violet-600 hidden sm:block tracking-wide font-roboto">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-9 w-9 border border-violet-200 dark:border-violet-700">
                    <AvatarImage src="" alt={userName} />
                      <AvatarFallback className="text-sm bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 font-bold font-roboto">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none font-roboto">{userName}</p>
                      <p className="text-xs leading-none text-gray-500 dark:text-gray-400 font-roboto">{userEmail}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Link href="/profile" className="flex w-full items-center font-bold font-roboto">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href="/settings" className="flex w-full items-center font-bold font-roboto">
                    <Cog6ToothIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogoutButton className="flex w-full items-center font-bold font-roboto text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" />
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content without top padding since header scrolls */}
        <main className="min-h-screen pb-8 px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 