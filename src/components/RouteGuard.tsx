'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/spinner'

/**
 * RouteGuard - A simple component to handle role-based routing
 * Include this at the top level of your layout for protected routes
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true)
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        // Handle unauthenticated users
        if (!session) {
          console.log('No session, redirecting to signin')
          router.push('/signin')
          return
        }
        
        // Get user email from session
        const userEmail = session.user.email || ''
        
        // Simple super admin check based on email
        const isSuperAdmin = 
          userEmail === 'dev-admin@pxvpay.com' || 
          userEmail === 'superadmin@pxvpay.com'
        
        // Redirect logic
        const path = pathname || ''
        const isAuthRoute = ['/signin', '/signup', '/reset-password'].includes(path)
        const isSuperAdminRoute = path.startsWith('/super-admin') || path.startsWith('/blog-management')
        const isDashboardRoute = path.startsWith('/dashboard')
        
        // Authenticated users shouldn't be on auth routes
        if (isAuthRoute) {
          if (isSuperAdmin) {
            router.push('/super-admin')
          } else {
            router.push('/dashboard')
          }
          return
        }
        
        // Protect super admin routes
        if (isSuperAdminRoute && !isSuperAdmin) {
          console.log('Not a super admin, redirecting to dashboard')
          router.push('/dashboard')
          return
        }
        
        // Redirect super admins on dashboard to super admin dashboard
        if (isDashboardRoute && pathname === '/dashboard' && isSuperAdmin) {
          console.log('Super admin on dashboard, redirecting to super-admin')
          router.push('/super-admin')
          return
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [pathname, router, supabase.auth])
  
  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }
  
  return <>{children}</>
} 