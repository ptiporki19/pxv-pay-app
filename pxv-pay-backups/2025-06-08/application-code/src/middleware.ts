import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// This middleware handles minimal redirects
// The client-side RouteGuard component handles role-based redirects
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const path = request.nextUrl.pathname
  
  // Skip middleware for static assets
  if (
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path.startsWith('/favicon.ico')
  ) {
    return response
  }

  try {
    // Check if unauthenticated user is trying to access API
    if (path.startsWith('/api/') && path !== '/api/auth/signout') {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      
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
                ...options,
              })
            },
            remove(name, options) {
              response.cookies.set({
                name,
                value: '',
                ...options,
              })
            },
          },
        }
      )

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && !path.startsWith('/api/public/') && !path.startsWith('/api/checkout/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // If there's an error, proceed without auth checks but log it
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 