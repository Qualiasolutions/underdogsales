import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for request tracking and security
 * - Adds X-Request-ID header for distributed tracing
 * - Adds security headers
 */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next()

  // Generate unique request ID for tracing
  const requestId = crypto.randomUUID()
  response.headers.set('X-Request-ID', requestId)

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
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
}
