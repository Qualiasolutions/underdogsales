# Phase 02: User Dashboard - Progress - Research

**Researched:** 2026-01-23
**Domain:** Data visualization, React charting, progress tracking
**Confidence:** HIGH

## Summary

This phase requires building curriculum progress visualization and performance trend charts for the dashboard. The project already has solid foundations: existing progress components (`OverallProgressBar`, `ModuleProgressRing`), curriculum data structure (12 modules), and session scoring data (6 dimensions).

Research confirms Recharts v3.7.0 is the standard choice for React data visualization - it's SVG-based, composable, and used by shadcn/ui (which aligns with the project's design system). The key patterns involve wrapping Recharts in client components while fetching data in server components, and using `ResponsiveContainer` for responsive charts.

**Primary recommendation:** Use Recharts with LineChart for score trends over time, RadarChart for dimension breakdown comparison, and extend existing custom SVG progress components for curriculum visualization.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | ^3.7.0 | Charting library | Most popular React chart library (26k+ GitHub stars), composable components, used by shadcn/ui |
| react-is | ^19.x | Peer dependency | Required by recharts, must match React version |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| motion (already installed) | ^12.26.2 | Animations | Already in project, use for progress transitions |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| recharts | chart.js/react-chartjs-2 | Canvas-based, slightly better perf for huge datasets, but worse React integration |
| recharts | nivo | More chart types, but heavier bundle and steeper learning curve |
| recharts | custom SVG | Full control but significant dev time; project already has custom progress ring |

**Installation:**
```bash
npm install recharts react-is
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   └── dashboard/
│       ├── progress/
│       │   ├── CurriculumProgressCard.tsx     # Overall curriculum progress visualization
│       │   ├── ModuleBreakdown.tsx            # Module list with status indicators
│       │   ├── ScoreTrendChart.tsx            # Line chart wrapper (client component)
│       │   └── DimensionRadarChart.tsx        # Radar chart for 6 dimensions
│       └── DashboardClient.tsx                # Existing, add Progress tab
└── lib/
    └── actions/
        └── progress.ts                        # Server actions for aggregated data
```

### Pattern 1: Server Component Data Fetch + Client Chart Wrapper

**What:** Fetch aggregated data in server components, pass to client component chart wrappers
**When to use:** All chart components
**Example:**
```typescript
// Server component (page.tsx or parent)
const progressData = await getProgressSummary()
const scoreTrends = await getScoreTrends()

// Pass to client component
<ScoreTrendChart data={scoreTrends} />

// Client component (ScoreTrendChart.tsx)
'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function ScoreTrendChart({ data }: { data: ScoreTrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis domain={[0, 10]} />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="var(--underdog-gold)" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Pattern 2: Data Aggregation in Server Actions

**What:** Create server actions that aggregate scoring data for trends
**When to use:** Score trends over time, dimension averages
**Example:**
```typescript
// src/lib/actions/progress.ts
'use server'

export async function getScoreTrends(limit = 30): Promise<{ date: string; score: number }[]> {
  const user = await getUser()
  const supabase = getAdminClient()

  // Get sessions with average score
  const { data } = await supabase
    .from('roleplay_sessions')
    .select(`
      created_at,
      session_scores (score)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(limit)

  return data.map(session => ({
    date: format(new Date(session.created_at), 'MMM d'),
    score: calculateAverage(session.session_scores)
  }))
}

export async function getDimensionAverages(): Promise<Record<ScoreDimension, number>> {
  // Aggregate all session_scores by dimension
}
```

### Pattern 3: Reuse Existing Progress Components

**What:** Extend existing `OverallProgressBar` and `ModuleProgressRing` components
**When to use:** Curriculum progress visualization
**Example:**
```typescript
// Existing component already handles this pattern:
// src/components/curriculum/CurriculumProgress.tsx

// For dashboard, create a card wrapper that uses existing components
export function CurriculumProgressCard({ progress }: Props) {
  const completed = progress.filter(p => p.completed).length
  return (
    <Card>
      <OverallProgressBar completed={completed} total={12} />
      <CurriculumStats completed={completed} total={12} />
    </Card>
  )
}
```

### Anti-Patterns to Avoid

- **Rendering Recharts in Server Components:** Recharts uses browser APIs (SVG, DOM measurements). Always use 'use client' directive.
- **Missing ResponsiveContainer:** Charts won't be responsive without it. Always wrap in `ResponsiveContainer`.
- **Fetching data inside chart components:** Keep data fetching in server components or server actions, pass data as props.
- **Not handling empty states:** Always check for empty data arrays before rendering charts.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Progress bar animation | Custom CSS keyframes | motion (already installed) + existing OverallProgressBar | Handles spring physics, interruption |
| Circular progress | Canvas or complex SVG | Existing ModuleProgressRing | Already built, tested, matches design system |
| Line chart | Custom SVG path | Recharts LineChart | Handles axes, tooltips, responsiveness, data updates |
| Radar chart | D3 from scratch | Recharts RadarChart | Composable, consistent with other charts |

**Key insight:** The project already has custom SVG progress components (`ModuleProgressRing`, `OverallProgressBar`) that match the design system. For the curriculum progress section, extend these. For data trend charts, use Recharts.

## Common Pitfalls

### Pitfall 1: Chart Not Rendering in Server Component

**What goes wrong:** "TypeError: Super expression must either be null or a function" or blank chart
**Why it happens:** Recharts uses browser APIs, cannot render on server
**How to avoid:** Add 'use client' directive to any file importing Recharts components
**Warning signs:** Error during build or hydration mismatch warnings

### Pitfall 2: Chart Not Responsive

**What goes wrong:** Chart has fixed width, doesn't resize with container
**Why it happens:** Recharts requires explicit dimensions if not using ResponsiveContainer
**How to avoid:** Always wrap charts in `<ResponsiveContainer width="100%" height={300}>`
**Warning signs:** Chart overflows or doesn't fill container

### Pitfall 3: Empty Data Handling

**What goes wrong:** Chart crashes or shows broken UI with no data
**Why it happens:** Charts expect array of data objects, empty array renders nothing or errors
**How to avoid:** Add explicit empty state handling before rendering chart
**Warning signs:** Console errors about accessing properties of undefined

### Pitfall 4: Date Formatting on X-Axis

**What goes wrong:** Dates show as ISO strings or overflow
**Why it happens:** XAxis dataKey receives raw date strings
**How to avoid:** Format dates in data transformation before passing to chart, or use tickFormatter
**Warning signs:** Overlapping date labels, unreadable axis

### Pitfall 5: Score Range Not 0-10

**What goes wrong:** Y-axis auto-scales to data range, looks inconsistent
**Why it happens:** Recharts auto-calculates domain from data
**How to avoid:** Set explicit `domain={[0, 10]}` on YAxis for score charts
**Warning signs:** Small score changes appear as dramatic swings

## Code Examples

Verified patterns for this project:

### Score Trend Line Chart (Client Component)

```typescript
// src/components/dashboard/progress/ScoreTrendChart.tsx
'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { cn } from '@/lib/utils'

interface ScoreTrendData {
  date: string
  score: number
}

interface ScoreTrendChartProps {
  data: ScoreTrendData[]
  className?: string
}

export function ScoreTrendChart({ data, className }: ScoreTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-[300px] text-muted-foreground', className)}>
        No practice sessions yet
      </div>
    )
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={[0, 10]}
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}
          />
          <ReferenceLine y={7} stroke="var(--underdog-gold)" strokeDasharray="5 5" />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--underdog-navy)"
            strokeWidth={2}
            dot={{ fill: 'var(--underdog-navy)', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: 'var(--underdog-gold)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Dimension Radar Chart (Client Component)

```typescript
// src/components/dashboard/progress/DimensionRadarChart.tsx
'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import type { ScoreDimension } from '@/types'

interface DimensionData {
  dimension: string
  score: number
  fullMark: number
}

interface DimensionRadarChartProps {
  data: Record<ScoreDimension, number>
  className?: string
}

const dimensionLabels: Record<ScoreDimension, string> = {
  opener: 'Opener',
  pitch: 'Pitch',
  discovery: 'Discovery',
  objection_handling: 'Objections',
  closing: 'Closing',
  communication: 'Communication'
}

export function DimensionRadarChart({ data, className }: DimensionRadarChartProps) {
  const chartData: DimensionData[] = Object.entries(data).map(([dimension, score]) => ({
    dimension: dimensionLabels[dimension as ScoreDimension],
    score: score,
    fullMark: 10
  }))

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid className="stroke-muted" />
          <PolarAngleAxis
            dataKey="dimension"
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 11 }}
          />
          <Tooltip />
          <Radar
            name="Average Score"
            dataKey="score"
            stroke="var(--underdog-navy)"
            fill="var(--underdog-gold)"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

### Data Aggregation Server Action

```typescript
// src/lib/actions/progress.ts
'use server'

import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import type { ScoreDimension } from '@/types'

export async function getScoreTrends(limit = 20): Promise<{ date: string; score: number }[]> {
  const user = await getUser()
  if (!user) return []

  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('roleplay_sessions')
    .select(`
      created_at,
      session_scores (score)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error || !data) return []

  return data.map(session => {
    const scores = (session.session_scores as Array<{ score: number }>) || []
    const avgScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      : 0

    return {
      date: new Date(session.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      score: Math.round(avgScore * 10) / 10
    }
  })
}

export async function getDimensionAverages(): Promise<Record<ScoreDimension, number>> {
  const user = await getUser()
  if (!user) return {} as Record<ScoreDimension, number>

  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('session_scores')
    .select(`
      dimension,
      score,
      roleplay_sessions!inner (user_id)
    `)
    .eq('roleplay_sessions.user_id', user.id)

  if (error || !data) return {} as Record<ScoreDimension, number>

  // Aggregate by dimension
  const dimensionScores: Record<string, number[]> = {}
  data.forEach((row: { dimension: string; score: number }) => {
    if (!dimensionScores[row.dimension]) {
      dimensionScores[row.dimension] = []
    }
    dimensionScores[row.dimension].push(row.score)
  })

  // Calculate averages
  const averages = {} as Record<ScoreDimension, number>
  Object.entries(dimensionScores).forEach(([dim, scores]) => {
    averages[dim as ScoreDimension] = Math.round(
      (scores.reduce((a, b) => a + b, 0) / scores.length) * 10
    ) / 10
  })

  return averages
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ssr: false dynamic import | 'use client' directive | Next.js 13+ | Simpler, clearer client boundary |
| Fixed chart dimensions | ResponsiveContainer | Recharts 2.x | Responsive by default |
| Chart.js React wrapper | Native Recharts | 2020+ | Better React integration |

**Deprecated/outdated:**
- `react-vis`: Uber's library, maintenance ended
- `victory-chart` v35: Still active but less popular than Recharts in 2025
- canvas-based charts in React: SVG preferred for accessibility, smaller datasets

## Open Questions

Things that couldn't be fully resolved:

1. **Performance with many data points**
   - What we know: Recharts handles small-medium datasets well (100s of points)
   - What's unclear: Performance ceiling for this use case (likely 20-50 sessions)
   - Recommendation: Start with limit of 20-30 sessions for trend chart, add pagination if needed

2. **Custom theme integration**
   - What we know: Recharts accepts CSS variables, project uses Tailwind with CSS variables
   - What's unclear: Best approach for dark mode support (not currently implemented)
   - Recommendation: Use CSS variables (--underdog-navy, --underdog-gold) for colors, future-proofs for dark mode

## Sources

### Primary (HIGH confidence)
- [Recharts npm page](https://www.npmjs.com/package/recharts) - v3.7.0, installation, basic usage
- Existing codebase analysis:
  - `/src/components/curriculum/CurriculumProgress.tsx` - existing progress components
  - `/src/lib/actions/practice-session.ts` - pagination and data aggregation patterns
  - `/supabase/migrations/001_initial_schema.sql` - database schema

### Secondary (MEDIUM confidence)
- [LogRocket React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/) - library comparison
- [Ably Recharts with Next.js](https://ably.com/blog/informational-dashboard-with-nextjs-and-recharts) - server/client patterns
- [Technostacks React Chart Libraries 2026](https://technostacks.com/blog/react-chart-libraries/) - current recommendations

### Tertiary (LOW confidence)
- WebSearch results on radar charts, trends - verified against npm documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Recharts is well-documented, widely used, npm verified
- Architecture: HIGH - Patterns verified against existing codebase and Next.js docs
- Pitfalls: HIGH - Common issues documented in GitHub issues and tutorials

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - Recharts is stable, slow-moving)
