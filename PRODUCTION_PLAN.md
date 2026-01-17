# Underdog AI Sales Coach - Production Plan

> **Contract**: Qualia Solutions x GSC Underdog Sales LTD
> **Signed**: 13/01/2026
> **MVP Deadline**: 2 months from commencement (~13/03/2026)
> **Total Value**: €4,800 + VAT + 10% revenue share (12 months)

---

## Executive Summary

Building an AI-powered sales training platform for Giulio Segantini's Underdog Sales methodology. Users practice cold calls with AI prospects, upload real calls for analysis, and progress through a 12-module curriculum.

### Contract Deliverables (Article 9)

| # | Deliverable | Status | Priority |
|---|-------------|--------|----------|
| 1 | AI Sales Coach Agent with voice | 🟢 Done | P0 |
| 2 | Role-play feature for cold calling | 🟢 Done | P0 |
| 3 | Call analysis for uploaded recordings | 🟢 Done | P1 |
| 4 | Custom objection handling library | 🟢 Done | - |
| 5 | 12-module curriculum integration | 🟢 Done | P1 |
| 6 | Admin dashboard for monitoring | 🔴 Not Started | P2 |
| 7 | Complete source code + docs | 🟡 Partial | P2 |
| 8 | AI model configs + prompts | 🟢 Done | - |
| 9 | Technical documentation | 🔴 Not Started | P3 |
| 10 | User guide | 🔴 Not Started | P3 |
| 11 | Training session | 🔴 Not Started | P3 |

---

## Current State Analysis

### What's Built
- Next.js 16 + React 19 + TypeScript (strict mode)
- Supabase PostgreSQL with pgvector for RAG
- 6 AI personas with distinct ElevenLabs voices (via VAPI assistants)
- VAPI integration (web calling) - each persona has dedicated assistant
- Scoring rubric (6 dimensions, 19 criteria)
- Knowledge base with embedding search
- Full VoicePractice component with premium UI
- 12-module curriculum with progress tracking (sequential unlock)
- Text chat coaching (Giulio sales coach)
- Auth system enabled (protected routes)

### ~~Critical Bug: Voice Not Changing Per Persona~~ ✅ FIXED
~~**Problem**: All 6 personas sound like Giulio's voice instead of having distinct voices.~~

**Solution Applied**: Created 6 separate VAPI assistants, one per persona, each with their own ElevenLabs voice. Assistant IDs stored in `src/config/personas.ts`.

### Remaining Features
1. ~~Curriculum module system (12 modules)~~ ✅ Done
2. ~~Call upload + analysis~~ ✅ Done
3. User dashboard with progress tracking ← **Next Priority (P1)**
4. Admin dashboard with analytics
5. Session history and scoring
6. ~~Protected routes (auth gates disabled)~~ ✅ Auth enabled

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UNDERDOG AI SALES COACH                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   PRACTICE   │  │  CURRICULUM  │  │   ANALYZE    │      │
│  │              │  │              │  │              │      │
│  │ Voice calls  │  │ 12 modules   │  │ Upload calls │      │
│  │ 6 personas   │  │ Progress     │  │ Get scores   │      │
│  │ Live scoring │  │ Quizzes      │  │ AI feedback  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│         └────────────────┬┴─────────────────┘               │
│                          │                                  │
│                  ┌───────▼───────┐                         │
│                  │   DASHBOARD   │                         │
│                  │               │                         │
│                  │ Progress      │                         │
│                  │ History       │                         │
│                  │ Analytics     │                         │
│                  └───────────────┘                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        BACKEND                              │
│                                                             │
│  VAPI (6 assistants)  │  Supabase  │  OpenRouter           │
│  ElevenLabs voices    │  pgvector  │  Embeddings           │
│  Deepgram STT         │  Auth/RLS  │  Analysis             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Sprint Plan

### Sprint 1: Fix Voice + Core Practice (P0) ✅ COMPLETE
**Goal**: Working role-play with distinct voices per persona

#### Task 1.1: Create 6 VAPI Assistants
Create one assistant per persona with correct voice:

| Persona | Voice ID | Voice Name |
|---------|----------|------------|
| Sarah Chen (CFO) | 21m00Tcm4TlvDq8ikWAM | Rachel |
| Marcus Johnson (VP Sales) | pNInz6obpgDQGcFmaJgB | Adam |
| Emily Torres (Gatekeeper) | EXAVITQu4vr4xnSDxMaL | Bella |
| David Park (Ops Manager) | TxGEqnHWrfWFTfGW9XjX | Josh |
| Jennifer Walsh (Marketing) | MF3mGyEYCl7XYWbV9V6O | Elli |
| Tony Ricci (Biz Dev) | yoZ06aMxZJJ28mfd3POQ | Sam |

**Files to modify:**
- `src/lib/vapi/client.ts` - Map persona ID to assistant ID
- `src/config/personas.ts` - Add assistantId field
- Create assistants via VAPI API

#### Task 1.2: Update VAPI Client
```typescript
// New approach: select assistant by persona
const PERSONA_ASSISTANTS: Record<PersonaId, string> = {
  skeptical_cfo: 'assistant-id-1',
  busy_vp_sales: 'assistant-id-2',
  // ...
}

export async function startRoleplaySession(options: RoleplaySessionOptions) {
  const assistantId = PERSONA_ASSISTANTS[options.persona.id]
  await vapi.start(assistantId, {
    variableValues: {
      // persona context for system prompt
    }
  })
}
```

#### Task 1.3: Update Each Assistant's System Prompt
Each assistant needs the full roleplay prompt with their specific persona baked in.

**Files:**
- `src/lib/vapi/system-prompt.ts` - Already has template
- Update VAPI dashboard or API for each assistant

#### Task 1.4: Test All 6 Personas
- Verify each has distinct voice
- Verify persona behavior matches config
- Verify objections are appropriate

---

### Sprint 2: Frontend Polish (P0) ✅ COMPLETE
**Goal**: Production-ready UI for practice flow

#### Task 2.1: Redesign Practice Page
Current `VoicePractice.tsx` needs:
- Better persona selection cards
- Scenario selection (5 scenarios)
- Clear call state indicators
- Live transcript display
- Post-call scoring display

**Design:**
```
┌────────────────────────────────────────────────┐
│  PRACTICE                                      │
├────────────────────────────────────────────────┤
│                                                │
│  Select Your Prospect                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ Sarah   │ │ Marcus  │ │ Emily   │          │
│  │ CFO     │ │ VP Sales│ │ EA      │          │
│  │ ⭐⭐    │ │ ⭐⭐⭐  │ │ ⭐      │          │
│  └─────────┘ └─────────┘ └─────────┘          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ David   │ │ Jennifer│ │ Tony    │          │
│  │ Ops Mgr │ │ Dir Mkt │ │ Biz Dev │          │
│  │ ⭐⭐    │ │ ⭐      │ │ ⭐⭐⭐  │          │
│  └─────────┘ └─────────┘ └─────────┘          │
│                                                │
│  Select Scenario                               │
│  ○ Full Cold Call (5 min)                     │
│  ○ Opener Practice (1 min)                    │
│  ○ Objection Gauntlet (3 min)                 │
│  ○ Deep Discovery (4 min)                     │
│  ○ Gatekeeper Navigation (2 min)              │
│                                                │
│           [🎤 Start Practice]                  │
│                                                │
└────────────────────────────────────────────────┘
```

**Files:**
- `src/app/practice/page.tsx` - Main practice page
- `src/components/voice/VoicePractice.tsx` - Refactor
- `src/components/voice/PersonaCard.tsx` - New
- `src/components/voice/ScenarioSelector.tsx` - New
- `src/components/voice/CallInterface.tsx` - New
- `src/components/voice/TranscriptView.tsx` - New
- `src/components/voice/ScoreCard.tsx` - New

#### Task 2.2: Landing Page Update
- Update hero to match Underdog branding
- Add feature sections
- Add pricing/CTA
- Mobile responsive

**Files:**
- `src/app/page.tsx`
- `src/components/landing/*` - New components

#### Task 2.3: Navigation + Layout
- Header with nav
- Footer
- Auth state in header
- Mobile menu

---

### Sprint 3: Curriculum System (P1) ✅ COMPLETE
**Goal**: 12-module training curriculum with progress tracking

#### Task 3.1: Create Curriculum Config
Based on Giulio's 12-module cold calling course:

```typescript
// src/config/curriculum.ts
export const CURRICULUM_MODULES = [
  {
    id: 1,
    name: 'The Underdog Mindset',
    description: 'Foundation principles of effective cold calling',
    topics: ['mindset', 'psychology', 'attitude'],
    content: '...',
    practicePersonas: ['skeptical_cfo'],
    quizQuestions: [...],
  },
  // ... modules 2-12
]
```

#### Task 3.2: Curriculum Pages
- `/curriculum` - Module overview grid
- `/curriculum/[moduleId]` - Module content + video
- `/curriculum/[moduleId]/practice` - Module-specific practice
- `/curriculum/[moduleId]/quiz` - Module quiz

**Files:**
- `src/app/curriculum/page.tsx`
- `src/app/curriculum/[moduleId]/page.tsx`
- `src/components/curriculum/ModuleCard.tsx`
- `src/components/curriculum/ProgressBar.tsx`
- `src/components/curriculum/QuizComponent.tsx`

#### Task 3.3: Progress Tracking
- Track module completion
- Track quiz scores
- Track practice sessions per module
- Unlock next module logic

**Database:**
- `curriculum_progress` table (already exists)
- Add `module_practice_sessions` junction table

---

### Sprint 4: Call Analysis (P1) ✅ COMPLETE
**Goal**: Upload real call recordings for AI analysis

#### Task 4.1: Upload Infrastructure
- Supabase Storage bucket for recordings
- File upload component
- Audio processing (format validation)

**Files:**
- `src/app/analyze/page.tsx`
- `src/components/analyze/UploadZone.tsx`
- `src/app/api/analyze/upload/route.ts`

#### Task 4.2: Transcription Pipeline
- Send audio to Deepgram/Whisper
- Store transcript
- Diarization (speaker detection)

**Files:**
- `src/app/api/analyze/transcribe/route.ts`
- `src/lib/transcription/deepgram.ts`

#### Task 4.3: AI Scoring Engine
- Analyze transcript against rubric
- Generate dimension scores (1-10)
- Generate specific feedback with timestamps
- Identify strengths/improvements

**Files:**
- `src/lib/scoring/engine.ts` (exists, needs work)
- `src/app/api/analyze/score/route.ts`

#### Task 4.4: Results Display
- Score breakdown by dimension
- Transcript with annotations
- Key moments highlighted
- Actionable recommendations

**Files:**
- `src/app/analyze/[callId]/page.tsx`
- `src/components/analyze/ScoreBreakdown.tsx`
- `src/components/analyze/AnnotatedTranscript.tsx`

---

### Sprint 5: User Dashboard (P1)
**Goal**: Personal progress and history

#### Task 5.1: Dashboard Page
- Overall score trend
- Sessions this week/month
- Dimension radar chart
- Recent sessions list
- Curriculum progress

**Files:**
- `src/app/dashboard/page.tsx`
- `src/components/dashboard/ScoreTrend.tsx`
- `src/components/dashboard/DimensionRadar.tsx`
- `src/components/dashboard/SessionHistory.tsx`
- `src/components/dashboard/CurriculumProgress.tsx`

#### Task 5.2: Session History
- List all past sessions
- Filter by persona/scenario
- View individual session details
- Replay transcript

**Files:**
- `src/app/dashboard/history/page.tsx`
- `src/app/dashboard/history/[sessionId]/page.tsx`

#### Task 5.3: Enable Auth
- Uncomment auth gates in middleware
- Add login/signup flows
- Profile page

**Files:**
- `middleware.ts`
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/profile/page.tsx`

---

### Sprint 6: Admin Dashboard (P2)
**Goal**: Giulio's team can monitor usage and performance

#### Task 6.1: Admin Layout
- Separate `/admin` route group
- Admin-only middleware check
- Admin navigation

**Files:**
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`

#### Task 6.2: User Management
- List all users
- View user details
- View user progress
- Invite users (future)

**Files:**
- `src/app/admin/users/page.tsx`
- `src/app/admin/users/[userId]/page.tsx`

#### Task 6.3: Analytics Dashboard
- Total sessions
- Active users (7d/30d)
- Average scores by dimension
- Top performers leaderboard
- Usage trends

**Files:**
- `src/app/admin/analytics/page.tsx`
- `src/components/admin/UsageChart.tsx`
- `src/components/admin/Leaderboard.tsx`

#### Task 6.4: Content Management
- Edit personas (warmth, objections)
- Edit curriculum content
- View knowledge base

---

### Sprint 7: Polish + Documentation (P3)
**Goal**: Production-ready for handover

#### Task 7.1: Testing
- Unit tests for scoring engine
- Integration tests for API routes
- E2E tests for practice flow
- E2E tests for analysis flow

#### Task 7.2: Performance
- Implement remaining Tier 2 optimizations
- Lighthouse audit (target 90+)
- Bundle size optimization

#### Task 7.3: Documentation
- Technical documentation
- User guide
- Admin guide
- API documentation

#### Task 7.4: Deployment
- Production environment setup
- Environment variables
- Domain configuration
- SSL/security

---

## File Structure (Target)

```
src/
├── app/
│   ├── page.tsx                    # Landing
│   ├── layout.tsx                  # Root layout
│   ├── globals.css
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   │
│   ├── (protected)/
│   │   ├── layout.tsx              # Auth check
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # User dashboard
│   │   │   └── history/
│   │   │       ├── page.tsx
│   │   │       └── [sessionId]/page.tsx
│   │   │
│   │   ├── practice/
│   │   │   └── page.tsx            # Role-play practice
│   │   │
│   │   ├── curriculum/
│   │   │   ├── page.tsx            # Module grid
│   │   │   └── [moduleId]/
│   │   │       ├── page.tsx        # Module content
│   │   │       ├── practice/page.tsx
│   │   │       └── quiz/page.tsx
│   │   │
│   │   ├── analyze/
│   │   │   ├── page.tsx            # Upload page
│   │   │   └── [callId]/page.tsx   # Results
│   │   │
│   │   └── profile/page.tsx
│   │
│   ├── admin/
│   │   ├── layout.tsx              # Admin check
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [userId]/page.tsx
│   │   └── analytics/page.tsx
│   │
│   └── api/
│       ├── vapi/webhook/route.ts
│       ├── knowledge/search/route.ts
│       ├── analyze/
│       │   ├── upload/route.ts
│       │   ├── transcribe/route.ts
│       │   └── score/route.ts
│       └── admin/
│           └── stats/route.ts
│
├── components/
│   ├── ui/                         # Base components
│   ├── providers/
│   ├── landing/
│   ├── voice/
│   │   ├── PersonaCard.tsx
│   │   ├── ScenarioSelector.tsx
│   │   ├── CallInterface.tsx
│   │   ├── TranscriptView.tsx
│   │   └── ScoreCard.tsx
│   ├── curriculum/
│   │   ├── ModuleCard.tsx
│   │   ├── ProgressBar.tsx
│   │   └── QuizComponent.tsx
│   ├── analyze/
│   │   ├── UploadZone.tsx
│   │   ├── ScoreBreakdown.tsx
│   │   └── AnnotatedTranscript.tsx
│   ├── dashboard/
│   │   ├── ScoreTrend.tsx
│   │   ├── DimensionRadar.tsx
│   │   └── SessionHistory.tsx
│   └── admin/
│       ├── UsageChart.tsx
│       └── Leaderboard.tsx
│
├── config/
│   ├── personas.ts                 # 6 personas + assistant IDs
│   ├── rubric.ts                   # Scoring rubric
│   ├── curriculum.ts               # 12 modules
│   └── vapi-assistant.ts           # VAPI configs
│
├── lib/
│   ├── supabase/
│   ├── vapi/
│   ├── scoring/
│   └── transcription/
│
└── types/
    └── index.ts
```

---

## VAPI Assistant Setup

### Create 6 Assistants

For each persona, create a VAPI assistant with:

**Model:**
```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "temperature": 0.8,
  "systemPrompt": "[PERSONA-SPECIFIC PROMPT]"
}
```

**Voice:**
```json
{
  "provider": "11labs",
  "voiceId": "[PERSONA VOICE ID]",
  "model": "eleven_turbo_v2_5"
}
```

**Transcriber:**
```json
{
  "provider": "deepgram",
  "model": "nova-3"
}
```

**Tools:**
- `search_knowledge` - RAG lookup

**Variable Template in System Prompt:**
```
You are {{persona_name}}, a {{persona_role}}.
Warmth: {{persona_warmth}}
Scenario: {{scenario_type}}
```

---

## Database Schema Updates

### New Tables Needed

```sql
-- Module practice sessions
CREATE TABLE module_practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  module_id INTEGER NOT NULL,
  session_id UUID REFERENCES roleplay_sessions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call uploads (exists but needs updates)
ALTER TABLE call_uploads ADD COLUMN status TEXT DEFAULT 'pending';
ALTER TABLE call_uploads ADD COLUMN error_message TEXT;
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# VAPI
NEXT_PUBLIC_VAPI_PUBLIC_KEY=
VAPI_PRIVATE_KEY=

# OpenRouter (for embeddings)
OPENROUTER_API_KEY=

# Deepgram (for transcription)
DEEPGRAM_API_KEY=

# ElevenLabs (managed by VAPI)
# No direct key needed
```

---

## Workflow Commands

Use these Claude Code skills throughout development:

```bash
# Planning
/workflows:plan "Sprint 1 - Fix voice per persona"

# Execution
/workflows:work plans/sprint-1-voice-fix.md

# Review
/workflows:review

# Document learnings
/workflows:compound
```

---

## Success Criteria

### MVP Acceptance (Contract Article 5)

- [ ] Users can log in and access dashboard
- [ ] Users can practice with 6 distinct AI personas (different voices)
- [ ] Users can select from 5 scenario types
- [ ] Live transcript displays during call
- [ ] Post-call scoring with 6 dimensions
- [ ] Users can upload call recordings
- [ ] Uploaded calls are transcribed and scored
- [ ] 12-module curriculum is accessible
- [ ] Progress is tracked across modules
- [ ] Admin can view user analytics
- [ ] Mobile responsive design
- [ ] Performance: Lighthouse 90+

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| VAPI voice override doesn't work | Create separate assistants per persona |
| Transcription quality | Test multiple providers (Deepgram, Whisper) |
| Scoring accuracy | Iterate prompts, add examples, human review |
| Performance issues | Follow optimization plan, lazy load |
| Curriculum content missing | Request from Giulio per contract 8(a) |

---

## Next Steps

1. **Immediate**: Fix voice bug by creating 6 VAPI assistants
2. **This week**: Complete Sprint 1 (voice) + Sprint 2 (frontend polish)
3. **Week 2-3**: Sprint 3 (curriculum) + Sprint 4 (call analysis)
4. **Week 4**: Sprint 5 (dashboard) + Sprint 6 (admin)
5. **Week 5-6**: Sprint 7 (polish) + testing + documentation
6. **Week 7-8**: UAT with Giulio, bug fixes, deployment

---

*Plan created: 2026-01-17*
*Last updated: 2026-01-17 - Sprint 4 Complete*
