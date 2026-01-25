# Underdog AI Sales Coach

## What This Is

AI-powered sales training platform for Underdog Sales methodology. Combines voice practice with AI personas (now powered by Retell AI), call analysis for uploaded recordings, chat-based coaching with RAG, and a 12-module curriculum. Built for sales professionals learning the Underdog Sales approach.

## Core Value

**Salespeople can practice and improve their skills through realistic AI-powered conversations with immediate, actionable feedback.**

If everything else fails, voice practice with scoring must work.

## Current State

**Version:** v1.0 (shipped 2026-01-25)
**Production:** https://under-eight.vercel.app

MVP complete with:
- Voice practice with 6 AI personas (Retell AI)
- Call analysis with upload and scoring
- Chat coaching with RAG knowledge base
- 12-module Underdog Sales curriculum
- User dashboard with history and progress
- Admin dashboard with users, content, analytics
- Complete technical and user documentation

**Next milestone goals:**
- Enhanced analytics (dimension breakdown, peer benchmarks)
- Admin content editing (personas, rubric via UI)
- Mobile optimization

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

**Sprint 1-6 (Pre-v1.0):**
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

**v1.0 MVP (Phases 1-7):**
- ✓ **DASH-01**: View practice session history with scores — v1.0
- ✓ **DASH-02**: Track curriculum progress visually — v1.0
- ✓ **DASH-03**: View call analysis history — v1.0
- ✓ **DASH-04**: See performance trends over time — v1.0
- ✓ **ADMIN-01**: View all users and their activity — v1.0
- ✓ **ADMIN-02**: Monitor usage metrics (sessions, calls, API) — v1.0
- ✓ **ADMIN-03**: System health overview — v1.0
- ✓ **ADMIN-04**: Content management (view personas, rubric) — v1.0
- ✓ **DOC-01**: Technical documentation (architecture, APIs, deployment) — v1.0
- ✓ **DOC-02**: User guide for end users — v1.0
- ✓ **DOC-03**: Training session materials for handover — v1.0
- ✓ **VOICE-04**: Migrate to Retell AI (cost reduction) — v1.0
- ✓ **VOICE-05**: Feature flag toggle for voice provider — v1.0

### Active

<!-- Next milestone scope. -->

(None — define in `/gsd:new-milestone`)

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
**MVP Deadline:** ~13/03/2026 (shipped 2026-01-25, well ahead of deadline)
**Value:** €4,800 + VAT + 10% revenue share (12 months post-launch)

**Tech Stack:**
- Next.js 16.1.2, React 19, TypeScript
- Supabase (PostgreSQL + Auth + Storage + RLS)
- Retell AI (voice practice, 6 personas)
- OpenRouter (chat coaching LLM)
- Sentry (error tracking + session replay)
- Vercel (hosting)

**Codebase:**
- ~37,000 LOC TypeScript
- 126 files created/modified in v1.0
- 8 documentation files

**Client:** Giulio (GSC Underdog Sales) — sales training methodology creator

## Constraints

- **Deadline**: MVP by ~13/03/2026 — ✓ Shipped early (2026-01-25)
- **Tech Stack**: Next.js + Supabase + Retell + Vercel — Established
- **Budget**: Fixed price contract — No scope creep
- **Handover**: Must include docs + training — ✓ Complete

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Retell AI for voice (v1.0) | 40-50% cost reduction, lower latency | ✓ Good |
| VAPI as fallback | Feature flag toggle for safe migration | ✓ Good |
| OpenRouter for LLM | Flexibility, cost management, fallback options | ✓ Good |
| Supabase for backend | Auth, DB, storage, RLS in one platform | ✓ Good |
| 6 personas with unique voices | Variety in practice scenarios | ✓ Good |
| RAG for chat coaching | Grounds responses in Underdog methodology | ✓ Good |
| Circuit breaker pattern | Prevents cascade failures on external APIs | ✓ Good |
| Hardcoded admin email whitelist | Simple, secure, no DB roundtrip | ✓ Good |
| Content view-only in admin | Editing requires DB migration (v2 scope) | ✓ Acceptable |
| URL-based pagination | Bookmarkable, shareable, browser nav works | ✓ Good |

---
*Last updated: 2026-01-25 after v1.0 milestone*
