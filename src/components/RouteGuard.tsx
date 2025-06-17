'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    let isMounted = true

    async function checkAuth() {
      try {
        const supabase = createClient()
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          // No session - redirect to signin
          if (isMounted && pathname !== '/signin' && pathname !== '/signup') {
            router.push('/signin')
            return
          }
        } else {
          // Has session - check role and route accordingly
          const userEmail = session.user.email || ''
          
          // Get user profile from DB with better error handling
          let userProfile = null
          try {
            const { data, error: profileError } = await supabase
              .from('users')
              .select('role')
              .eq('email', session.user.email)
              .single()
            
            if (profileError) {
              console.warn('Profile fetch error:', profileError.message)
            } else {
              userProfile = data
            }
          } catch (error) {
            console.warn('Profile fetch failed:', error)
          }
          
          // Check super admin based ONLY on database role (no email checking)
          const isSuperAdmin = userProfile?.role === 'super_admin'
          
          console.log('RouteGuard - User Role Check:', {
            userEmail: session.user.email,
            userId: session.user.id,
            databaseRole: userProfile?.role,
            isSuperAdmin,
            currentPath: pathname
          })
          
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

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <>{children}</>
} 