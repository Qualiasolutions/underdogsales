---
phase: 04
plan: 02
subsystem: admin-analytics
tags: [recharts, area-chart, system-health, circuit-breakers]
requires: ["04-01"]
provides: ["usage-charts", "system-health-monitoring"]
affects: []
tech-stack:
  added: []
  patterns: ["server-action-fetch", "circuit-breaker-stats"]
key-files:
  created:
    - src/components/admin/UsageCharts.tsx
    - src/components/admin/SystemHealth.tsx
  modified:
    - src/lib/actions/admin.ts
    - src/app/admin/analytics/page.tsx
decisions:
  - id: area-chart-dual-series
    summary: "Two Area elements for sessions and calls with distinct colors"
metrics:
  duration: "~15 minutes"
  completed: "2026-01-25"
---

# Phase 04 Plan 02: Usage Charts & System Health Summary

**AreaChart for activity trends (sessions/calls) and system health panel displaying service statuses and circuit breaker states**

## Accomplishments

- UsageCharts component displays dual-series AreaChart for sessions (navy) and calls (gold) over time
- Empty data state shows centered message instead of crashing
- getSystemHealth server action fetches /api/health and aggregates circuit breaker stats
- SystemHealth component displays service status badges (healthy/degraded/unhealthy) with latency
- Circuit breaker states shown with color-coded indicators (closed=green, open=red, half-open=yellow)
- Analytics page grid layout: UsageCharts (2/3 width), SystemHealth (1/3 width)

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create UsageCharts component | 25e3c00 | src/components/admin/UsageCharts.tsx |
| 2 | Add getSystemHealth server action | 33d3302 | src/lib/actions/admin.ts |
| 3 | Create SystemHealth component and update analytics page | 9bcf2ca | src/components/admin/SystemHealth.tsx, src/app/admin/analytics/page.tsx |

## Files Created/Modified

### Created
- `src/components/admin/UsageCharts.tsx` - 'use client' Recharts AreaChart with legend and empty state
- `src/components/admin/SystemHealth.tsx` - Server component for health display with StatusBadge helper

### Modified
- `src/lib/actions/admin.ts` - Added getSystemHealth server action with circuit breaker imports
- `src/app/admin/analytics/page.tsx` - Integrated UsageCharts and SystemHealth in grid layout

## Technical Details

### UsageCharts Component
- Uses ResponsiveContainer with height={300}
- AreaChart with CartesianGrid, XAxis, YAxis, Tooltip
- Two Area elements: sessions (navy, 30% opacity) and calls (gold, 30% opacity)
- Custom legend with color indicators below chart

### getSystemHealth Action
- Verifies admin access using existing pattern
- Fetches /api/health with cache: 'no-store' and 5s timeout
- Aggregates stats from all 4 circuit breakers (OpenAI, OpenRouter, VAPI, Supabase)
- Returns partial data if health check fails (circuit breakers still available)

### SystemHealth Component
- Server component (no 'use client')
- StatusBadge helper with green/yellow/red color coding
- CircuitBreakerState helper for breaker state colors
- Displays latency in parentheses when available

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Dual Area elements instead of stacked | Overlapping areas show correlation between sessions and calls |
| Server component for SystemHealth | Minimizes client JS, health data fetched server-side |
| 5s timeout for health fetch | Prevents blocking page load if health endpoint is slow |
| Always return circuit breaker stats | Stats are local (no network), always available even if health fails |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- TypeScript: PASS
- ESLint (new files): PASS
- Build: PASS
- Must-haves verified:
  - UsageCharts: 100 lines (min 50)
  - SystemHealth: 113 lines (min 40)
  - UsageCharts imports from 'recharts'
  - Analytics page imports UsageCharts
  - SystemHealth uses getSystemHealth

## Phase 4 Completion

With this plan complete, all Phase 4 requirements are met:

- **ADMIN-02**: Platform usage analytics with trend visualization
  - MetricsCards show totals (from 04-01)
  - UsageCharts shows activity over time

- **ADMIN-03**: System health monitoring
  - Service status for Supabase, OpenAI, OpenRouter
  - Circuit breaker states for all 4 breakers

## Next Phase Readiness

Phase 4 (Admin Dashboard - Analytics) is complete. Ready to proceed with Phase 5 (Technical Documentation).
