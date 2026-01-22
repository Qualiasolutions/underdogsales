# Architecture

**Analysis Date:** 2026-01-23

## Pattern Overview

**Overall:** Layered Next.js 16 application with clear separation between frontend (React components), API layer (Next.js route handlers), business logic (server actions and library modules), and external service integrations (VAPI, Supabase, OpenAI/OpenRouter).

**Key Characteristics:**
- Client-Server architecture with Next.js App Router (edge/server-side rendering where applicable)
- API-first design with RESTful routes for external integrations
- Server actions (`'use server'`) for secure database operations
- Singleton pattern for external client instances (VAPI, Supabase admin)
- Circuit breaker pattern for fault tolerance on external services
- Domain-driven organization by feature (practice, analyze, chat, curriculum, coach)

## Layers

**Presentation Layer:**
- Purpose: Render UI, handle user interactions, manage local component state
- Location: `src/app/` (pages), `src/components/`
- Contains: Page components, React client components, UI primitives (buttons, cards, badges), animations/motion components
- Depends on: Context providers (AuthProvider), hooks, client-side Supabase
- Used by: End users through browser

**API Layer:**
- Purpose: Handle HTTP requests, validate input, orchestrate business logic, return JSON responses
- Location: `src/app/api/`
- Contains: Route handlers (POST/GET methods), webhook handlers, request validation, rate limiting
- Depends on: Server actions, external SDKs (OpenAI, OpenRouter), admin Supabase client
- Used by: Frontend (fetch calls), webhooks (VAPI), external services

**Business Logic Layer:**
- Purpose: Core application logic - analyzing transcripts, scoring calls, managing sessions
- Location: `src/lib/actions/`, `src/lib/scoring/`, `src/lib/transcription/`
- Contains: Server actions (marked with `'use server'`), scoring engine, transcription handlers
- Depends on: Database access (admin client), configuration (rubric, personas), utilities
- Used by: API routes, page components

**Data Access Layer:**
- Purpose: Communicate with Supabase database and storage
- Location: `src/lib/supabase/`
- Contains: Client factories (server, admin, client), type definitions, database queries
- Depends on: Supabase SDK, environment variables
- Used by: Business logic layer, API routes, server components

**Integration Layer:**
- Purpose: Manage external service clients and communication
- Location: `src/lib/vapi/`, `src/lib/knowledge.ts`, health checks
- Contains: VAPI client initialization, webhook signature verification, circuit breakers, RAG search
- Depends on: External APIs (VAPI, OpenAI, OpenRouter), knowledge base (pgvector)
- Used by: API routes (webhooks), business logic (chat coaching)

**Configuration Layer:**
- Purpose: Define immutable application constants - personas, rubric, curriculum, coach settings
- Location: `src/config/`
- Contains: AI personas (warmth, voice ID, VAPI assistant ID), scoring rubric, curriculum modules, coach prompts
- Depends on: Type definitions
- Used by: Business logic (scoring engine), components (persona selection), API routes (VAPI setup)

## Data Flow

**Voice Practice Flow (Real-time):**

1. User selects persona + scenario on `/practice` → VoicePractice component
2. Component calls `startRoleplaySession()` from `src/lib/vapi/client.ts`
3. VAPI client initialized with `persona.assistantId` from config
4. VAPI WebSocket opens → audio captured → assistant responds (ElevenLabs voice)
5. Real-time transcript events → `onTranscript` callback
6. User transcript entries accumulated in component state
7. User ends call → `stopRoleplaySession()` called
8. Call end event triggers `savePracticeSession()` server action (`src/lib/actions/practice-session.ts`)
9. Server action:
   - Validates user authentication
   - Calls `analyzeTranscript()` from `src/lib/scoring/engine.ts`
   - Inserts session record + 6 dimension scores into Supabase
   - Returns session ID
10. Client redirects to `/practice/results/[sessionId]`
11. Results page fetches session data via server action, displays scores

**Call Upload & Analysis Flow (Async):**

1. User uploads MP3/WAV to `/analyze` → AnalyzeUpload component
2. POST to `/api/analyze/upload` endpoint:
   - Validates file (type, size, rate limits)
   - Uploads to Supabase Storage (`call-recordings` bucket)
   - Creates `call_uploads` record with status: `'pending'`
   - Returns callId + pre-signed download URL
3. Client triggers `/api/analyze/transcribe` (POST):
   - Rate-limited per user
   - Downloads audio from storage
   - Calls Whisper API via `transcribeAudio()` from `src/lib/transcription/whisper.ts`
   - Stores transcript array in `call_uploads.transcript`
   - Updates status: `'scoring'`
4. Client triggers `/api/analyze/score` (POST):
   - Fetches call upload record
   - Calls `analyzeTranscript()` scoring engine
   - Generates CallAnalysis object (summary, 6 dimension scores)
   - Updates record with analysis + `overall_score`
   - Updates status: `'completed'`
5. Client polls `/api/analyze/[callId]/stream` for real-time updates (SSE)
6. Results displayed on `/analyze/[callId]` page

**Chat Coaching Flow (RAG-based):**

1. User sends message on `/chat` page
2. POST to `/api/chat`:
   - User authenticated via Supabase
   - Message validated
   - Calls `/api/knowledge/search` to find relevant RAG chunks (pgvector similarity search)
   - Sends prompt to OpenRouter GPT-4o with context chunks + system prompt
   - Returns streamed response
3. Knowledge base populated via `/api/vapi/tools/knowledge-base` (called by VAPI assistant during practice)

**VAPI Webhook Flow:**

1. VAPI call generates events (tool calls, transcripts)
2. VAPI posts to `/api/vapi/webhook`:
   - Signature verified (HMAC SHA-256)
   - If `tool-calls` message: handles knowledge-base lookup
   - If `call-end` message: triggers analysis pipeline
3. Webhook returns tool results to VAPI

## State Management

**Client-Side:**
- React Context: `AuthContext` for user/session state (defined in `src/components/providers/auth-provider.tsx`)
- Component state: Local state in voice practice component for transcript accumulation
- URL/Search params: Used for navigation and result display (e.g., `[sessionId]`, `[callId]`, `[moduleId]`)

**Server-Side:**
- Supabase Auth: Session persisted in cookies, refreshed via middleware
- Database: All persistent data (sessions, scores, uploads, curriculum progress)
- Circuit breaker state: Shared across requests to track external service health

**Session Management:**
- Supabase Auth handles user sessions (JWT in cookies)
- Server component `getUser()` reads auth state for every request
- Middleware adds request ID for tracing

## Key Abstractions

**Persona:**
- Purpose: Defines a sales prospect AI character
- Location: Defined in `src/config/personas.ts`, typed in `src/types/index.ts`
- Contains: name, role, personality, objections, warmth (0-1), voiceId, assistantId (VAPI pre-configured)
- Pattern: Immutable config object, passed to VAPI API, used to drive assistant behavior

**Transcript Entry:**
- Purpose: Represents one message in a conversation
- Fields: role ('user' or 'assistant'), content (text), timestamp (ms since epoch)
- Pattern: Array-based linear history, preserved exactly as spoken

**Scoring Result:**
- Purpose: Comprehensive evaluation of a sales call
- Location: `src/lib/scoring/engine.ts`
- Contains: 6 dimension scores (opener, pitch, discovery, objection_handling, closing, communication), overall score, strengths/improvements
- Pattern: Immutable result object calculated deterministically from transcript

**Call Upload:**
- Purpose: Encapsulates an uploaded audio file and its processing state
- States: pending → transcribing → scoring → completed (or failed)
- Pattern: State machine stored in database, updated via API endpoints in sequence

**Circuit Breaker:**
- Purpose: Protect against cascading failures in external services
- States: closed (normal) → open (failing) → half-open (testing recovery)
- Implementation: `src/lib/circuit-breaker.ts`, used for Supabase health checks
- Pattern: Singleton per service, execute wrapped calls through breaker

## Entry Points

**Web Application:**
- Location: `src/app/page.tsx` (home/landing)
- Triggers: User visits https://under-eight.vercel.app
- Responsibilities: Render marketing/auth UI, route to authenticated pages

**API - Health Check:**
- Location: `src/app/api/health/route.ts`
- Triggers: GET /api/health (Vercel monitoring, external uptime checks)
- Responsibilities: Check Supabase + OpenRouter health, return service status

**API - VAPI Webhook:**
- Location: `src/app/api/vapi/webhook/route.ts`
- Triggers: VAPI calls this endpoint on call events (tool-calls, call-end, etc.)
- Responsibilities: Verify signature, process tool calls, coordinate with knowledge base

**API - Analysis Upload:**
- Location: `src/app/api/analyze/upload/route.ts`
- Triggers: POST from client when user uploads audio
- Responsibilities: Validate file, store in Supabase Storage, create database record

**API - Analysis Transcribe:**
- Location: `src/app/api/analyze/transcribe/route.ts`
- Triggers: POST after upload succeeds
- Responsibilities: Download audio, call Whisper, store transcript, update status

**API - Analysis Score:**
- Location: `src/app/api/analyze/score/route.ts`
- Triggers: POST after transcription completes
- Responsibilities: Run scoring engine, generate analysis, update record

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: Every request matching the configured matcher
- Responsibilities: Generate X-Request-ID for distributed tracing

## Error Handling

**Strategy:** Layered error handling with user-friendly messages + structured logging

**Patterns:**

1. **Validation Errors:** Input validation at API boundary (schema validation in `src/lib/validations.ts`), returns 400 with descriptive error
2. **Authentication Errors:** Missing/invalid auth returns 401, handled by AuthProvider on client
3. **Not Found Errors:** Missing resources return 404 (call uploads, sessions)
4. **Rate Limit Errors:** Exceeded limits return 429 with Retry-After headers (see `src/lib/rate-limit.ts`)
5. **External Service Errors:**
   - Whisper transcription failures → update status to 'failed', log error message
   - VAPI webhook signature mismatch → return 401, log security warning
   - OpenRouter/OpenAI failures → circuit breaker opens after threshold, subsequent calls rejected
6. **Database Errors:** Caught and logged with operation context, user gets generic 500
7. **Unhandled Errors:** Global error boundary in `src/app/error.tsx`, error logged to Sentry

## Cross-Cutting Concerns

**Logging:** Structured logger in `src/lib/logger.ts` - all significant operations logged with context (operation name, userId, error details). Integrates with Sentry for error tracking.

**Validation:** Schema-based validation using custom validator in `src/lib/validations.ts`. Schemas defined for TranscribeRequest, ScoreRequest, etc. Validates at API boundary.

**Authentication:** Supabase Auth provider (OAuth + email/password). User context available via `getUser()` on server. Verified on every API route that requires auth.

**Authorization:** Row-level security (RLS) policies on Supabase tables enforce user isolation. Admin client bypasses RLS for server-side operations that verify user context first.

**Rate Limiting:** Token bucket implementation in `src/lib/rate-limit.ts` - tracks per-user limits for upload (5/hour), transcribe (3/hour), etc. Prevents abuse and cost overruns.

**Circuit Breaking:** Wraps calls to Supabase in circuit breaker to prevent cascading failures. Tracks state across requests via shared instance.

**Request Tracing:** Middleware adds X-Request-ID header to all responses for distributed tracing in logs/Sentry.

---

*Architecture analysis: 2026-01-23*
