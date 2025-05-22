import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// This middleware will handle redirects based on authentication status
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check if Supabase env vars are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // If env vars are not configured, proceed without auth checks during development
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found. Auth will not be checked.')
    return response
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            response.cookies.set({ 
              name, 
              value, 
              ...options 
            })
          },
          remove(name, options) {
            response.cookies.set({ 
              name, 
              value: '', 
              ...options 
            })
          },
        },
      }
    )

    // Check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession()

    // Define protected routes
    const adminRoutes = ['/dashboard', '/countries', '/currencies', '/payment-methods', 
                         '/payment-link', '/theme', '/content', '/verification', '/users', '/audit-logs']
    const authRoutes = ['/signin', '/signup', '/verification-sent']

    // Get the path from the request URL
    const path = request.nextUrl.pathname

    // Check if the path is protected
    const isAdminRoute = adminRoutes.some(route => path.startsWith(route) || path === route)
    const isAuthRoute = authRoutes.some(route => path.startsWith(route) || path === route)

    // If the user is not authenticated and tries to access a protected route, redirect to signin
    if (!session && isAdminRoute) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }

    // If the user is authenticated and tries to access auth routes, redirect to dashboard
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect merchants to dashboard
    if (session && !isAuthRoute && path === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (error) {
    console.error('Middleware error:', error)
  }

  return response
}

// Configure which routes the middleware applies to
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/|images/).*)',
  ],
} 