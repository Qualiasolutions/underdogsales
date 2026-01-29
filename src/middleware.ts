import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that require authentication
const protectedRoutes = ['/practice', '/coach', '/chat', '/dashboard', '/analyze', '/settings', '/curriculum', '/admin']

// Routes that should redirect to dashboard if already logged in
const authRoutes = ['/login', '/signup']

/**
 * Middleware for auth protection and request tracking
 * - Checks authentication for protected routes
 * - Redirects logged-in users away from auth pages
 * - Adds X-Request-ID header for distributed tracing
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Generate unique request ID for tracing
  const requestId = crypto.randomUUID()
  response.headers.set('X-Request-ID', requestId)

  const pathname = request.nextUrl.pathname

  // Check if this is a protected or auth route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // If not a route we care about, just return
  if (!isProtectedRoute && !isAuthRoute) {
    return response
  }

  // Create Supabase client for auth check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected route: redirect to login if not authenticated
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Auth route: redirect to dashboard if already authenticated
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// Only run on API routes and pages (exclude static assets)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
}
