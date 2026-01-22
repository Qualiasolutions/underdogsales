# Codebase Structure

**Analysis Date:** 2026-01-23

## Directory Layout

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API route handlers (RESTful endpoints)
│   │   ├── analyze/       # Call upload, transcription, scoring endpoints
│   │   ├── chat/          # Chat coaching API
│   │   ├── health/        # Service health check
│   │   ├── knowledge/     # RAG knowledge base search
│   │   ├── user/          # User data export, deletion
│   │   └── vapi/          # VAPI integration (webhook, tools)
│   ├── analyze/           # Call upload & analysis pages
│   ├── auth/              # Auth callback (OAuth redirects)
│   ├── chat/              # Chat coaching page
│   ├── coach/             # Coach landing page
│   ├── curriculum/        # Curriculum module pages
│   ├── login/             # Login page
│   ├── practice/          # Voice practice pages
│   ├── signup/            # Signup page
│   ├── error.tsx          # Error boundary
│   ├── global-error.tsx   # Global error handler
│   ├── globals.css        # Global styles (Tailwind)
│   ├── layout.tsx         # Root layout with AuthProvider, fonts, Sentry, Analytics
│   ├── page.tsx           # Home/landing page
│   └── robots.ts          # SEO robots.txt
├── components/            # React components by feature
│   ├── analyze/           # Call upload/analysis UI components
│   ├── chat/              # Chat coaching components
│   ├── curriculum/        # Curriculum display components
│   ├── providers/         # Context providers (AuthProvider)
│   ├── ui/                # Reusable UI primitives (button, card, badge, motion)
│   └── voice/             # Voice practice components (VoicePractice, VoiceCoach)
├── config/                # Immutable configuration objects
│   ├── coach.ts           # Coach system prompts
│   ├── curriculum.ts      # Curriculum module definitions
│   ├── personas.ts        # AI personas (prospects)
│   └── rubric.ts          # Scoring rubric dimensions & criteria
├── lib/                   # Business logic and utilities
│   ├── actions/           # Server actions (secure DB operations)
│   │   ├── call-analysis.ts   # Call upload queries (get, delete)
│   │   ├── curriculum.ts      # Curriculum progress tracking
│   │   └── practice-session.ts # Save session, fetch results
│   ├── scoring/           # Call scoring engine
│   │   └── engine.ts      # analyzeTranscript logic (6 dimensions)
│   ├── supabase/          # Database and auth clients
│   │   ├── admin.ts       # Admin client (bypasses RLS)
│   │   ├── client.ts      # Client-side browser client
│   │   ├── server.ts      # Server client (for RSC, SSR)
│   │   └── types.ts       # Generated TypeScript types from DB schema
│   ├── transcription/     # Audio transcription
│   │   └── whisper.ts     # OpenAI Whisper API integration
│   ├── vapi/              # VAPI voice AI integration
│   │   ├── auth.ts        # Webhook signature verification
│   │   ├── client.ts      # VAPI SDK client (start/stop calls)
│   │   ├── giulio-prompt.ts   # Giulio coach persona prompt
│   │   └── system-prompt.ts   # Default VAPI assistant prompt
│   ├── circuit-breaker.ts # Fault tolerance for external services
│   ├── errors.ts          # Custom error types and handlers
│   ├── fetch-utils.ts     # HTTP utility functions
│   ├── knowledge.ts       # RAG knowledge base search (pgvector)
│   ├── logger.ts          # Structured logging with Sentry integration
│   ├── rate-limit.ts      # Token bucket rate limiting
│   ├── retry.ts           # Exponential backoff retry logic
│   ├── utils.ts           # General utilities
│   └── validations.ts     # Input validation schemas & validator
├── types/                 # TypeScript type definitions
│   └── index.ts           # Core domain types (Persona, RoleplaySession, CallAnalysis, etc.)
└── middleware.ts          # Request middleware (request ID generation)
```

## Directory Purposes

**src/app:**
- Purpose: All page and API routes (Next.js App Router structure)
- Contains: Page components (TSX), API handlers (TS), layouts, error boundaries
- Key files: `layout.tsx` (root wrapper), `page.tsx` (home), `error.tsx` (error boundary)

**src/app/api:**
- Purpose: RESTful API endpoints consumed by client and webhooks
- Contains: Grouped by domain (analyze, chat, vapi, health, knowledge, user)
- Pattern: Each endpoint validates auth, input, then delegates to business logic layer
- Key files: `/analyze/upload`, `/analyze/transcribe`, `/analyze/score`, `/vapi/webhook`, `/chat`

**src/app/analyze:**
- Purpose: Pages for uploading and reviewing call analysis
- Contains: Upload form, results display, call detail view
- Key files: `page.tsx` (upload UI), `[callId]/page.tsx` (results view)

**src/app/practice:**
- Purpose: Voice practice pages
- Contains: Persona/scenario selection, real-time practice UI, session results
- Key files: `page.tsx` (VoicePractice component), `results/[sessionId]/page.tsx`

**src/app/curriculum:**
- Purpose: Learning modules and progress tracking
- Contains: Module list, module detail view
- Key files: `page.tsx` (curriculum index), `[moduleId]/page.tsx` (module view)

**src/app/chat:**
- Purpose: RAG-powered chat coaching
- Contains: Chat interface with message history, LLM responses
- Key files: `page.tsx` (chat UI)

**src/app/auth:**
- Purpose: OAuth flow handling
- Contains: OAuth callback handler (redirects from provider)
- Key files: `callback/route.ts` (handles code exchange)

**src/components:**
- Purpose: Reusable React components
- Contains: Feature-based organization (analyze, chat, curriculum, voice, ui)
- Pattern: Mostly client components (`'use client'`), some server components in pages

**src/components/ui:**
- Purpose: Reusable UI primitives and animations
- Contains: Button, Card, Badge, FeatureCard, StatCard, motion/animation components
- Key files: `button.tsx`, `card.tsx`, `motion.tsx` (Framer Motion animations)

**src/components/voice:**
- Purpose: Large, feature-rich voice practice components
- Contains: VoicePractice (client-side voice call UI), VoiceCoach (coaching persona)
- Key files: `VoicePractice.tsx` (main practice UI), `VoiceCoach.tsx` (coach mode)

**src/config:**
- Purpose: Immutable configuration constants
- Contains: AI persona definitions, scoring rubric, curriculum modules, prompts
- Pattern: Objects exported as constants, imported throughout app
- Key files: `personas.ts`, `rubric.ts`, `curriculum.ts`

**src/lib/actions:**
- Purpose: Server actions (secure, server-side operations)
- Marker: All files start with `'use server'` directive
- Pattern: Exported functions called from client components, run on server
- Key files: `practice-session.ts` (save session), `call-analysis.ts` (fetch call data)

**src/lib/scoring:**
- Purpose: Call analysis and scoring logic
- Contains: Scoring engine that evaluates 6 dimensions
- Key files: `engine.ts` (analyzeTranscript function - 440 lines)

**src/lib/supabase:**
- Purpose: Database access and client management
- Contains: Client factories (server, admin, browser), types from DB schema
- Pattern: Singleton pattern for admin client, new instance for browser client
- Key files: `admin.ts` (bypasses RLS), `server.ts` (RSC/SSR), `types.ts` (DB schema types)

**src/lib/transcription:**
- Purpose: Audio transcription via Whisper API
- Contains: Whisper API integration, audio file handling
- Key files: `whisper.ts` (calls OpenAI Whisper endpoint)

**src/lib/vapi:**
- Purpose: VAPI voice AI integration
- Contains: VAPI SDK client, webhook verification, system prompts
- Key files: `client.ts` (start/stop calls, event handling), `auth.ts` (signature verification)

**src/types:**
- Purpose: TypeScript type definitions for domain models
- Contains: Persona, RoleplaySession, CallAnalysis, TranscriptEntry, ScoreDimension
- Key files: `index.ts` (main types file)

**src/middleware.ts:**
- Purpose: Next.js request middleware
- Responsibilities: Add X-Request-ID header for distributed tracing
- Triggers on: All requests except static assets

## Key File Locations

**Entry Points:**

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout wrapper - loads AuthProvider, fonts, Sentry |
| `src/app/page.tsx` | Home/landing page - marketing UI, auth buttons |
| `src/app/practice/page.tsx` | Practice page - renders VoicePractice component |
| `src/app/analyze/page.tsx` | Analysis upload page |
| `src/app/chat/page.tsx` | Chat coaching page |

**Configuration:**

| File | Purpose |
|------|---------|
| `src/config/personas.ts` | AI personas with VAPI assistant IDs |
| `src/config/rubric.ts` | Scoring rubric (6 dimensions + criteria) |
| `src/config/curriculum.ts` | Curriculum modules |
| `src/config/coach.ts` | Coach system prompts |

**Core Logic:**

| File | Purpose |
|------|---------|
| `src/lib/scoring/engine.ts` | Call scoring analysis (440 lines) |
| `src/lib/actions/practice-session.ts` | Save practice session, fetch results (323 lines) |
| `src/lib/supabase/types.ts` | TypeScript DB schema types (580 lines) |
| `src/lib/vapi/client.ts` | VAPI SDK client, event handlers (126 lines) |

**API Routes:**

| Route | Purpose |
|-------|---------|
| `src/app/api/health/route.ts` | Service health check (Supabase, OpenRouter, OpenAI) |
| `src/app/api/analyze/upload/route.ts` | File upload to storage, create call_uploads record |
| `src/app/api/analyze/transcribe/route.ts` | Whisper transcription, store transcript |
| `src/app/api/analyze/score/route.ts` | Scoring engine, generate CallAnalysis |
| `src/app/api/analyze/[callId]/stream/route.ts` | Stream scoring progress (SSE) |
| `src/app/api/vapi/webhook/route.ts` | VAPI webhook handler, signature verification |
| `src/app/api/chat/route.ts` | Chat endpoint, RAG search + LLM response |
| `src/app/api/knowledge/search/route.ts` | pgvector similarity search |

**Providers & Context:**

| File | Purpose |
|------|---------|
| `src/components/providers/auth-provider.tsx` | AuthContext (user, session, signOut) |

## Naming Conventions

**Files:**

| Pattern | Example | Usage |
|---------|---------|-------|
| Page components | `page.tsx` | Route handler in Next.js (mapped to URL) |
| API routes | `route.ts` | HTTP endpoint handler |
| Server actions | `*.ts` with `'use server'` | `practice-session.ts` |
| Components | `PascalCase.tsx` | `VoicePractice.tsx`, `Button.tsx` |
| Utilities/libraries | `camelCase.ts` | `circuit-breaker.ts`, `rate-limit.ts` |
| Types | `index.ts` in types dir | Centralized type definitions |
| Config | `camelCase.ts` in config dir | `personas.ts`, `rubric.ts` |

**Directories:**

| Pattern | Example | Usage |
|---------|---------|-------|
| Feature-based | `src/components/{feature}` | `analyze/`, `chat/`, `voice/` |
| API grouped | `src/app/api/{domain}` | `analyze/`, `vapi/`, `chat/` |
| Service modules | `src/lib/{service}` | `supabase/`, `vapi/`, `transcription/` |

**TypeScript:**

| Convention | Example |
|------------|---------|
| Type suffix | `UserType`, `PersonaType` (not used - prefer interface/type names directly) |
| Status enums | `CallUploadStatus = 'pending' \| 'transcribing' \| 'scoring' \| 'completed'` |
| Dimension names | `ScoreDimension = 'opener' \| 'pitch' \| 'discovery' \| 'objection_handling' \| 'closing' \| 'communication'` |
| Context naming | `useAuth()` hook from `AuthContext` |

## Where to Add New Code

**New Feature Endpoint:**

1. Create directory in `src/app/api/{feature}/` (e.g., `src/app/api/feedback/`)
2. Create `route.ts` with POST handler
3. Validate auth: `const user = await getUser()`
4. Validate input: Use schema from `src/lib/validations.ts`
5. Call business logic from `src/lib/actions/` or `src/lib/{service}/`
6. Return JSON response with appropriate status code

Example path: `src/app/api/feedback/route.ts`

**New Server Action:**

1. Create file in `src/lib/actions/` (e.g., `src/lib/actions/feedback.ts`)
2. Add `'use server'` directive at top
3. Get user: `const user = await getUser()`
4. Get admin client: `const supabase = getAdminClient()`
5. Query/mutate database
6. Return typed result object
7. Import and call from client components

Example path: `src/lib/actions/feedback.ts`

**New Page:**

1. Create directory in `src/app/{route}` (e.g., `src/app/feedback/`)
2. Create `page.tsx` with default export
3. Add metadata export if needed
4. If client component, add `'use client'` directive
5. Import component or write inline JSX
6. Use server components by default, `'use client'` only where needed

Example path: `src/app/feedback/page.tsx`

**New Component:**

1. Create file in `src/components/{feature}/` (e.g., `src/components/feedback/FeedbackForm.tsx`)
2. Use `'use client'` if needs state/effects
3. Export named component (also provide default if only component)
4. Accept props with typed interface
5. Import in page or parent component

Example path: `src/components/feedback/FeedbackForm.tsx`

**New Persona/Config:**

1. Edit `src/config/personas.ts` to add entry to `AI_PERSONAS` array
2. Fill fields: id, name, role, personality, objections, warmth, voiceId, assistantId
3. Import `Persona` type from `src/types/index.ts`
4. Ensure assistantId matches VAPI dashboard pre-configured assistant

Example edit: Add to `AI_PERSONAS` array in `src/config/personas.ts`

**New Scoring Dimension:**

1. Add dimension name to `ScoreDimension` type in `src/types/index.ts`
2. Add scoring logic function in `src/lib/scoring/engine.ts` (e.g., `analyzeNewDimension()`)
3. Call function in `analyzeTranscript()` and add result to `dimensionScores` object
4. Add criteria/rubric to `src/config/rubric.ts`
5. Update `calculateOverallScore()` if weighting changes

Example edit: Add to `ScoreDimension` union, implement analyzer, add to engine

## Special Directories

**src/app/api/analyze/:**
- Purpose: Call upload and analysis pipeline
- Contains: 4 sequential endpoints (upload → transcribe → score → stream)
- Generated: No
- Committed: Yes

**src/lib/supabase/:**
- Purpose: Database layer abstraction
- Contains: Client factories, type definitions
- Generated: `types.ts` auto-generated from Supabase schema (committed, may need refresh)
- Committed: Yes

**src/config/:**
- Purpose: Immutable application constants
- Contains: VAPI IDs, scoring rubric, curriculum, prompts
- Generated: No
- Committed: Yes

**src/components/ui/:**
- Purpose: Reusable design system components
- Contains: Buttons, cards, badges, animations
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-01-23*
