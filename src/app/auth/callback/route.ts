import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

// Allowed redirect paths after authentication
const ALLOWED_PATHS = ['/practice', '/dashboard', '/curriculum', '/analyze', '/history']

function getSafeRedirectPath(next: string | null): string {
  const defaultPath = '/practice'

  if (!next) return defaultPath

  // Must start with / but not // (protocol-relative URL)
  if (!next.startsWith('/') || next.startsWith('//')) return defaultPath

  // Check if path starts with an allowed prefix
  const isAllowed = ALLOWED_PATHS.some(allowed =>
    next === allowed || next.startsWith(`${allowed}/`) || next.startsWith(`${allowed}?`)
  )

  return isAllowed ? next : defaultPath
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = getSafeRedirectPath(requestUrl.searchParams.get('next'))

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successfully authenticated - redirect to the intended destination
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Auth failed - redirect to login with error
  return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
}
