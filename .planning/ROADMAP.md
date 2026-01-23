# Roadmap: MVP Completion (v1.0)

**Milestone:** MVP Completion
**Target:** ~13/03/2026
**Core Value:** Salespeople can practice and improve their skills through realistic AI-powered conversations with immediate, actionable feedback.

## Phase Overview

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 1 | User Dashboard - History | DASH-01, DASH-03 | ✓ Complete |
| 2 | User Dashboard - Progress | DASH-02, DASH-04 | ○ Pending |
| 3 | Admin Dashboard - Users | ADMIN-01, ADMIN-04 | ○ Pending |
| 4 | Admin Dashboard - Analytics | ADMIN-02, ADMIN-03 | ○ Pending |
| 5 | Technical Documentation | DOC-01 | ○ Pending |
| 6 | User Guide & Handover | DOC-02, DOC-03 | ○ Pending |

---

## Phase 1: User Dashboard - History

**Goal:** Users can view their practice session history and call analysis history.

**Requirements:**
- DASH-01: View past practice sessions with date, persona, score
- DASH-03: View call analysis history with scores

**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Foundation (nav link + server action pagination)
- [x] 01-02-PLAN.md — Dashboard UI (page + history components)

**Success Criteria:**
- [x] Dashboard page accessible from main navigation
- [x] Practice sessions list with pagination
- [x] Call analyses list with pagination
- [x] Click to view session/analysis details
- [x] Empty states for users with no history

**Key Files:**
- `src/app/dashboard/page.tsx` (new)
- `src/components/dashboard/DashboardClient.tsx` (new)
- `src/components/dashboard/SessionHistoryCard.tsx` (new)
- `src/components/dashboard/CallHistoryCard.tsx` (new)

---

## Phase 2: User Dashboard - Progress

**Goal:** Users can track their curriculum progress and see performance trends.

**Requirements:**
- DASH-02: Curriculum progress visualization
- DASH-04: Performance trends over time

**Plans:** 2 plans

Plans:
- [ ] 02-01-PLAN.md — Data layer (server actions + recharts)
- [ ] 02-02-PLAN.md — Progress UI (charts + tab)

**Success Criteria:**
- [ ] Curriculum progress bar/chart showing completion
- [ ] Module breakdown with status indicators
- [ ] Score trend chart (practice sessions over time)
- [ ] Average score by dimension breakdown

**Key Files:**
- `src/lib/actions/progress.ts` (new)
- `src/lib/actions/curriculum.ts` (new)
- `src/components/dashboard/progress/ScoreTrendChart.tsx` (new)
- `src/components/dashboard/progress/DimensionRadarChart.tsx` (new)
- `src/components/dashboard/progress/CurriculumProgressCard.tsx` (new)
- `src/components/dashboard/progress/ModuleBreakdown.tsx` (new)

---

## Phase 3: Admin Dashboard - Users

**Goal:** Admins can view and manage users and content.

**Requirements:**
- ADMIN-01: View all users with activity
- ADMIN-04: Content management (personas, rubric)

**Success Criteria:**
- [ ] Admin-only route with auth check
- [ ] User list with search/filter
- [ ] User detail view (activity, sessions)
- [ ] Personas list with view/edit capability
- [ ] Rubric configuration view/edit

**Key Files:**
- `src/app/admin/page.tsx` (new)
- `src/app/admin/users/page.tsx` (new)
- `src/app/admin/content/page.tsx` (new)
- `src/components/admin/UserList.tsx` (new)

---

## Phase 4: Admin Dashboard - Analytics

**Goal:** Admins can monitor platform usage and system health.

**Requirements:**
- ADMIN-02: Usage metrics (sessions, calls, users)
- ADMIN-03: System health overview

**Success Criteria:**
- [ ] Dashboard with key metrics cards
- [ ] Charts: sessions/day, calls/day, active users
- [ ] System status indicators (Supabase, VAPI, OpenAI)
- [ ] Recent errors list from logs

**Key Files:**
- `src/app/admin/analytics/page.tsx` (new)
- `src/components/admin/MetricsCards.tsx` (new)
- `src/components/admin/UsageCharts.tsx` (new)
- `src/components/admin/SystemHealth.tsx` (new)

---

## Phase 5: Technical Documentation

**Goal:** Complete technical documentation for handover.

**Requirements:**
- DOC-01: Technical documentation (architecture, APIs, deployment)

**Success Criteria:**
- [ ] Architecture overview document
- [ ] API reference (all endpoints documented)
- [ ] Deployment guide (Vercel, env vars, Supabase)
- [ ] Database schema documentation
- [ ] Integration guide (VAPI, OpenRouter, Sentry)

**Deliverables:**
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DEPLOYMENT.md`
- `docs/DATABASE.md`
- `docs/INTEGRATIONS.md`

---

## Phase 6: User Guide & Handover

**Goal:** Complete user documentation and prepare for client handover.

**Requirements:**
- DOC-02: User guide for end users
- DOC-03: Training session materials

**Success Criteria:**
- [ ] User guide covering all features
- [ ] Screenshots/walkthroughs for key flows
- [ ] FAQ/troubleshooting section
- [ ] Training presentation/agenda
- [ ] Handover checklist completed

**Deliverables:**
- `docs/USER_GUIDE.md`
- `docs/TRAINING.md`
- `docs/HANDOVER_CHECKLIST.md`

---

## Dependencies

```
Phase 1 ─┬─► Phase 2 (needs session data structures)
         │
Phase 3 ─┴─► Phase 4 (needs admin routes)
         │
Phase 5 ─┬─► Phase 6 (tech docs inform user guide)
```

Phases 1-2 and 3-4 can run in parallel.
Phases 5-6 depend on features being complete.

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | Deadline miss | Strict adherence to requirements |
| API rate limits | Feature degradation | Existing circuit breaker handles this |
| Client feedback loops | Delays | Async reviews, batch feedback |

---
*Roadmap created: 2026-01-23*
*Last updated: 2026-01-23 — Phase 2 planned*
