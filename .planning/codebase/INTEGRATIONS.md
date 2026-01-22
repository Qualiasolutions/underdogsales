# External Integrations

**Analysis Date:** 2026-01-23

## APIs & External Services

**Voice AI:**
- VAPI (Voice API) - Real-time AI voice calls with Daily.co backend
  - SDK: `@vapi-ai/web` 2.5.2
  - Client: `src/lib/vapi/client.ts` - Singleton pattern, event-driven
  - Auth: `NEXT_PUBLIC_VAPI_PUBLIC_KEY` (public), `VAPI_PRIVATE_KEY` (server-side)
  - Webhook: `src/app/api/vapi/webhook/route.ts` - Receives call events and transcripts
  - Webhook secret: `VAPI_WEBHOOK_SECRET` - HMAC SHA-256 signature verification
  - Integration: Connects personas to VAPI assistants (configured in VAPI dashboard)
  - Voice provider: ElevenLabs (voice IDs stored in `src/config/personas.ts`)
  - Media platform: Daily.co (WebRTC for video/audio transport)

**LLM & AI:**
- OpenAI GPT-4o
  - SDK: `openai` 6.16.0
  - Primary use: Chat coaching, call scoring, RAG context generation
  - Auth: `OPENAI_API_KEY`
  - Direct API: `https://api.openai.com`
  - Used in: `src/app/api/chat/route.ts`, `src/app/api/analyze/score/route.ts`

- OpenRouter (Proxy for OpenAI + other models)
  - Same OpenAI SDK with baseURL override
  - Auth: `OPENROUTER_API_KEY`
  - Endpoint: `https://openrouter.ai/api/v1`
  - Model: `openai/gpt-4o` (routes to OpenAI)
  - Circuit breaker protection: `openrouterCircuit` in `src/lib/circuit-breaker.ts`
  - Used in: Chat, knowledge search embeddings, streaming responses
  - Fallback: If OpenRouter unavailable, falls back to direct OpenAI

- Whisper (Audio Transcription)
  - OpenAI Whisper API: `https://api.openai.com/v1/audio/transcriptions`
  - Model: `whisper-1`
  - Used in: `src/lib/transcription/whisper.ts`
  - Includes: Retry logic (3 attempts, exponential backoff), 3-minute timeout
  - Response format: Verbose JSON with segment timestamps
  - Integration: Audio file upload → transcription → segment-based transcript

## Data Storage

**Databases:**
- Supabase (Managed PostgreSQL 13+)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - Client: `@supabase/supabase-js` 2.90.1
  - Server-side SSR: `@supabase/ssr` 0.8.0
  - Locations: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`

**Tables:**
- `organizations` - Org/workspace data
- `roleplay_sessions` - Voice practice session metadata (deleted_at for soft delete)
- `session_scores` - Scoring results on 6 dimensions
- `call_uploads` - Uploaded audio recordings with processing status
- `curriculum_progress` - Module completion tracking
- `knowledge_base` - RAG chunks with pgvector embeddings (1536 dims, text-embedding-3-small)
- `audit_log` - Security audit trail (auto-populated via database triggers)

**RLS Policies:**
- All tables have Row-Level Security enabled
- Auth checks via `auth.uid()` for user-scoped access
- Service role bypass for admin operations

**File Storage:**
- Supabase Storage (Postgres-backed)
  - Used for: Uploaded audio files, processed transcripts
  - Buckets: Configured in migrations
  - Access: Via Supabase client storage API

**Vector Search:**
- pgvector extension for PostgreSQL
  - Table: `knowledge_base.embedding` (vector(1536))
  - Index: IVFFlat with cosine distance
  - Function: `match_knowledge(query_embedding, match_threshold, match_count, filter_source)`
  - Used in: `src/lib/knowledge.ts` for RAG search
  - Embedding model: `text-embedding-3-small` via OpenRouter

**Migrations:**
- Location: `supabase/migrations/` (numbered SQL files)
- Key migrations:
  - `001_initial_schema.sql` - Core tables (organizations, users, sessions, uploads)
  - `002_knowledge_base.sql` - Knowledge base + pgvector + match function
  - `004_audit_log.sql` - Audit trail table + triggers
  - `005_soft_delete.sql` - deleted_at columns + policies
  - `006_auth_user_sync.sql` - Auth user sync triggers
  - `009_consolidate_rls_policies.sql` - RLS policy cleanup
  - `010_performance_indexes.sql` - Performance optimizations

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built on GoTrue)
  - OAuth options: Email/password, Google, other providers (configurable)
  - Session management: Cookie-based on server, token-based on client
  - Server-side: `src/lib/supabase/server.ts` handles auth refresh
  - Client-side: `src/components/providers/auth-provider.tsx` wraps React tree

**Auth Endpoints:**
- `src/app/auth/callback/route.ts` - OAuth callback handler
- `src/app/login/actions.ts` - Login/signup server actions
- `src/app/signup/actions.ts` - Registration flow

## Monitoring & Observability

**Error Tracking:**
- Sentry (Error tracking + Session Replay)
  - DSN: `NEXT_PUBLIC_SENTRY_DSN`
  - Configs: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
  - Sampling:
    - Transactions: 10%
    - Session replay (base): 10%
    - Session replay (on error): 100%
  - Integration: `@sentry/nextjs` 10.34.0 wraps `next.config.ts`
  - Masked data: All text masked, all media blocked in replay

**Logs:**
- Structured logging: `src/lib/logger.ts`
  - Methods: `info()`, `error()`, `warn()`, `exception()` for errors
  - Used in: API routes, services, integrations
  - Output: Console (dev), Sentry (prod)

**Health Check:**
- Endpoint: `src/app/api/health/route.ts`
- Checks: Supabase, OpenAI (optional), OpenRouter (critical)
- Latency: Measured per service
- Status codes: 200 (healthy/degraded), 503 (unhealthy)

**Performance:**
- Vercel Analytics: `@vercel/analytics` 1.6.1
- Vercel Speed Insights: `@vercel/speed-insights` 1.3.1
- Source maps: Disabled in production (sent to Sentry only)

## CI/CD & Deployment

**Hosting:**
- Vercel (serverless platform for Next.js)
- Automatic deployments from git

**Environment:**
- Development: `npm run dev` (Turbopack dev server)
- Production build: `npm run build` (Next.js compilation)
- Start: `npm run start` (production server)

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key (server-side only)
- `NEXT_PUBLIC_VAPI_PUBLIC_KEY` - VAPI public key (client)
- `VAPI_PRIVATE_KEY` - VAPI private key (server-side only)
- `VAPI_WEBHOOK_SECRET` - Webhook signature verification
- `OPENAI_API_KEY` - OpenAI API key
- `OPENROUTER_API_KEY` - OpenRouter API key
- `NEXT_PUBLIC_SITE_URL` - App base URL

**Optional env vars:**
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking (production only)
- `UPSTASH_REDIS_REST_URL` - Redis for distributed rate limiting (not currently used)
- `UPSTASH_REDIS_REST_TOKEN` - Redis auth token (not currently used)

**Secrets location:**
- Development: `.env.local` (git-ignored)
- Production: Vercel environment variables (dashboard)
- Template: `.env.example` (guide for required vars)

## Webhooks & Callbacks

**Incoming Webhooks:**
- VAPI Webhook: `src/app/api/vapi/webhook/route.ts`
  - Events: Call start, call end, transcript updates, assistant responses
  - Auth: HMAC SHA-256 signature verification using `VAPI_WEBHOOK_SECRET`
  - Signature header: `x-vapi-signature`
  - Processing: Saves transcripts, triggers scoring, streams results
  - Verification: `src/lib/vapi/auth.ts` - `verifyVapiSignature()`, `verifyVapiRequest()`

- VAPI Tool Endpoints: `src/app/api/vapi/tools/*/route.ts`
  - Knowledge base lookup: `src/app/api/vapi/tools/knowledge-base/route.ts`
  - Auth: Same signature verification as webhook

**Outgoing Webhooks:**
- None configured (Supabase can trigger webhooks to external services if needed)

**OAuth Callbacks:**
- Supabase Auth: `src/app/auth/callback/route.ts`
  - Handles OAuth provider redirects
  - Sets auth session cookies

## Rate Limiting

**Implementation:**
- Local in-memory rate limiting: `src/lib/rate-limit.ts`
- Not distributed (would require Redis via Upstash, currently not enabled)

**Limits:**
- Chat: `RATE_LIMITS.chat` (defined in rate-limit.ts)
- Transcription: `RATE_LIMITS.transcribe` (expensive, lower limit)
- Headers: Standard rate limit headers in responses (`X-RateLimit-*`)

## API Routes & Integrations Summary

| Route | Purpose | Auth | External Service |
|-------|---------|------|-------------------|
| `POST /api/chat` | Chat coaching | Supabase Auth | OpenRouter LLM, Knowledge Base |
| `POST /api/analyze/upload` | Upload audio | Supabase Auth | Supabase Storage |
| `POST /api/analyze/transcribe` | Transcribe audio | Supabase Auth | OpenAI Whisper |
| `POST /api/analyze/score` | Score call | Supabase Auth | OpenAI GPT-4o (via OpenRouter) |
| `GET /api/analyze/[callId]/stream` | Stream results | Supabase Auth | OpenAI (SSE) |
| `POST /api/vapi/webhook` | Voice events | VAPI signature | VAPI (inbound) |
| `GET /api/knowledge/search` | RAG search | Supabase Auth | pgvector (Supabase) |
| `GET /api/health` | Health check | Public | Supabase, OpenAI, OpenRouter |
| `POST /api/user/delete` | Account deletion | Supabase Auth | Supabase (cascade delete) |
| `POST /api/user/export` | Data export | Supabase Auth | Supabase (query) |

---

*Integration audit: 2026-01-23*
