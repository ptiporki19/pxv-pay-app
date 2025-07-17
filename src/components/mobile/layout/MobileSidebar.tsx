"use client"

import { useRouter, usePathname } from "next/navigation"
import { 
  HomeIcon, 
  LinkIcon, 
  CubeIcon, 
  CreditCardIcon, 
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon
} from "@heroicons/react/24/solid"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

// Navigation items for the sidebar
const navigationItems = [
  { href: "/m/dashboard", icon: HomeIcon, label: "Dashboard" },
  { href: "/m/checkout-links", icon: LinkIcon, label: "Checkout Links" },
  { href: "/m/payment-methods", icon: CreditCardIcon, label: "Payment Methods" },
  { href: "/m/products", icon: CubeIcon, label: "Products" },
  { href: "/m/brands", icon: BuildingStorefrontIcon, label: "Brands" },
  { href: "/m/verification", icon: ShieldCheckIcon, label: "Payment Verification" },
]

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Signed out successfully",
        description: "You have been logged out"
      })
      
      router.push('/signin')
      onClose()
    } catch (error) {
      console.error('Sign out error:', error)
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      })
    }
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-lg font-bold text-foreground">PXV Pay</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <XMarkIcon className="size-4" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left",
                    isActive 
                      ? "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4 flex-shrink-0" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sign Out */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <ArrowRightOnRectangleIcon className="size-4 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  )
} 