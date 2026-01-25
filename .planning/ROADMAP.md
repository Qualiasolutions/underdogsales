# Roadmap: MVP Completion (v1.0)

**Milestone:** MVP Completion
**Target:** ~13/03/2026
**Core Value:** Salespeople can practice and improve their skills through realistic AI-powered conversations with immediate, actionable feedback.

## Phase Overview

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 1 | User Dashboard - History | DASH-01, DASH-03 | ✓ Complete |
| 2 | User Dashboard - Progress | DASH-02, DASH-04 | ✓ Complete |
| 3 | Admin Dashboard - Users | ADMIN-01, ADMIN-04 | ✓ Complete |
| 4 | Admin Dashboard - Analytics | ADMIN-02, ADMIN-03 | ○ Pending |
| 5 | Technical Documentation | DOC-01 | ○ Pending |
| 6 | User Guide & Handover | DOC-02, DOC-03 | ○ Pending |
| 7 | Voice Platform Migration | VOICE-01, VOICE-02 | ○ Pending |

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
- [x] 02-01-PLAN.md — Data layer (server actions + recharts)
- [x] 02-02-PLAN.md — Progress UI (charts + tab)

**Success Criteria:**
- [x] Curriculum progress bar/chart showing completion
- [x] Module breakdown with status indicators
- [x] Score trend chart (practice sessions over time)
- [x] Average score by dimension breakdown

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

**Plans:** 3 plans

Plans:
- [x] 03-01-PLAN.md — Infrastructure (admin config, server actions, middleware, debounce hook)
- [x] 03-02-PLAN.md — User Management UI (layout, user list, user detail)
- [x] 03-03-PLAN.md — Content Management UI (personas, rubric)

**Success Criteria:**
- [x] Admin-only route with auth check
- [x] User list with search/filter
- [x] User detail view (activity, sessions)
- [x] Personas list with full configuration visibility
- [x] Rubric configuration visibility

**Key Files:**
- `src/config/admin.ts` (new)
- `src/lib/actions/admin.ts` (new)
- `src/lib/hooks/use-debounce.ts` (new)
- `src/app/admin/layout.tsx` (new)
- `src/app/admin/page.tsx` (new)
- `src/app/admin/users/page.tsx` (new)
- `src/app/admin/users/[userId]/page.tsx` (new)
- `src/app/admin/content/page.tsx` (new)
- `src/app/admin/content/personas/page.tsx` (new)
- `src/app/admin/content/rubric/page.tsx` (new)
- `src/components/admin/*.tsx` (10 components)

---

## Phase 4: Admin Dashboard - Analytics

**Goal:** Admins can monitor platform usage and system health.

**Requirements:**
- ADMIN-02: Usage metrics (sessions, calls, users)
- ADMIN-03: System health overview

**Plans:** 2 plans

Plans:
- [ ] 04-01-PLAN.md — Analytics data layer + metrics cards
- [ ] 04-02-PLAN.md — Usage charts + system health

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

## Phase 7: Voice Platform Migration

**Goal:** Migrate voice practice from VAPI to Retell AI for better pricing and voice realism.

**Requirements:**
- VOICE-01: Create Retell agents matching existing VAPI personas
- VOICE-02: Integrate Retell SDK and webhook into application

**Plans:** 2 plans

Plans:
- [ ] 07-01-PLAN.md — Core infrastructure (Retell SDK, types, client library, webhook)
- [ ] 07-02-PLAN.md — Integration (register endpoint, VoicePractice component, feature flag)

**Success Criteria:**
- [ ] 7 Retell agents created (Giulio coach + 6 roleplay personas)
- [ ] Retell webhook endpoint functional
- [ ] Web client uses Retell SDK
- [ ] Voice practice works end-to-end with Retell
- [ ] Feature flag to toggle VAPI/Retell (optional)
- [ ] VAPI assistants deprecated after validation

**Key Files:**
- `src/app/api/retell/webhook/route.ts` (new)
- `src/app/api/retell/register/route.ts` (new)
- `src/lib/retell/client.ts` (new)
- `src/lib/retell/auth.ts` (new)
- `src/components/voice/VoicePractice.tsx` (modify)
- `src/config/personas.ts` (modify - add Retell agent IDs)

**Migration Scope:**
| VAPI Assistant | Retell Agent |
|----------------|--------------|
| Giulio Segantini - Underdog Sales Coach | → Retell coach agent |
| Tony Ricci (Sales Director) | → Retell persona |
| Lisa Martinez (Head of Ops) | → Retell persona |
| David Park (Ops Mgr) | → Retell persona |
| Emily Torres (EA) | → Retell persona |
| Marcus Johnson (VP Sales) | → Retell persona |
| Sarah Chen (CFO) | → Retell persona |

**Benefits:**
- ~40-50% cost reduction (~$0.07-0.10/min vs $0.15-0.20/min)
- Lower latency voice pipeline
- Better interruption handling
- More natural conversation flow

---

## Dependencies

```
Phase 1 ─┬─► Phase 2 (needs session data structures)
         │
Phase 3 ─┴─► Phase 4 (needs admin routes)
         │
Phase 5 ─┬─► Phase 6 (tech docs inform user guide)

Phase 7 (independent - can start anytime after Phase 4)
```

Phases 1-2 and 3-4 can run in parallel.
Phases 5-6 depend on features being complete.
Phase 7 can run in parallel with Phases 5-6 (no dependencies).

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | Deadline miss | Strict adherence to requirements |
| API rate limits | Feature degradation | Existing circuit breaker handles this |
| Client feedback loops | Delays | Async reviews, batch feedback |
| Voice platform migration | Service disruption | Feature flag toggle, parallel operation |

---
*Roadmap created: 2026-01-23*
*Last updated: 2026-01-25 — Phase 7 added (Retell migration)*
