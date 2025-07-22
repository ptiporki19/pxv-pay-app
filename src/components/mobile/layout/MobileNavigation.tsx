"use client"

import { useRouter, usePathname } from "next/navigation"
import { Home, Link2, Package, CreditCard, Building2, Shield } from "lucide-react"

export function MobileNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { 
      icon: Home, 
      label: "Home", 
      id: "dashboard",
      path: "/m/admin/dashboard"
    },
    {
      icon: Link2,
      label: "Links",
      id: "checkout-links",
      path: "/m/admin/checkout-links"
    },
    {
      icon: Package,
      label: "Products",
      id: "content",
      path: "/m/admin/content"
    },
    {
      icon: CreditCard,
      label: "Methods",
      id: "payment-methods",
      path: "/m/admin/payment-methods"
    },
    {
      icon: Building2,
      label: "Brands",
      id: "theme",
      path: "/m/admin/theme"
    },
    {
      icon: Shield,
      label: "Verify",
      id: "verification",
      path: "/m/admin/verification"
    },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-background z-20">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path)
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                isActive
                  ? "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="size-4 mb-1" />
              <span className="text-xs font-normal font-roboto">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
} 
 