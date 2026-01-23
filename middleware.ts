import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdmin } from '@/config/admin'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - require authentication
  const protectedRoutes = ['/practice', '/dashboard', '/settings', '/profile', '/curriculum']
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Admin routes - require admin privileges
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  if (isAdminRoute) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (!isAdmin(user.email)) {
      // Non-admins get redirected to home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Auth routes - redirect logged-in users away
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname === route)

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/practice', request.url))
  }

  return supabaseResponse
}

export const config = {
  // Only run middleware on routes that need auth checks
  // Excludes: API routes, static assets, and public pages
  matcher: [
    '/practice/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/curriculum/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
  ],
}
