"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  BellIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  Cog6ToothIcon,
  Bars3Icon,
  ShieldCheckIcon
} from "@heroicons/react/24/solid"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MobileNotifications } from "@/components/mobile/ui/MobileNotifications"
import { MobileSidebar } from "./MobileSidebar"

// Logo component for mobile
const MobileLogo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
      <span className="text-white font-bold text-sm">P</span>
    </div>
    <span className="text-lg font-bold text-foreground">PXV Pay</span>
  </div>
)

interface User {
  id: string
  email: string
  role: string
  active: boolean
  first_name?: string
  last_name?: string
}

interface MobileHeaderProps {
  showNotifications?: boolean
  setShowNotifications?: (show: boolean) => void
}

export function MobileHeader({ 
  showNotifications: propsShowNotifications, 
  setShowNotifications: propsSetShowNotifications 
}: MobileHeaderProps = {}) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  // Close all other menus when one opens
  const handleMenuToggle = (menuType: 'user' | 'notifications' | 'theme' | 'sidebar') => {
    if (menuType === 'user') {
      setIsNotificationsOpen(false)
      setIsThemeMenuOpen(false)
      setIsSidebarOpen(false)
      setIsUserMenuOpen(!isUserMenuOpen)
    } else if (menuType === 'notifications') {
      setIsUserMenuOpen(false)
      setIsThemeMenuOpen(false)
      setIsSidebarOpen(false)
      setIsNotificationsOpen(!isNotificationsOpen)
    } else if (menuType === 'theme') {
      setIsUserMenuOpen(false)
      setIsNotificationsOpen(false)
      setIsSidebarOpen(false)
      setIsThemeMenuOpen(!isThemeMenuOpen)
    } else if (menuType === 'sidebar') {
      setIsUserMenuOpen(false)
      setIsNotificationsOpen(false)
      setIsThemeMenuOpen(false)
      setIsSidebarOpen(!isSidebarOpen)
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser || !authUser.email) {
          setIsLoading(false)
          return
        }

        // Get the database user details
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('id, email, role, active')
          .eq('email', authUser.email)
          .single()

        if (error) {
          console.error('Error fetching user:', error)
          setIsLoading(false)
          return
        }

        setUser(dbUser as User)
      } catch (error) {
        console.error('Error in fetchUser:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return user?.email || 'User'
  }

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  const getRoleIcon = () => {
    if (user?.role === 'super_admin') {
      return <ShieldCheckIcon className="size-3 text-violet-600" />
    }
    return <UserIcon className="size-3 text-gray-600" />
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMenuToggle('sidebar')}
              className="h-8 w-8 p-0"
            >
              <Bars3Icon className="size-4" />
            </Button>
            
            {/* Logo */}
            <MobileLogo />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMenuToggle('notifications')}
                className="h-8 w-8 p-0 relative"
              >
                <BellIcon className="size-4" />
                {/* Notification dot placeholder */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </Button>
              
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-1 z-50">
                  <MobileNotifications />
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <DropdownMenu 
              open={isThemeMenuOpen} 
              onOpenChange={(open) => {
                if (!open) setIsThemeMenuOpen(false)
                else handleMenuToggle('theme')
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {theme === 'dark' ? (
                    <MoonIcon className="size-4" />
                  ) : (
                    <SunIcon className="size-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem 
                  onClick={() => {
                    setTheme("light")
                    setIsThemeMenuOpen(false)
                  }} 
                  className="text-xs"
                >
                  <SunIcon className="mr-2 size-3" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setTheme("dark")
                    setIsThemeMenuOpen(false)
                  }} 
                  className="text-xs"
                >
                  <MoonIcon className="mr-2 size-3" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setTheme("system")
                    setIsThemeMenuOpen(false)
                  }} 
                  className="text-xs"
                >
                  <Cog6ToothIcon className="mr-2 size-3" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu - Only Profile & Settings */}
            <DropdownMenu 
              open={isUserMenuOpen} 
              onOpenChange={(open) => {
                if (!open) setIsUserMenuOpen(false)
                else handleMenuToggle('user')
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <div className="w-7 h-7 bg-violet-100 dark:bg-violet-950 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                      {getUserInitials()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b">
                  <div className="flex items-center gap-2">
                    {getRoleIcon()}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{getUserDisplayName()}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <DropdownMenuItem
                  onClick={() => {
                    router.push('/m/profile')
                    setIsUserMenuOpen(false)
                  }}
                  className="text-xs"
                >
                  <UserIcon className="mr-2 size-3" />
                  Profile
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => {
                    router.push('/m/settings')
                    setIsUserMenuOpen(false)
                  }}
                  className="text-xs"
                >
                  <Cog6ToothIcon className="mr-2 size-3" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </>
  )
} 