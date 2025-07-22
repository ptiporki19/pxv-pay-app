"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  UserIcon,
  Cog6ToothIcon,
  Bars3Icon,
  ShieldCheckIcon
} from "@heroicons/react/24/solid"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationsPopover } from "@/components/NotificationsPopover"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import { MobileSidebar } from "./MobileSidebar"

// Mobile Logo component - using the same working logo as desktop
const MobileLogo = () => (
  <div className="flex items-center space-x-2 group">
    <div className="relative">
      <img
        src="/logo.svg"
        alt="Company Logo"
        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 transition-all duration-300 group-hover:scale-105"
      />
    </div>
    <div className="transition-all duration-300">
      <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight group-hover:text-violet-600 transition-colors duration-300">
        PXV Pay
      </span>
    </div>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()

  // Close all other menus when one opens
  const handleMenuToggle = (menuType: 'user' | 'sidebar') => {
    if (menuType === 'user') {
      setIsSidebarOpen(false)
      setIsUserMenuOpen(!isUserMenuOpen)
    } else if (menuType === 'sidebar') {
      setIsUserMenuOpen(false)
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-background">
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
            {/* Desktop Notifications Component */}
            <div className="[&_button]:text-muted-foreground [&_button:hover]:bg-muted [&_button]:h-8 [&_button]:w-8">
              <NotificationsPopover />
            </div>
            
            {/* Desktop Theme Toggle Component */}
            <div className="[&_button]:text-muted-foreground [&_button:hover]:bg-muted [&_button]:h-8 [&_button]:w-8">
              <ThemeToggleButton />
            </div>

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