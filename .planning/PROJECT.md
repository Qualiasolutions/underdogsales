# Underdog AI Sales Coach

## What This Is

AI-powered sales training platform for Underdog Sales methodology. Combines voice practice with AI personas, call analysis for uploaded recordings, chat-based coaching with RAG, and a 12-module curriculum. Built for sales professionals learning the Underdog Sales approach.

## Core Value

**Salespeople can practice and improve their skills through realistic AI-powered conversations with immediate, actionable feedback.**

If everything else fails, voice practice with scoring must work.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ **VOICE-01**: AI Sales Coach with 6 distinct personas — Sprint 1
- ✓ **VOICE-02**: Role-play for cold calling scenarios — Sprint 1
- ✓ **VOICE-03**: Voice per persona (unique ElevenLabs voices) — Sprint 1
- ✓ **CALL-01**: Upload and transcribe call recordings — Sprint 4
- ✓ **CALL-02**: AI scoring against 6-dimension rubric — Sprint 4
- ✓ **CALL-03**: Detailed feedback with specific improvements — Sprint 4
- ✓ **CURR-01**: 12-module curriculum with progress tracking — Sprint 3
- ✓ **CURR-02**: Module completion and lesson navigation — Sprint 3
- ✓ **CHAT-01**: Chat coaching with RAG knowledge base — Sprint 2
- ✓ **CHAT-02**: Context-aware responses using Underdog methodology — Sprint 2
- ✓ **INFRA-01**: Rate limiting and input validation — Sprint 5
- ✓ **INFRA-02**: Resilient API calls with retry logic — Sprint 6
- ✓ **INFRA-03**: Sentry error tracking and session replay — Sprint 5

### Active

<!-- Current scope. Building toward these. -->

**User Dashboard**
- [ ] **DASH-01**: View practice session history with scores
- [ ] **DASH-02**: Track curriculum progress visually
- [ ] **DASH-03**: View call analysis history
- [ ] **DASH-04**: See performance trends over time

**Admin Dashboard**
- [ ] **ADMIN-01**: View all users and their activity
- [ ] **ADMIN-02**: Monitor usage metrics (sessions, calls, API)
- [ ] **ADMIN-03**: System health overview
- [ ] **ADMIN-04**: Content management (personas, rubric config)

**Documentation**
- [ ] **DOC-01**: Technical documentation (architecture, APIs, deployment)
- [ ] **DOC-02**: User guide for end users
- [ ] **DOC-03**: Training session materials for handover

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Real-time multiplayer role-play — Complexity, not in contract
- Mobile native app — Web-first per contract, mobile can come post-MVP
- Payment/subscription integration — Giulio handles billing externally
- Multi-tenant/white-label — Single client deployment for v1
- Video recording/analysis — Audio only per contract scope
- Custom LLM fine-tuning — Using OpenAI/OpenRouter APIs

## Context

**Contract:** Qualia Solutions × GSC Underdog Sales LTD
**Signed:** 13/01/2026
**MVP Deadline:** ~13/03/2026 (7 weeks from today)
**Value:** €4,800 + VAT + 10% revenue share (12 months post-launch)

**Current State:**
- Core features complete (voice practice, call analysis, curriculum, chat)
- 6 sprints completed focusing on features and reliability
- Production deployed at under-eight.vercel.app
- Missing: user/admin dashboards, documentation, handover

**Client:** Giulio (GSC Underdog Sales) — sales training methodology creator

## Constraints

- **Deadline**: MVP by ~13/03/2026 — Contract obligation
- **Tech Stack**: Next.js + Supabase + VAPI + Vercel — Already established
- **Budget**: Fixed price contract — No scope creep
- **Handover**: Must include docs + training — Client will maintain

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| VAPI for voice | Best-in-class voice AI, ElevenLabs integration | ✓ Good |
| OpenRouter for LLM | Flexibility, cost management, fallback options | ✓ Good |
| Supabase for backend | Auth, DB, storage, RLS in one platform | ✓ Good |
| 6 personas with unique voices | Variety in practice scenarios | ✓ Good |
| RAG for chat coaching | Grounds responses in Underdog methodology | ✓ Good |
| Circuit breaker pattern | Prevents cascade failures on external APIs | ✓ Good |

---
*Last updated: 2026-01-23 after contract review and milestone planning*
