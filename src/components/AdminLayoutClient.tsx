'use client'

import Link from 'next/link'
import { 
  UserIcon, 
  Cog6ToothIcon, 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  Bars3Icon 
} from '@heroicons/react/24/solid'
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

// Enhanced violet-themed logo component with better typography
const DashboardBrand = ({ collapsed = false }: { collapsed?: boolean }) => (
  <div className="flex items-center space-x-3 group">
    <div className="relative">
      <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:from-violet-400 group-hover:to-violet-600 shadow-lg hover:shadow-xl transform group-hover:scale-105">
        <span className="text-white font-black text-xl tracking-tight font-geist">P</span>
      </div>
    </div>
    {!collapsed && (
      <div className="transition-all duration-300">
        <span className="text-xl font-black text-white tracking-tight group-hover:text-violet-100 transition-colors duration-300 font-geist">
          PXV Pay
        </span>
        <div className="text-xs text-violet-200 font-bold opacity-75 group-hover:opacity-100 transition-opacity duration-300 font-geist tracking-wide">
          Payment Platform
        </div>
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
  { label: 'Theme Customization', path: '/theme', iconName: 'Palette' },
  { label: 'Product Management', path: '/content', iconName: 'Package' },
  { label: 'Payment Verification', path: '/verification', iconName: 'Shield' },
]

// Super admin only items
const superAdminItems = [
  { label: 'Super Admin Dashboard', path: '/super-admin', iconName: 'Crown' },
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8 rounded-lg hover:bg-violet-500/50 text-white hover:text-white transition-all duration-200 hover:scale-105"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
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
                className="font-bold text-white hover:text-white text-sm tracking-wide font-geist"
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
                <p className="text-xs text-violet-100/90 dark:text-violet-200/90 text-center font-bold tracking-wide font-geist">
                  © All rights reserved to
                </p>
                <p className="text-xs text-white font-black text-center tracking-wider mt-1 font-geist">
                  Primex Vanguard
                </p>
              </div>
            )}

            {/* Collapsed User Avatar */}
            {sidebarCollapsed && (
              <div className="p-4 flex justify-center">
                <Avatar className="h-10 w-10 border-2 border-violet-300/60 hover:border-violet-200 transition-all duration-200 hover:scale-105">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="text-sm bg-violet-500 text-white font-bold font-geist">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Collapse/Expand Button Extension */}
        {sidebarCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(false)}
            className="absolute -right-3 top-10 h-7 w-7 rounded-full bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white shadow-xl border-2 border-white dark:border-gray-800 z-40 transition-all duration-200 hover:scale-110 animate-pulse hover:animate-none"
          >
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Button>
        )}
      </aside>

      {/* Enhanced Mobile sidebar overlay */}
      <div className={`md:hidden fixed inset-0 z-40 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-gradient-to-b from-violet-600 to-violet-700 rounded-r-2xl shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-violet-500/30">
            <Link href={isSuperAdmin ? "/super-admin" : "/dashboard"} className="flex items-center">
              <DashboardBrand />
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:bg-violet-500">
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
                className="font-bold text-white hover:text-white text-sm tracking-wide font-geist"
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
        {/* Enhanced Fixed Header */}
        <header className="fixed top-4 right-4 z-20">
          <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-violet-700 dark:from-violet-700 dark:to-violet-800 rounded-2xl shadow-2xl px-4 py-3 border border-violet-500/20">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 rounded-lg hover:bg-violet-500/50 text-white transition-all duration-200 hover:scale-105"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-5 w-5" />
            </Button>

            <NotificationsPopover />
            <ThemeToggleButton />
            
            {/* Enhanced User Profile Section */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-violet-500/50 text-white p-2 rounded-xl transition-all duration-200 hover:scale-105">
                  <Avatar className="h-7 w-7 border-2 border-violet-300/60 hover:border-violet-200 transition-all duration-200">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="text-xs bg-violet-500 text-white font-bold font-geist">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-bold text-white hidden sm:block tracking-wide font-geist">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-9 w-9 border border-violet-200 dark:border-violet-700">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="text-sm bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 font-bold font-geist">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none font-geist">{userName}</p>
                    <p className="text-xs leading-none text-gray-500 dark:text-gray-400 font-geist">{userEmail}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile" className="flex w-full items-center font-bold font-geist">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings" className="flex w-full items-center font-bold font-geist">
                    <Cog6ToothIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Fixed Main content - Single scroll */}
        <main className="min-h-screen pt-24 pb-8 px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 