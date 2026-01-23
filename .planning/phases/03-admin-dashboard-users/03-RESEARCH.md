# Phase 3: Admin Dashboard - Users - Research

**Researched:** 2026-01-23
**Domain:** Admin dashboard with user management and content management (Next.js 16 + Supabase)
**Confidence:** HIGH

## Summary

This phase implements an admin-only interface for viewing all users with activity metrics and managing platform content (personas, rubric). The codebase already has a solid foundation with server actions, admin Supabase client, and middleware-based route protection.

The recommended approach uses:
1. **Middleware-based admin route protection** - Extend existing middleware to check admin status
2. **Server actions with admin client** - Leverage existing `getAdminClient()` for RLS bypass
3. **Native HTML table with Tailwind** - Build custom table matching existing design system (no external table library needed)
4. **URL-based state for search/filter** - Follow Next.js patterns for bookmarkable admin views
5. **Server actions for content mutations** - Use existing patterns for updating personas/rubric

**Primary recommendation:** Use hardcoded email-based admin check (per CONTEXT.md decision), extend middleware, and build custom table components matching existing UI patterns.

## Standard Stack

The existing project stack covers all admin dashboard needs:

### Core (Already in Project)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Next.js | 16.1.4 | App Router, Server Actions, Middleware | Installed |
| React | 19.2.3 | UI components | Installed |
| Supabase SSR | 0.8.0 | Auth & session management | Installed |
| Supabase JS | 2.90.1 | Database client | Installed |
| Zod | 4.3.5 | Form validation | Installed |
| lucide-react | 0.562.0 | Icons | Installed |
| motion | 12.26.2 | Animations | Installed |
| tailwind-merge + clsx | - | Styling utilities | Installed |

### Supporting (No New Dependencies Needed)
| Tool | Purpose | Notes |
|------|---------|-------|
| URL SearchParams | Table state (search, filter, page) | Built into Next.js |
| `useFormStatus` | Loading states for forms | Built into React 19 |
| Native HTML forms | Form handling | Works with Server Actions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom table | TanStack Table | Overkill for simple admin list - adds bundle size |
| Custom table | react-admin | Full framework replacement - too heavy |
| URL state | React state | Not bookmarkable, loses state on refresh |
| Native forms | react-hook-form | Already have Zod, Server Actions handle forms well |

**Installation:**
```bash
# No new packages required
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── admin/
│       ├── layout.tsx           # Admin layout with auth guard
│       ├── page.tsx             # Admin dashboard overview
│       ├── users/
│       │   ├── page.tsx         # User list with search/filter
│       │   └── [userId]/
│       │       └── page.tsx     # User detail view
│       └── content/
│           ├── page.tsx         # Content management hub
│           ├── personas/
│           │   └── page.tsx     # Personas list/edit
│           └── rubric/
│               └── page.tsx     # Rubric configuration
├── components/
│   └── admin/
│       ├── UserTable.tsx        # User list table
│       ├── UserRow.tsx          # Table row component
│       ├── UserDetailCard.tsx   # User detail display
│       ├── PersonaEditor.tsx    # Inline persona editing
│       ├── RubricEditor.tsx     # Rubric form
│       ├── SearchFilter.tsx     # Search + filter controls
│       └── AdminNav.tsx         # Admin sidebar/nav
├── lib/
│   └── actions/
│       └── admin.ts             # Admin-specific server actions
└── config/
    └── admin.ts                 # Admin email whitelist
```

### Pattern 1: Admin Route Protection via Layout
**What:** Use a server-side layout component to check admin status and redirect non-admins
**When to use:** All `/admin/*` routes
**Example:**
```typescript
// src/app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { isAdmin } from '@/config/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  if (!isAdmin(user.email)) {
    redirect('/') // Non-admins go home
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
```

### Pattern 2: Admin Email Whitelist
**What:** Simple hardcoded admin check (per CONTEXT.md decision)
**When to use:** Checking admin access throughout the app
**Example:**
```typescript
// src/config/admin.ts
const ADMIN_EMAILS = [
  'fawzi@qualiasolutions.io',
  'admin@underdogsales.com',
  // Add more as needed
] as const

export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase() as typeof ADMIN_EMAILS[number])
}
```

### Pattern 3: Server Action with Admin Client (RLS Bypass)
**What:** Use `getAdminClient()` for cross-user data access
**When to use:** Any admin operation that needs to see all users' data
**Example:**
```typescript
// src/lib/actions/admin.ts
'use server'

import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/config/admin'

interface GetAllUsersOptions {
  search?: string
  limit?: number
  offset?: number
}

export async function getAllUsers(options: GetAllUsersOptions = {}) {
  // Always verify admin status in server actions
  const user = await getUser()
  if (!user || !isAdmin(user.email)) {
    return { users: [], hasMore: false, error: 'Unauthorized' }
  }

  const { search = '', limit = 20, offset = 0 } = options
  const supabase = getAdminClient()

  let query = supabase
    .from('users')
    .select('id, email, name, role, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit)

  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return { users: [], hasMore: false, error: error.message }
  }

  return {
    users: data || [],
    total: count || 0,
    hasMore: (count || 0) > offset + limit,
  }
}
```

### Pattern 4: URL-Based Table State
**What:** Store search, filter, and pagination in URL search params
**When to use:** Admin tables that should be bookmarkable
**Example:**
```typescript
// src/app/admin/users/page.tsx
import { getAllUsers, getUserStats } from '@/lib/actions/admin'
import { UserTable } from '@/components/admin/UserTable'
import { SearchFilter } from '@/components/admin/SearchFilter'

interface Props {
  searchParams: Promise<{ search?: string; page?: string; filter?: string }>
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams
  const search = params.search || ''
  const page = parseInt(params.page || '1', 10)
  const limit = 20
  const offset = (page - 1) * limit

  const { users, total, hasMore } = await getAllUsers({ search, limit, offset })

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Users</h1>
      <SearchFilter defaultSearch={search} />
      <UserTable users={users} />
      {/* Pagination controls */}
    </div>
  )
}
```

### Pattern 5: Search with URL Updates (Client Component)
**What:** Debounced search that updates URL
**When to use:** Search inputs that should update the page
**Example:**
```typescript
// src/components/admin/SearchFilter.tsx
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition, useCallback } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce' // Or implement custom

export function SearchFilter({ defaultSearch = '' }: { defaultSearch?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
      params.delete('page') // Reset to page 1 on search
    } else {
      params.delete('search')
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }, 300)

  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search by email or name..."
        defaultValue={defaultSearch}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy/20"
      />
      {isPending && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />}
    </div>
  )
}
```

### Pattern 6: Server Actions for Content Updates
**What:** Use server actions for updating personas/rubric with validation
**When to use:** Admin content management forms
**Example:**
```typescript
// src/lib/actions/admin.ts
'use server'

import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/supabase/server'
import { isAdmin } from '@/config/admin'
import { z } from 'zod'

const PersonaSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.string().min(1),
  personality: z.string().min(10),
  warmth: z.number().min(0).max(1),
})

export async function updatePersona(formData: FormData) {
  const user = await getUser()
  if (!user || !isAdmin(user.email)) {
    return { success: false, error: 'Unauthorized' }
  }

  const raw = {
    id: formData.get('id'),
    name: formData.get('name'),
    role: formData.get('role'),
    personality: formData.get('personality'),
    warmth: parseFloat(formData.get('warmth') as string),
  }

  const result = PersonaSchema.safeParse(raw)
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors }
  }

  // Note: Currently personas are in config file. For database storage,
  // you'd save to a personas table here. For file-based, this would
  // need a different approach (API route that writes to file, or just
  // read-only display with manual file edits)

  revalidatePath('/admin/content/personas')
  return { success: true }
}
```

### Anti-Patterns to Avoid
- **Client-side admin check only:** Always verify admin status server-side in layouts AND server actions
- **Using anon client for admin ops:** Always use `getAdminClient()` which bypasses RLS
- **Storing table state only in React state:** Loses state on refresh, not bookmarkable
- **Building complex role system:** CONTEXT.md specifies simple admin/not-admin check
- **Adding external table library:** Overkill for simple admin list with 5-6 columns

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Admin session check | Custom JWT parsing | `getUser()` + email whitelist | Supabase handles session, just check email |
| Cross-user data access | Custom RLS bypass | `getAdminClient()` | Already exists, uses service role |
| URL state management | Custom router logic | `useSearchParams` + `router.replace` | Built into Next.js |
| Debounced search | setTimeout chains | `useDebouncedCallback` or custom hook | Handles cleanup, edge cases |
| Form validation | Manual if/else | Zod schemas | Already in project, type-safe |
| Loading states | Custom boolean flags | `useTransition` / `useFormStatus` | React 19 built-ins |

**Key insight:** The project already has all the infrastructure needed. The admin client exists, server actions pattern is established, and middleware can be extended.

## Common Pitfalls

### Pitfall 1: Forgetting Server-Side Admin Verification
**What goes wrong:** Admin check only in middleware/layout, not in server actions
**Why it happens:** Assuming middleware protects everything
**How to avoid:** ALWAYS check `isAdmin()` at the start of every admin server action
**Warning signs:** Server action works when called directly via fetch

### Pitfall 2: Using Client Supabase for Admin Queries
**What goes wrong:** RLS blocks access to other users' data
**Why it happens:** Copying pattern from user-facing components
**How to avoid:** Always use `getAdminClient()` in admin server actions
**Warning signs:** Empty results when you know data exists

### Pitfall 3: Blocking UI During Search
**What goes wrong:** UI freezes while fetching search results
**Why it happens:** Not using transitions or debouncing
**How to avoid:** Use `useTransition` for URL updates, debounce search input
**Warning signs:** Laggy typing experience in search field

### Pitfall 4: N+1 Queries for User Activity
**What goes wrong:** Fetching session counts in a loop for each user
**Why it happens:** Not thinking about aggregation upfront
**How to avoid:** Use Postgres aggregation or create a view/function
**Warning signs:** Admin page gets slower with more users

### Pitfall 5: Config File vs Database for Content
**What goes wrong:** Trying to write to config files from server actions
**Why it happens:** Personas/rubric currently in TypeScript config files
**How to avoid:** Decide upfront: read-only display OR migrate to database
**Warning signs:** File write permissions errors in production

## Code Examples

Verified patterns from the existing codebase:

### Existing Server Action Pattern (from practice-session.ts)
```typescript
// Source: src/lib/actions/practice-session.ts
'use server'

import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function getUserPracticeSessions(options: PaginationOptions = {}) {
  try {
    const { limit = 10, offset = 0 } = options
    const user = await getUser()
    if (!user) return { sessions: [], hasMore: false }

    const supabase = getAdminClient()

    const { data: sessions, error } = await supabase
      .from('roleplay_sessions')
      .select(`
        id,
        persona_id,
        scenario_type,
        duration_seconds,
        created_at,
        session_scores (score)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit)

    if (error || !sessions) return { sessions: [], hasMore: false }
    // ... rest of processing
  } catch (error) {
    logger.exception('Error', error, { operation: 'getUserPracticeSessions' })
    return { sessions: [], hasMore: false }
  }
}
```

### Existing Middleware Pattern (from middleware.ts)
```typescript
// Source: middleware.ts (root)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
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

  const { data: { user } } = await supabase.auth.getUser()

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

  return supabaseResponse
}

export const config = {
  matcher: ['/practice/:path*', '/dashboard/:path*', '/settings/:path*', '/profile/:path*', '/curriculum/:path*', '/login', '/signup'],
}
```

### User Activity Aggregation Query
```typescript
// Example: Get users with activity metrics in single query
export async function getAllUsersWithActivity(options: GetAllUsersOptions = {}) {
  const supabase = getAdminClient()

  // Use a SQL function or join with aggregation
  const { data, error, count } = await supabase
    .from('users')
    .select(`
      id,
      email,
      name,
      role,
      created_at,
      roleplay_sessions!left (
        id,
        created_at
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(options.offset || 0, (options.offset || 0) + (options.limit || 20))

  // Process to get session counts and last active
  const users = (data || []).map(user => {
    const sessions = user.roleplay_sessions || []
    const lastSession = sessions.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      session_count: sessions.length,
      last_active: lastSession?.created_at || user.created_at,
    }
  })

  return { users, total: count || 0 }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getStaticProps` for admin pages | Server Components + Server Actions | Next.js 13+ | Simpler data fetching |
| React state for table state | URL searchParams | Next.js 13+ | Bookmarkable, shareable |
| HOC for protected routes | Layout + middleware | Next.js 13+ | Cleaner composition |
| `useState` + `useEffect` for forms | Server Actions + `useActionState` | React 19 | Less client JS |
| Custom debounce | `useDebouncedCallback` or native | - | Handles edge cases |

**Deprecated/outdated:**
- `getServerSideProps`: Use Server Components and async page components
- Client-side fetching in admin: Use server actions for data mutations
- Cookie-based role storage: Use email whitelist or user metadata

## Open Questions

Things that couldn't be fully resolved:

1. **Content Storage Decision**
   - What we know: Personas and rubric currently in TypeScript config files
   - What's unclear: Should content edits persist to files or migrate to database?
   - Recommendation: For MVP, display content as read-only. Database migration would require new tables and migration script. Discuss with user before implementing edit functionality.

2. **Average Score Calculation**
   - What we know: Scores are in `session_scores` table, linked to sessions
   - What's unclear: Most efficient way to get user average scores across all dimensions
   - Recommendation: Create a database view or use Supabase SQL function for aggregation. Avoid N+1 by not fetching scores per-user in a loop.

3. **Debounce Library**
   - What we know: Project doesn't have a debounce utility
   - What's unclear: Whether to add `use-debounce` package or implement custom
   - Recommendation: Implement simple custom hook (10 lines) to avoid new dependency. Or use native setTimeout with cleanup.

## Sources

### Primary (HIGH confidence)
- **Existing codebase** - `src/lib/actions/*.ts`, `middleware.ts`, `src/lib/supabase/*.ts`
- **Supabase MCP docs** - Service role, RLS bypass, admin client patterns
- **Next.js official docs** - Server Actions, Forms, Middleware patterns

### Secondary (MEDIUM confidence)
- [Next.js Middleware Protected Routes](https://medium.com/@turingvang/nextjs-middleware-protected-routes-bcb3df06db0c) - Middleware patterns
- [Next.js Search and Pagination](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination) - URL state management
- [Next.js Server Actions Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) - Form handling
- [FreeCodeCamp Secure Routes](https://www.freecodecamp.org/news/secure-routes-in-next-js/) - Route protection patterns

### Tertiary (LOW confidence)
- WebSearch results for React table patterns - validated against existing project patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project
- Architecture: HIGH - Patterns match existing codebase
- Pitfalls: HIGH - Based on documented Supabase RLS and Next.js middleware behavior

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (stable stack, no breaking changes expected)
