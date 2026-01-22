# Technology Stack

**Analysis Date:** 2026-01-23

## Languages

**Primary:**
- TypeScript 5.x - Entire codebase (frontend + backend)
- React 19.2.3 - Component layer

**Secondary:**
- JavaScript (ESM) - Build config files (`next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`)
- SQL - Supabase migrations in `supabase/migrations/`

## Runtime

**Environment:**
- Node.js 20.17.0 (specified in `.nvmrc`)

**Package Manager:**
- npm (lockfile present: `package-lock.json`)

## Frameworks

**Core:**
- Next.js 16.1.4 - Full-stack framework (App Router, API routes, SSR/SSG)
- React 19.2.3 - UI components

**UI & Styling:**
- Tailwind CSS 4 (via `@tailwindcss/postcss`) - Utility-first CSS
- clsx 2.1.1 - Class name utilities
- tailwind-merge 3.4.0 - Merge Tailwind classes
- lucide-react 0.562.0 - Icon library
- motion 12.26.2 - Animation library

**Testing:**
- Vitest 4.0.17 - Unit/integration tests (config: `vitest.config.ts`)
- Playwright 1.57.0 - E2E tests (config: `playwright.config.ts`)
- @testing-library/react 16.3.1 - React component testing
- @testing-library/jest-dom 6.9.1 - DOM matchers
- jsdom 27.4.0 - DOM simulation for tests

**Build/Dev:**
- Turbopack (enabled in Next.js 16 for dev builds)
- TypeScript 5.x - Compilation and type checking
- ESLint 9.x - Linting
- PostCSS 4 - CSS processing

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.90.1 - Database, auth, real-time client
- `@supabase/ssr` 0.8.0 - Server-side auth handling for Next.js
- `@vapi-ai/web` 2.5.2 - Voice AI/call integration
- `openai` 6.16.0 - LLM and transcription (Whisper API)
- `@sentry/nextjs` 10.34.0 - Error tracking, session replay, performance monitoring

**Infrastructure:**
- `zod` 4.3.5 - Runtime schema validation
- `class-variance-authority` 0.7.1 - Component variant management
- `pdf-parse` 1.1.1 - PDF document parsing for knowledge base
- `dotenv` 17.2.3 - Environment variable loading (dev)

**Monitoring:**
- `@vercel/analytics` 1.6.1 - Web vitals collection (Vercel analytics)
- `@vercel/speed-insights` 1.3.1 - Performance monitoring (Vercel)

## Configuration

**Environment:**
- Source: `.env.local` (git-ignored)
- Template: `.env.example` (committed)
- Supabase URL/keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- VAPI keys: `NEXT_PUBLIC_VAPI_PUBLIC_KEY`, `VAPI_PRIVATE_KEY`, `VAPI_WEBHOOK_SECRET`
- LLM keys: `OPENAI_API_KEY`, `OPENROUTER_API_KEY`
- Sentry DSN: `NEXT_PUBLIC_SENTRY_DSN` (optional)
- App URL: `NEXT_PUBLIC_SITE_URL`

**Build:**
- TypeScript: `tsconfig.json` (target: ES2017, module: esnext, strict mode enabled)
- Linting: `eslint.config.mjs` (ESLint 9 flat config, extends Next.js core-web-vitals + TypeScript)
- CSS: `postcss.config.mjs` (Tailwind CSS 4 plugin)
- Vitest: `vitest.config.ts` (jsdom environment, glob setup)
- Playwright: `playwright.config.ts` (Chromium, trace on retry, screenshot on failure)
- Next.js: `next.config.ts` with:
  - Sentry integration via `withSentryConfig`
  - Image optimization (avif, webp)
  - Turbopack configuration
  - Security headers (CSP, HSTS, X-Frame-Options, etc.)
  - Source map uploads disabled in production

**Sentry Config:**
- Client: `sentry.client.config.ts` - Frontend error tracking, session replay (10% + 100% on errors)
- Server: `sentry.server.config.ts` - Backend error tracking
- Both configs: 10% transaction sampling, production-only

## Path Aliases

- `@/*` → `./src/*` (defined in `tsconfig.json`)

## Platform Requirements

**Development:**
- Node.js 20.17.0
- npm (latest)
- Supabase local environment (optional)

**Production:**
- Deployment: Vercel (Next.js native)
- Database: Supabase (PostgreSQL 13+)
- CDN: Vercel Edge Network
- Monitoring: Sentry (cloud), Vercel Analytics + Speed Insights

## API Clients

**Database:**
- `@supabase/supabase-js` - Creates `Database` typed client (types from `src/lib/supabase/types.ts`)
- Singleton pattern for browser client (cached in `src/lib/supabase/client.ts`)
- Server-side: Cookie-based session management via `@supabase/ssr` middleware

**Voice/AI:**
- `@vapi-ai/web` - Browser-based VAPI client initialized in `src/lib/vapi/client.ts`
- Uses VAPI WebSocket API for real-time voice calls via Daily.co
- ElevenLabs voices configured in `src/config/personas.ts`

**LLM:**
- OpenAI SDK used for two purposes:
  1. Direct OpenAI: GPT-4o model for chat and scoring
  2. OpenRouter proxy: Same OpenAI SDK with baseURL override to `https://openrouter.ai/api/v1`
- Circuit breaker pattern wraps OpenRouter calls to handle failures gracefully

**Transcription:**
- OpenAI Whisper API (`https://api.openai.com/v1/audio/transcriptions`)
- Includes retry logic (3 attempts) and 3-minute timeout

---

*Stack analysis: 2026-01-23*
