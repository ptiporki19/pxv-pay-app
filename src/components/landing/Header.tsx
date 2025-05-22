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
import { Menu } from 'lucide-react'

// Placeholder for a monochrome logo or text brand
const Brand = () => (
  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">PXV Pay</span>
)

const routes = [
  { name: 'Home', path: '/' },
  { 
    name: 'Features', 
    path: '/features',
    submenu: [
      { name: 'Payment Methods', path: '/features/payment-methods' },
      { name: 'Global Coverage', path: '/features/global-coverage' },
      { name: 'Security', path: '/features/security' },
      { name: 'Customization', path: '/features/customization' },
    ]
  },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' },
]

const Header = () => {
  const pathname = usePathname()
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
      'fixed top-0 w-full z-50 transition-all duration-300 border-b',
      scrolled 
        ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md border-gray-200 dark:border-gray-800 py-3'
        : 'bg-transparent border-transparent py-5'
    )}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Brand />
        </Link>
          
        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {routes.map((route) => {
              if (route.submenu) {
                return (
                  <NavigationMenuItem key={route.path}>
                    <NavigationMenuTrigger>{route.name}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {route.submenu.map((item) => (
                          <li key={item.path}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={item.path}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100"
                              >
                                <div className="text-sm font-medium leading-none">{item.name}</div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )
              }
              
              return (
                <NavigationMenuItem key={route.path}>
                  <Link href={route.path} legacyBehavior passHref>
                    <NavigationMenuLink 
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'data-[active]:bg-gray-100 data-[active]:dark:bg-gray-800 data-[active]:text-gray-900 data-[active]:dark:text-gray-100'
                      )}
                      active={pathname === route.path}
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
          <Link href="/signin">
            <Button variant="ghost" className="rounded">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded">Get Started</Button>
          </Link>
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle mobile menu</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 shadow-md">
          <nav className="px-4 py-4 space-y-2">
            {routes.map((route) => (
              route.submenu ? (
                // Simplified mobile view for submenu - could be expanded into an accordion if needed
                <div key={route.path}>
                  <Link href={route.path} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">
                    {route.name}
                  </Link>
                  <ul className="ml-4 mt-2 space-y-1">
                    {route.submenu.map((item) => (
                      <li key={item.path}>
                        <Link href={item.path} className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Link
                  key={route.path}
                  href={route.path}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {route.name}
                </Link>
              )
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header 