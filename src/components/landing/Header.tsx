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
import { Menu, ArrowRight, Sparkles } from 'lucide-react'
import { ThemeToggleButton } from '@/components/theme-toggle-button'

// Elegant violet-themed logo
const Brand = () => (
  <div className="flex items-center space-x-3 group">
    <div className="relative">
      <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-violet-700 to-violet-800 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-violet-500/30 group-hover:shadow-xl group-hover:shadow-violet-500/50">
        <span className="text-white font-bold text-xl">P</span>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 to-violet-600 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
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
        description: 'Accept payments globally with local methods'
      },
      { 
        name: 'Global Coverage', 
        path: '/features/global-coverage',
        description: 'Reach customers in 180+ countries'
      },
      { 
        name: 'Security', 
        path: '/features/security',
        description: 'Bank-grade security for all transactions'
      },
      { 
        name: 'Customization', 
        path: '/features/customization',
        description: 'Tailor the experience to your brand'
      },
    ]
  },
  { name: 'Blog', path: '/blog' },
]

const Header = () => {
  const pathname = usePathname() || ''
  const [scrolled, setScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={cn(
      'fixed top-0 w-full z-50 transition-all duration-700 ease-out',
      scrolled 
        ? 'py-2' 
        : 'py-4'
    )}>
      <div className="container mx-auto px-6">
        <div className={cn(
          'transition-all duration-700 ease-out rounded-2xl border backdrop-blur-xl',
          scrolled 
            ? 'bg-white/80 dark:bg-black/80 shadow-xl shadow-violet-500/10 border-violet-100/30 dark:border-violet-900/30 py-3' 
            : 'bg-white/60 dark:bg-black/60 shadow-lg shadow-violet-500/5 border-violet-100/20 dark:border-violet-900/20 py-4'
        )}>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center transition-opacity duration-300 hover:opacity-80 relative z-10">
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
              <ThemeToggleButton />
              <Link href="/signin">
                <Button variant="ghost" className="font-medium text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-300 rounded-xl">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="relative bg-gradient-to-r from-violet-600 via-violet-700 to-violet-800 hover:from-violet-700 hover:via-violet-800 hover:to-violet-900 text-white font-medium px-6 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/40 border-0 rounded-xl overflow-hidden group">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Button>
              </Link>
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden hover:bg-violet-50 dark:hover:bg-violet-950/30 text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 rounded-xl" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle mobile menu</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-6 right-6 mt-2">
          <div className="bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-2xl shadow-violet-500/20 border border-violet-100/30 dark:border-violet-900/30 rounded-2xl animate-in slide-in-from-top-2 duration-300">
            <nav className="px-6 py-6 space-y-4">
              {routes.map((route) => (
                route.submenu ? (
                  <div key={route.path} className="space-y-3">
                    <div className="text-lg font-semibold text-black dark:text-white">
                      {route.name}
                    </div>
                    <div className="ml-4 space-y-2">
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
                      "block px-4 py-3 rounded-xl text-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300",
                      (pathname === route.path || (route.path === '/blog' && pathname.startsWith('/blog'))) && 
                      "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {route.name}
                  </Link>
                )
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header 