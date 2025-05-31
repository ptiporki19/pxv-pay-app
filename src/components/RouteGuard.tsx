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
  const [isLoading, setIsLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function checkAuth() {
      try {
        const supabase = createClient()
        
        // Get current session with better error handling
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        // Handle auth errors gracefully
        if (sessionError) {
          console.warn('Session error, redirecting to signin:', sessionError.message)
          if (isMounted && pathname !== '/signin' && pathname !== '/signup') {
            router.push('/signin')
          }
          return
        }
        
        if (!session) {
          // No session - redirect to signin
          if (isMounted && pathname !== '/signin' && pathname !== '/signup') {
            router.push('/signin')
            return
          }
        } else {
          // Has session - check role and route accordingly
          const userEmail = session.user.email || ''
          
          // Quick check - if email matches super admin, handle immediately
          const isSuperAdminEmail = userEmail === 'admin@pxvpay.com' || 
                                   userEmail === 'dev-admin@pxvpay.com' || 
                                   userEmail === 'superadmin@pxvpay.com'
          
          // Get user profile from DB with better error handling
          let userProfile = null
          try {
            const { data, error: profileError } = await supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .single()
            
            if (profileError) {
              console.warn('Profile fetch error:', profileError.message)
            } else {
              userProfile = data
            }
          } catch (error) {
            console.warn('Profile fetch failed:', error)
          }
          
          const isSuperAdminRole = userProfile?.role === 'super_admin'
          const isSuperAdmin = isSuperAdminRole || isSuperAdminEmail
          
          // Redirect logic
          const path = pathname || ''
          const isAuthRoute = ['/signin', '/signup', '/reset-password'].includes(path)
          const isSuperAdminRoute = path.startsWith('/super-admin') || 
                                   path.startsWith('/blog-management') ||
                                   path.startsWith('/users') ||
                                   path.startsWith('/audit-logs')
          const isDashboardRoute = path.startsWith('/dashboard')
          
          // Only execute redirects if component is still mounted
          if (!isMounted) return
          
          // Authenticated users shouldn't be on auth routes
          if (isAuthRoute) {
            if (isSuperAdmin) {
              console.log('Super admin on auth route, redirecting to super-admin')
              router.replace('/super-admin')
            } else {
              console.log('Regular user on auth route, redirecting to dashboard')
              router.replace('/dashboard')
            }
            return
          }
          
          // Protect super admin routes
          if (isSuperAdminRoute && !isSuperAdmin) {
            console.log('Non-super admin trying to access super admin route, redirecting to dashboard')
            router.replace('/dashboard')
            return
          }
          
          // Redirect super admins on dashboard to super admin dashboard (immediate replacement)
          if (path === '/dashboard' && isSuperAdmin) {
            console.log('Super admin on regular dashboard, redirecting to super-admin')
            router.replace('/super-admin')
            return
          }
          
          // Redirect regular users from root to dashboard
          if (path === '/' && session && !isSuperAdmin) {
            router.replace('/dashboard')
            return
          }
          
          // Redirect super admins from root to super admin dashboard
          if (path === '/' && session && isSuperAdmin) {
            router.replace('/super-admin')
            return
          }
        }
        
        if (isMounted) {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (isMounted) {
          setIsLoading(false)
          // If there's a critical auth error, redirect to signin
          if (pathname !== '/signin' && pathname !== '/signup') {
            router.push('/signin')
          }
        }
      }
    }

    checkAuth()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [pathname, router])

  // Show spinner while loading or redirecting
  if (isLoading || shouldRedirect) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 