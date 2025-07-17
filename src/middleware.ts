import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Enhanced mobile device detection
function isMobileDevice(userAgent: string): boolean {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|phone|tablet/i.test(userAgent)
}

// Check if viewport width indicates mobile screen
function isSmallViewport(request: NextRequest): boolean {
  const viewportWidth = request.headers.get('sec-ch-viewport-width')
  if (viewportWidth) {
    return parseInt(viewportWidth) <= 768
  }
  
  // Fallback: check user-agent for mobile indicators
  const userAgent = request.headers.get('user-agent') || ''
  return isMobileDevice(userAgent)
}

// This middleware handles mobile redirects and minimal auth checks
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const path = request.nextUrl.pathname
  const url = request.nextUrl.clone()
  
  // Skip middleware for static assets and API routes
  if (
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path.startsWith('/favicon.ico') ||
    path.startsWith('/api/')
  ) {
    return response
  }

  // Enhanced mobile detection
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = isMobileDevice(userAgent) || isSmallViewport(request)
  
  // Handle mobile redirects
  if (isMobile && !path.startsWith('/m/')) {
    // Skip redirects for auth pages and landing page
    if (path === '/' || 
        path.startsWith('/auth/') ||
        path.startsWith('/signin') ||
        path.startsWith('/signup') ||
        path.startsWith('/forgot-password') ||
        path.startsWith('/reset-password')) {
      // Allow these pages to work on mobile without redirect
    } else {
      // Map desktop admin routes to mobile routes (remove redundant /admin)
      let mobilePath = ''
      
      if (path.startsWith('/admin/checkout-links')) {
        mobilePath = path.replace('/admin/checkout-links', '/m/checkout-links')
      } else if (path.startsWith('/admin/payment-methods')) {
        mobilePath = path.replace('/admin/payment-methods', '/m/payment-methods')
      } else if (path.startsWith('/admin/transactions')) {
        mobilePath = path.replace('/admin/transactions', '/m/transactions')
      } else if (path.startsWith('/admin/users')) {
        mobilePath = path.replace('/admin/users', '/m/users')
      } else if (path.startsWith('/admin/products')) {
        mobilePath = path.replace('/admin/products', '/m/products')
      } else if (path.startsWith('/admin/brands')) {
        mobilePath = path.replace('/admin/brands', '/m/brands')
      } else if (path.startsWith('/admin/dashboard')) {
        mobilePath = path.replace('/admin/dashboard', '/m/dashboard')
      } else if (path.startsWith('/admin/settings')) {
        mobilePath = path.replace('/admin/settings', '/m/settings')
      } else if (path.startsWith('/admin/profile')) {
        mobilePath = path.replace('/admin/profile', '/m/profile')
      } else if (path.startsWith('/admin')) {
        // Generic admin route
        mobilePath = path.replace('/admin', '/m')
      } else if (path.startsWith('/checkout-links')) {
        mobilePath = `/m${path}`
      } else if (path.startsWith('/payment-methods')) {
        mobilePath = `/m${path}`
      } else if (path.startsWith('/c/')) {
        // Customer checkout pages - keep as is for now
        mobilePath = path
      } else {
        // For other routes, add /m prefix
        mobilePath = `/m${path}`
      }
      
      if (mobilePath && mobilePath !== path) {
        url.pathname = mobilePath
        return NextResponse.redirect(url)
      }
    }
  }
  
  // Redirect desktop users away from mobile routes
  if (!isMobile && path.startsWith('/m/')) {
    // Map mobile routes back to desktop admin routes
    let desktopPath = ''
    
    if (path.startsWith('/m/checkout-links')) {
      desktopPath = path.replace('/m/checkout-links', '/admin/checkout-links')
    } else if (path.startsWith('/m/payment-methods')) {
      desktopPath = path.replace('/m/payment-methods', '/admin/payment-methods')
    } else if (path.startsWith('/m/transactions')) {
      desktopPath = path.replace('/m/transactions', '/admin/transactions')
    } else if (path.startsWith('/m/users')) {
      desktopPath = path.replace('/m/users', '/admin/users')
    } else if (path.startsWith('/m/products')) {
      desktopPath = path.replace('/m/products', '/admin/products')
    } else if (path.startsWith('/m/brands')) {
      desktopPath = path.replace('/m/brands', '/admin/brands')
    } else if (path.startsWith('/m/dashboard')) {
      desktopPath = path.replace('/m/dashboard', '/admin/dashboard')
    } else if (path.startsWith('/m/settings')) {
      desktopPath = path.replace('/m/settings', '/admin/settings')
    } else if (path.startsWith('/m/profile')) {
      desktopPath = path.replace('/m/profile', '/admin/profile')
    } else {
      // Generic mobile route
      desktopPath = path.replace('/m', '/admin')
    }
    
    if (desktopPath && desktopPath !== path) {
      url.pathname = desktopPath
      return NextResponse.redirect(url)
    }
  }

  try {
    // API auth checks remain the same
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
      
      // Public endpoints that don't require authentication
      const publicPaths = [
        '/api/public/',
        '/api/checkout/',
        '/api/users/',
        '/api/blog/',
        '/api/auth/signout'
      ]
      
      const isPublicPath = publicPaths.some(publicPath => path.startsWith(publicPath)) || path === '/api/auth/signout'
      
      // If no session and not a public path, deny access
      if (!session && !isPublicPath) {
        return NextResponse.json(
          { error: 'Authentication required' },
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 