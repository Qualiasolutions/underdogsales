# Phase 1: User Dashboard - History - Research

**Researched:** 2026-01-23
**Domain:** React Dashboard UI with Supabase Data Fetching
**Confidence:** HIGH

## Summary

This phase involves building a user dashboard to display practice session history and call analysis history. The codebase already has all the foundational infrastructure in place:

1. **Data Layer**: Server actions exist for fetching both practice sessions (`getUserPracticeSessions`) and call uploads (`getUserCallUploads`). Both support proper authentication, RLS, and soft delete filtering.

2. **UI Components**: The codebase has a rich component library including `Card` (with variants: default, elevated, premium), `Badge` (with `ScoreBadge` for scores), and motion components (`FadeIn`, `StaggerContainer`, `Skeleton`). An existing `AnalysisHistory` component provides a reference pattern.

3. **Design System**: Premium minimalistic theme is well-established - Navy (#021945) primary, Gold accent, Framer Motion animations, and generous whitespace (max-w-7xl container).

**Primary recommendation:** Reuse existing server actions and extend them with pagination. Build new dashboard components following the `AnalysisHistory.tsx` pattern with the premium Card variants and existing motion components.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.2 | App Router, Server Components | Project standard |
| React | 19 | UI framework | Project standard |
| Supabase SSR | Latest | Server-side data fetching | Project standard |
| Framer Motion | motion/react | Animations | Project standard (imported as `motion/react`) |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | Latest | Icons | All icons in project |
| class-variance-authority | Latest | Variant styling | Badge, Button components |
| tailwind-merge via cn() | Latest | Class merging | All className props |

### No Additional Installation Needed

All required dependencies are already installed. No `npm install` needed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── dashboard/
│       └── page.tsx           # Dashboard page (Server Component)
├── components/
│   └── dashboard/
│       ├── SessionHistory.tsx  # Practice sessions list (Client Component)
│       ├── CallHistory.tsx     # Call analyses list (Client Component)
│       └── HistoryCard.tsx     # Shared card component (Client Component)
├── lib/
│   └── actions/
│       ├── practice-session.ts # Extend with pagination
│       └── call-analysis.ts    # Extend with pagination
```

### Pattern 1: Server Actions with Client Components
**What:** Server actions fetch data, Client components handle interactivity
**When to use:** Dashboard lists with loading states and animations
**Example:**
```typescript
// Server Component (page.tsx)
export default async function DashboardPage() {
  // Initial data fetch happens server-side
  const [sessions, calls] = await Promise.all([
    getUserPracticeSessions({ limit: 10, offset: 0 }),
    getUserCallUploads({ limit: 10, offset: 0 })
  ])

  return (
    <DashboardClient
      initialSessions={sessions}
      initialCalls={calls}
    />
  )
}

// Client Component
'use client'
function DashboardClient({ initialSessions, initialCalls }) {
  // Client handles pagination, animations, interactions
}
```

### Pattern 2: Existing AnalysisHistory Card Pattern
**What:** Motion-animated list items with icon, info, and status/score
**When to use:** All history list items
**Example:**
```typescript
// Source: src/components/analyze/AnalysisHistory.tsx (lines 62-176)
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
  className={cn(
    'bg-white rounded-xl border border-border p-4 cursor-pointer transition-all',
    'hover:shadow-md hover:border-navy/20'
  )}
  onClick={onClick}
>
  <div className="flex items-center gap-4">
    {/* Icon with colored background */}
    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-100">
      <Icon className="w-6 h-6 text-emerald-600" />
    </div>

    {/* Info section */}
    <div className="flex-1 min-w-0">
      <p className="font-medium text-navy truncate">Title</p>
      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
        <span>Meta info</span>
      </div>
    </div>

    {/* Score/Status + Chevron */}
    <div className="flex items-center gap-2">
      <ScoreBadge score={7.5} />
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </div>
  </div>
</motion.div>
```

### Pattern 3: Empty State Pattern
**What:** Centered icon, message, and CTA
**When to use:** When user has no data
**Example:**
```typescript
// Source: src/components/analyze/AnalysisHistory.tsx (lines 28-40)
<div className="text-center py-12">
  <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
    <Icon className="w-8 h-8 text-muted-foreground" />
  </div>
  <p className="text-muted-foreground">No practice sessions yet</p>
  <p className="text-sm text-muted-foreground mt-1">
    Start your first practice to see results here
  </p>
</div>
```

### Pattern 4: Tab Navigation (Recommendation)
**What:** Unified dashboard with tabs to switch between session types
**When to use:** When showing related but distinct data lists
**Example:**
```typescript
// Simple tab state - no library needed
const [activeTab, setActiveTab] = useState<'practice' | 'calls'>('practice')

// Tab buttons following existing nav patterns
<div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
  <button
    onClick={() => setActiveTab('practice')}
    className={cn(
      'px-4 py-2 rounded-md text-sm font-medium transition-colors',
      activeTab === 'practice'
        ? 'bg-white text-navy shadow-sm'
        : 'text-muted-foreground hover:text-navy'
    )}
  >
    Practice Sessions
  </button>
  {/* ... */}
</div>
```

### Anti-Patterns to Avoid
- **Client-side data fetching with useEffect**: Use Server Components or server actions
- **Separate pages for session types**: Use tabs on unified dashboard (premium feel)
- **Full-page navigation for details**: Use existing detail routes (`/practice/results/[id]`, `/analyze/[id]`)
- **Custom loading spinners**: Use existing `Loader2` icon with `animate-spin` or `Skeleton` component

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Loading state | Custom spinner | `<Loader2 className="animate-spin" />` | Consistent with codebase |
| Score display | Manual color logic | `<ScoreBadge score={n} />` | Already handles color coding |
| Animated lists | Manual animation | `StaggerContainer` + `StaggerItem` | Existing motion components |
| Skeleton loading | Custom shimmer | `<Skeleton />` | Already in motion.tsx |
| Date formatting | Manual logic | Copy `formatDate()` from practice-results.tsx | Consistent format |
| Duration formatting | Manual logic | Copy `formatDuration()` from AnalysisHistory.tsx | Consistent format |

**Key insight:** The codebase has extensive component coverage. Before building anything, check `src/components/ui/` and `src/components/analyze/`.

## Common Pitfalls

### Pitfall 1: Missing Soft Delete Filter
**What goes wrong:** Deleted records appear in history
**Why it happens:** Forgetting `deleted_at IS NULL` in queries
**How to avoid:** RLS policies already handle this. If using admin client, add `.is('deleted_at', null)`
**Warning signs:** Records that should be deleted still showing

### Pitfall 2: N+1 Query for Scores
**What goes wrong:** Fetching sessions then fetching scores for each one
**Why it happens:** Not using Supabase join syntax
**How to avoid:** Use `select('*, session_scores(score)')` pattern (already in codebase)
**Warning signs:** Slow dashboard load, many network requests

### Pitfall 3: Client-Side Auth Check
**What goes wrong:** Flash of unauthorized content or redirect loops
**Why it happens:** Checking auth in client component
**How to avoid:** Use `getUser()` in server action, return empty array if null
**Warning signs:** Dashboard flashing before redirecting

### Pitfall 4: Forgetting Motion Import
**What goes wrong:** `motion is not defined` error
**Why it happens:** Wrong import path
**How to avoid:** Import from `motion/react` not `framer-motion`
**Warning signs:** Build errors mentioning motion

### Pitfall 5: Hardcoded Persona Names
**What goes wrong:** Displaying persona_id instead of human name
**Why it happens:** Not mapping to persona config
**How to avoid:** Use `getPersonaById(persona_id)` from `@/config/personas`
**Warning signs:** Dashboard showing "skeptical_cfo" instead of "Sarah Chen"

## Code Examples

Verified patterns from the existing codebase:

### Fetching Practice Sessions (Existing)
```typescript
// Source: src/lib/actions/practice-session.ts (lines 270-323)
export async function getUserPracticeSessions(): Promise<Array<{
  id: string
  persona_id: string
  scenario_type: string
  duration_seconds: number
  created_at: string
  overall_score: number
}>> {
  const user = await getUser()
  if (!user) return []

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
    .limit(20)

  if (error || !sessions) return []

  return sessions.map((session) => {
    const scores = (session.session_scores as Array<{ score: number }>) || []
    const avgScore =
      scores.length > 0
        ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
        : 0

    return {
      id: session.id,
      persona_id: session.persona_id,
      scenario_type: session.scenario_type,
      duration_seconds: session.duration_seconds || 0,
      created_at: session.created_at || new Date().toISOString(),
      overall_score: Math.round(avgScore * 10) / 10,
    }
  })
}
```

### Score Badge Usage
```typescript
// Source: src/components/ui/badge.tsx (lines 72-89)
import { ScoreBadge } from '@/components/ui/badge'

// Automatically colors based on score (green >= 8, gold >= 6, etc.)
<ScoreBadge score={7.5} />
<ScoreBadge score={session.overall_score} max={10} />
```

### Card with Hover Animation
```typescript
// Source: src/components/ui/card.tsx
import { Card } from '@/components/ui/card'

// Premium variant for dashboard cards
<Card variant="premium" hover className="cursor-pointer">
  {/* Content */}
</Card>

// Elevated variant for hero sections
<Card variant="elevated">
  {/* Content */}
</Card>
```

### Navigation Integration
```typescript
// Source: src/components/ui/header.tsx (lines 28-33)
// Add dashboard to navLinks array:
const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, // NEW
  { href: '/practice', label: 'Practice', icon: Mic },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/curriculum', label: 'Curriculum', icon: BookOpen },
]
```

### Pagination Extension Pattern
```typescript
// Extend existing server action with pagination
interface PaginationOptions {
  limit?: number
  offset?: number
}

export async function getUserPracticeSessions(
  options: PaginationOptions = {}
): Promise<{ sessions: Session[]; hasMore: boolean }> {
  const { limit = 10, offset = 0 } = options
  const user = await getUser()
  if (!user) return { sessions: [], hasMore: false }

  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('roleplay_sessions')
    .select(`...`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit) // Supabase range for pagination

  return {
    sessions: data || [],
    hasMore: (data?.length || 0) === limit + 1
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Framer Motion import | motion/react import | Project standard | Use `import { motion } from 'motion/react'` |
| useEffect data fetch | Server Components | React 19/Next.js 16 | Fetch in page.tsx, pass as props |
| Manual pagination | Supabase `.range()` | Supabase standard | Use offset-based pagination |

**Deprecated/outdated:**
- `framer-motion` import path: Use `motion/react` instead
- Client-side fetching for initial data: Use Server Components

## Open Questions

None - all patterns are well-established in the codebase.

## Sources

### Primary (HIGH confidence)
- `src/components/analyze/AnalysisHistory.tsx` - Reference implementation for history lists
- `src/lib/actions/practice-session.ts` - Existing data fetching pattern
- `src/lib/actions/call-analysis.ts` - Existing data fetching pattern
- `src/components/ui/card.tsx` - Card variants and animations
- `src/components/ui/badge.tsx` - ScoreBadge component
- `src/components/ui/motion.tsx` - Animation components
- `src/config/personas.ts` - Persona lookup function

### Secondary (MEDIUM confidence)
- `src/app/practice/results/[sessionId]/practice-results.tsx` - Detail page patterns

### Tertiary (LOW confidence)
- None - all patterns verified in codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and used
- Architecture: HIGH - Patterns verified in existing components
- Pitfalls: HIGH - Based on actual codebase patterns and schema

**Research date:** 2026-01-23
**Valid until:** 60 days (stable stack, no external dependencies)
