# CLAUDE.md - Underdog AI Sales Coach

## Project Context

AI-powered sales training platform for Underdog Sales methodology. Voice practice, chat coaching, call analysis, and curriculum.

## Tech Stack

- **Framework**: Next.js 16.1.2, React 19, TypeScript
- **Database**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Voice AI**: VAPI (ElevenLabs + Deepgram)
- **LLM**: OpenAI GPT-4o via OpenRouter
- **Monitoring**: Sentry (error tracking + session replay)
- **Deployment**: Vercel

## Quick Commands

```bash
npm run dev          # Development server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
vercel --prod        # Deploy to production
```

## Key Directories

```
src/app/api/         # API routes (webhook, health, analyze, chat)
src/components/      # React components by feature
src/config/          # Personas, rubric, curriculum, coach config
src/lib/             # Utilities (supabase, vapi, logger, circuit-breaker)
supabase/migrations/ # Database migrations
```

## Environment Variables

Required in `.env.local` and Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_VAPI_PUBLIC_KEY` / `VAPI_PRIVATE_KEY` / `VAPI_WEBHOOK_SECRET`
- `OPENAI_API_KEY` / `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SITE_URL`

## Architecture Notes

### Voice Practice Flow
1. User selects persona + scenario → `/practice`
2. VAPI call starts with assistant config from `/config/personas.ts`
3. VAPI webhook (`/api/vapi/webhook`) receives events
4. On call end: transcript saved, scoring triggered, results shown

### Call Analysis Flow
1. Upload audio → `/api/analyze/upload` (Supabase storage)
2. Transcribe → `/api/analyze/transcribe` (Whisper)
3. Score → `/api/analyze/score` (GPT-4o with rubric)
4. Stream results → `/api/analyze/[callId]/stream`

### Chat Coaching Flow
1. User sends message → `/api/chat`
2. RAG search → `/api/knowledge/search` (pgvector)
3. LLM response with context (OpenRouter)

## Database

Key tables with RLS enabled:
- `roleplay_sessions` - Voice practice sessions
- `session_scores` - Scoring results (6 dimensions)
- `call_uploads` - Uploaded recordings
- `curriculum_progress` - Module completion tracking
- `knowledge_base` - RAG chunks with embeddings
- `audit_log` - Security audit trail (auto-populated via triggers)

Soft delete pattern: `deleted_at` column on user-facing tables.

## Security

- VAPI webhook signature verification (HMAC SHA-256)
- Auth required on all user endpoints
- CSP headers configured in `next.config.ts`
- RLS policies on all Supabase tables

## Observability

- **Sentry**: Error tracking (client, server, edge) + session replay
- **Logger**: Structured logging via `src/lib/logger.ts`
- **Health Check**: `/api/health` (Supabase, OpenAI, OpenRouter status)
- **Circuit Breaker**: `src/lib/circuit-breaker.ts` for external services

## Testing

```bash
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
```

## Production URLs

- **App**: https://under-eight.vercel.app
- **Sentry**: https://qualia-solutions.sentry.io (project: under)
- **Supabase**: Dashboard → qualia-solutions org

## Common Tasks

### Add new persona
Edit `src/config/personas.ts` - add to `AI_PERSONAS` array

### Update scoring rubric
Edit `src/config/rubric.ts` - modify dimensions/criteria

### Add curriculum module
Edit `src/config/curriculum.ts` - add to `CURRICULUM_MODULES`

### Run migrations
Use Supabase MCP or dashboard SQL editor
