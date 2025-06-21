'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { ThemeToggleButton } from '@/components/theme-toggle-button'

// Elegant violet-themed logo
const Brand = () => (
  <div className="flex items-center space-x-3 group">
    <div className="relative">
      <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-violet-700 shadow-lg">
        <span className="text-white font-bold text-xl">P</span>
      </div>
    </div>
    <span className="text-2xl font-bold text-black dark:text-white tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">PXV Pay</span>
  </div>
)

const routes = [
  { name: 'Home', path: '/' },
  { 
    name: 'Features', 
    path: '/features',
    submenu: [
      { 
        name: 'Payment Methods', 
        path: '/features/payment-methods',
        description: 'Configure your payment processing options'
      },
      { 
        name: 'Global Coverage', 
        path: '/features/global-coverage',
        description: 'Reach customers in 180+ countries'
      },
      { 
        name: 'Security', 
        path: '/features/security',
        description: 'Instant payment verification and proof'
      },
      { 
        name: 'Customization', 
        path: '/features/customization',
        description: 'Sell products with custom checkout flows'
      },
    ]
  },
  { name: 'Blog', path: '/blog' },
]

const Header = () => {
  const pathname = usePathname() || ''
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <header className="bg-violet-50 dark:bg-violet-950/30 relative z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center transition-opacity duration-300 hover:opacity-80">
            <Brand />
          </Link>
            
          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="space-x-1">
              {routes.map((route) => {
                if (route.submenu) {
                  return (
                    <NavigationMenuItem key={route.path}>
                      <NavigationMenuTrigger className={cn(
                        "bg-transparent hover:bg-violet-50 dark:hover:bg-violet-950/30 text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 font-medium px-4 py-2 rounded-xl",
                        pathname.startsWith(route.path) && "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
                      )}>
                        {route.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[500px] p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
                          {route.submenu.map((item) => (
                            <NavigationMenuLink key={item.path} asChild>
                              <Link
                                href={item.path}
                                className="block p-4 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors duration-200 group"
                              >
                                <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 mb-1">
                                  {item.name}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )
                }
                
                return (
                  <NavigationMenuItem key={route.path}>
                    <Link href={route.path} legacyBehavior passHref>
                      <NavigationMenuLink 
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400",
                          (pathname === route.path || (route.path === '/blog' && pathname.startsWith('/blog'))) && 
                          "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
                        )}
                      >
                        {route.name}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )
              })}
            </NavigationMenuList>
          </NavigationMenu>
            
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex">
              <ThemeToggleButton />
            </div>
            <Link href="/signin" className="hidden sm:block">
              <Button variant="ghost" className="font-medium text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-300 rounded-xl">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="hidden sm:block">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 transition-all duration-300 hover:shadow-lg border-0 rounded-xl">
                Get Started
              </Button>
            </Link>
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden hover:bg-violet-50 dark:hover:bg-violet-950/30 text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 rounded-xl" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle mobile menu</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-violet-50 dark:bg-violet-950/30">
          <nav className="px-4 py-4 space-y-3">
            {routes.map((route) => (
              route.submenu ? (
                <div key={route.path} className="space-y-2">
                  <div className="text-lg font-semibold text-black dark:text-white px-4 py-2">
                    {route.name}
                  </div>
                  <div className="ml-4 space-y-1">
                    {route.submenu.map((item) => (
                      <Link 
                        key={item.path} 
                        href={item.path} 
                        className={cn(
                          "block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300",
                          pathname === item.path && "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link 
                  key={route.path} 
                  href={route.path} 
                  className={cn(
                    "block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 font-medium",
                    (pathname === route.path || (route.path === '/blog' && pathname.startsWith('/blog'))) && 
                    "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {route.name}
                </Link>
              )
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 space-y-2">
              <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start font-medium text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-300 rounded-xl">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium transition-all duration-300 border-0 rounded-xl">
                  Get Started
                </Button>
              </Link>
              <div className="pt-2">
                <ThemeToggleButton />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header 