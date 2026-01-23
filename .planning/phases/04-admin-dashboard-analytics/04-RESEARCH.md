# Phase 4: Admin Dashboard - Analytics - Research

**Researched:** 2026-01-23
**Domain:** Admin analytics dashboard with Recharts, system health monitoring
**Confidence:** HIGH

## Summary

This phase adds analytics capabilities to the existing admin dashboard infrastructure. The codebase already has:
- Recharts 3.7.0 installed and working patterns in `src/components/dashboard/progress/`
- Health check endpoint at `/api/health` checking Supabase, OpenAI, OpenRouter
- Circuit breaker pattern with stats in `src/lib/circuit-breaker.ts`
- Admin infrastructure (layout, navigation, server actions) from Phase 3
- Sentry configured for error tracking

The primary task is building analytics UI components that query existing database tables (roleplay_sessions, call_uploads, users) and reuse established patterns. System health can leverage the existing `/api/health` endpoint and circuit breaker stats.

**Primary recommendation:** Reuse existing Recharts patterns from ScoreTrendChart, create server actions for aggregate queries, add Analytics nav item, and build three focused components (MetricsCards, UsageCharts, SystemHealth).

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.7.0 | Charting (BarChart, AreaChart, LineChart) | Already in use, React-native, composable |
| lucide-react | 0.562.0 | Icons for metrics cards | Already used throughout admin |
| @supabase/supabase-js | 2.90.1 | Database queries for metrics | Existing admin pattern |

### Supporting (Already Available)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion | 12.26.2 | Card animations | Card component already uses it |
| date-fns | - | Date formatting (NOT installed) | Would need installation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Chart.js | Recharts already established in codebase |
| date-fns | Native Date | Native is sufficient for simple formatting |
| Sentry API | Log parsing | Sentry API requires auth token setup |

**Installation:**
No new packages needed. All required libraries are installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/admin/
│   └── analytics/
│       └── page.tsx           # Server component, fetches data
├── components/admin/
│   ├── MetricsCards.tsx       # Server component - stat cards
│   ├── UsageCharts.tsx        # 'use client' - Recharts charts
│   └── SystemHealth.tsx       # Server component with client island
└── lib/actions/
    └── admin.ts               # Add getAnalyticsData, getSystemHealth
```

### Pattern 1: Server Component with Client Chart Island
**What:** Server component fetches data, passes to client component for rendering
**When to use:** Charts that need Recharts (requires browser APIs)
**Example:**
```typescript
// Source: Existing pattern from src/components/dashboard/progress/
// analytics/page.tsx (server)
export default async function AnalyticsPage() {
  const { sessions, calls, users } = await getAnalyticsData()

  return (
    <div>
      <MetricsCards sessions={sessions} calls={calls} users={users} />
      <UsageCharts data={sessions} />  {/* client component */}
      <SystemHealth />
    </div>
  )
}

// UsageCharts.tsx (client)
'use client'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

export function UsageCharts({ data }: { data: DailyMetric[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        {/* ... */}
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

### Pattern 2: Aggregate Queries with Admin Client
**What:** Use getAdminClient() for aggregate queries bypassing RLS
**When to use:** Platform-wide metrics (total users, sessions, etc.)
**Example:**
```typescript
// Source: Existing pattern from src/lib/actions/admin.ts
const supabase = getAdminClient()

// Count sessions per day (last 30 days)
const { data: sessionsData } = await supabase
  .from('roleplay_sessions')
  .select('created_at')
  .gte('created_at', thirtyDaysAgo)
  .is('deleted_at', null)

// Group by day in JavaScript (Supabase doesn't have GROUP BY in JS client)
```

### Pattern 3: Health Check Reuse
**What:** Fetch from existing /api/health endpoint for service status
**When to use:** System health display
**Example:**
```typescript
// Fetch internal API
const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/health`, {
  cache: 'no-store'
})
const health = await response.json()
```

### Anti-Patterns to Avoid
- **Client-side data fetching for metrics:** Use server components with server actions, not useEffect fetching
- **Complex SQL in client:** Keep aggregation logic in server actions
- **Polling for health:** Use page refresh or manual refresh button, not websockets/polling
- **Hardcoded date ranges:** Make date ranges configurable (7d, 30d, 90d)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Stat cards | Custom div styling | Existing StatCard from ui/card.tsx | Consistent styling, animations |
| Charts | Canvas/SVG from scratch | Recharts components | Responsive, accessible, documented |
| Service status badges | Custom badge logic | Existing Badge component + status mapping | Consistent UI patterns |
| Date grouping | Custom date math | Simple reduce/group by date string | Avoid timezone complexity |
| Number formatting | Manual string concat | Intl.NumberFormat | Handles localization |

**Key insight:** The codebase already has Card, Badge, and Recharts patterns. Analytics is primarily data aggregation + composition of existing components.

## Common Pitfalls

### Pitfall 1: Recharts Server Component Error
**What goes wrong:** "window is not defined" error on server render
**Why it happens:** Recharts requires browser APIs (window, document)
**How to avoid:** Always use 'use client' directive for chart components
**Warning signs:** Build fails or hydration mismatch errors

### Pitfall 2: Slow Aggregate Queries
**What goes wrong:** Analytics page takes >3s to load
**Why it happens:** No indexes on date columns, scanning full tables
**How to avoid:**
- Use existing `idx_roleplay_sessions_created_at` index
- Limit date range (default 30 days)
- Consider caching for expensive aggregations
**Warning signs:** Vercel logs show slow queries

### Pitfall 3: Timezone Confusion in Charts
**What goes wrong:** Data appears on wrong days
**Why it happens:** UTC in database vs local time in display
**How to avoid:**
- Store UTC, convert to local only for display labels
- Use toLocaleDateString() for X-axis labels
- Be consistent: all server-side dates in UTC
**Warning signs:** Activity appears on "tomorrow" or "yesterday"

### Pitfall 4: Empty State Handling
**What goes wrong:** Charts crash or show NaN with empty data
**Why it happens:** Recharts doesn't handle empty arrays gracefully
**How to avoid:** Check data.length > 0 before rendering chart, show helpful empty state
**Warning signs:** White screen or console errors on new instances

### Pitfall 5: Health Check Timeout
**What goes wrong:** Analytics page hangs waiting for health check
**Why it happens:** External service (OpenAI, etc.) is slow/down
**How to avoid:**
- Add timeout to health fetch (5s max)
- Show "checking..." state while loading
- Don't block page render on health check
**Warning signs:** Page load >10s

## Code Examples

Verified patterns from official sources and existing codebase:

### AreaChart for Sessions Over Time
```typescript
// Source: Recharts docs + existing ScoreTrendChart.tsx pattern
'use client'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DailyMetric {
  date: string  // "Jan 15"
  sessions: number
  calls: number
}

export function UsageCharts({ data }: { data: DailyMetric[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No activity data yet.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Area
          type="monotone"
          dataKey="sessions"
          stroke="var(--underdog-navy)"
          fill="var(--underdog-gold)"
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

### Server Action for Analytics Data
```typescript
// Source: Existing getAllUsers pattern in admin.ts
export async function getAnalyticsData(days: number = 30) {
  const user = await getUser()
  if (!user || !isAdmin(user.email)) {
    return { error: 'Admin access required', metrics: null }
  }

  const supabase = getAdminClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Fetch sessions
  const { data: sessions } = await supabase
    .from('roleplay_sessions')
    .select('id, created_at')
    .gte('created_at', startDate.toISOString())
    .is('deleted_at', null)

  // Fetch call uploads
  const { data: calls } = await supabase
    .from('call_uploads')
    .select('id, created_at')
    .gte('created_at', startDate.toISOString())
    .is('deleted_at', null)

  // Fetch active users (users with sessions in period)
  const { data: activeUsers } = await supabase
    .from('roleplay_sessions')
    .select('user_id')
    .gte('created_at', startDate.toISOString())
    .is('deleted_at', null)

  const uniqueActiveUsers = new Set(activeUsers?.map(s => s.user_id) || [])

  // Group by day
  const dailyData = groupByDay(sessions || [], calls || [])

  return {
    metrics: {
      totalSessions: sessions?.length || 0,
      totalCalls: calls?.length || 0,
      activeUsers: uniqueActiveUsers.size,
      dailyData,
    },
    error: null,
  }
}

function groupByDay(sessions: { created_at: string }[], calls: { created_at: string }[]) {
  const map = new Map<string, { sessions: number; calls: number }>()

  for (const s of sessions) {
    const day = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const existing = map.get(day) || { sessions: 0, calls: 0 }
    map.set(day, { ...existing, sessions: existing.sessions + 1 })
  }

  for (const c of calls) {
    const day = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const existing = map.get(day) || { sessions: 0, calls: 0 }
    map.set(day, { ...existing, calls: existing.calls + 1 })
  }

  return Array.from(map.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
```

### System Health Component with Circuit Breaker
```typescript
// SystemHealth.tsx - Server component with client refresh
import { getSystemHealth } from '@/lib/actions/admin'
import { Badge } from '@/components/ui/badge'

export async function SystemHealth() {
  const { health, circuitBreakers, error } = await getSystemHealth()

  if (error) {
    return <div className="text-error">Failed to load health status</div>
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="font-semibold text-navy mb-4">System Health</h3>

      <div className="space-y-3">
        {Object.entries(health.services).map(([service, status]) => (
          <div key={service} className="flex items-center justify-between">
            <span className="capitalize">{service}</span>
            <Badge variant={status.status === 'healthy' ? 'success' : 'error'}>
              {status.status}
              {status.latency && ` (${status.latency}ms)`}
            </Badge>
          </div>
        ))}
      </div>

      {/* Circuit breaker states */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-2">Circuit Breakers</p>
        {circuitBreakers.map(cb => (
          <div key={cb.name} className="flex items-center justify-between text-sm">
            <span>{cb.name}</span>
            <span className={cb.state === 'closed' ? 'text-success' : 'text-error'}>
              {cb.state}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side fetching | Server Components | Next.js 13+ (App Router) | Better performance, no waterfalls |
| useEffect + useState | Server Actions | Next.js 14+ | Simpler data flow, type safety |
| REST endpoints | Server Actions | 2024+ | Reduces API route proliferation |

**Deprecated/outdated:**
- `getServerSideProps`: Replaced by async Server Components
- API routes for internal data: Server Actions preferred for mutations and admin data

## Open Questions

Things that couldn't be fully resolved:

1. **Sentry API for Error List**
   - What we know: Sentry has REST API for fetching issues, requires auth token with `event:read` scope
   - What's unclear: Whether to add SENTRY_AUTH_TOKEN env var and create API route, or just link to Sentry dashboard
   - Recommendation: For MVP, display link to Sentry dashboard. API integration is optional enhancement.

2. **VAPI Health Check**
   - What we know: Circuit breaker exists for VAPI, but /api/health doesn't check VAPI
   - What's unclear: Whether VAPI has a health/status endpoint to ping
   - Recommendation: Show circuit breaker state for VAPI instead of active health check

3. **Historical Data Retention**
   - What we know: Current queries scan all matching rows
   - What's unclear: How much data will accumulate over time
   - Recommendation: Start with 30-day default, add date range selector, monitor query performance

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/components/dashboard/progress/ScoreTrendChart.tsx` - Recharts patterns
- Existing codebase: `src/lib/actions/admin.ts` - Server action patterns
- Existing codebase: `src/app/api/health/route.ts` - Health check implementation
- Existing codebase: `src/lib/circuit-breaker.ts` - Circuit breaker stats API

### Secondary (MEDIUM confidence)
- [Recharts Documentation](https://recharts.org/) - AreaChart, BarChart APIs
- [Sentry API Docs](https://docs.sentry.io/api/events/list-a-projects-issues/) - Issues endpoint

### Tertiary (LOW confidence)
- WebSearch results for dashboard patterns - General best practices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and patterns established
- Architecture: HIGH - Following existing codebase patterns exactly
- Pitfalls: HIGH - Based on actual codebase issues and React/Next.js known issues

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - stable patterns, no fast-moving dependencies)
