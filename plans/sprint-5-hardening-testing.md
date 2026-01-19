# Sprint 5: Hardening & Testing

> **Priority**: P1 (Important)
> **Goal**: Add security hardening, real-time progress, and comprehensive E2E tests
> **Based on**: Sprint 4 review recommendations

---

## Overview

Three focus areas:
1. **Security Hardening**: Rate limiting + Zod validation
2. **Real-time Progress**: SSE for transcription/scoring status
3. **E2E Testing**: Playwright tests for critical flows

---

## Task 1: Rate Limiting Middleware

**File**: `src/lib/rate-limit.ts`

Simple in-memory rate limiter (upgrade to Redis for production scale):

```typescript
interface RateLimitConfig {
  windowMs: number  // Time window in ms
  max: number       // Max requests per window
}

// Route-specific limits:
// - /api/analyze/upload: 10 per 15 min
// - /api/analyze/transcribe: 5 per 15 min
// - /api/chat: 60 per min
```

**Integration**: Wrap API route handlers with rate limit check.

---

## Task 2: Zod Validation Schemas

**File**: `src/lib/validations.ts`

Define schemas for all API inputs:

```typescript
// Chat API
export const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(10000),
  })),
  mode: z.enum(['curriculum', 'objections', 'techniques', 'free']).optional(),
})

// Analyze APIs
export const CallIdSchema = z.string().uuid()

export const UploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/mp4']),
})
```

---

## Task 3: Real-time Progress with SSE

**New Endpoint**: `GET /api/analyze/[callId]/stream`

Server-Sent Events for live status updates during transcription/scoring:

```typescript
// Client subscribes
const eventSource = new EventSource(`/api/analyze/${callId}/stream`)

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // { status: 'transcribing', progress: 45, message: 'Processing audio...' }
}

// Server sends
return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
})
```

---

## Task 4: E2E Tests with Playwright

**Directory**: `tests/e2e/`

### Auth Flow (`auth.spec.ts`)
- Sign up with email
- Log in with credentials
- Log out
- Protected route redirect

### Practice Flow (`practice.spec.ts`)
- Select persona
- Select scenario
- Start call (mock VAPI)
- End call
- View results

### Analysis Flow (`analysis.spec.ts`)
- Upload file
- Monitor progress
- View results
- View transcript tab

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/rate-limit.ts` | NEW - Rate limiter utility |
| `src/lib/validations.ts` | NEW - Zod schemas |
| `src/app/api/chat/route.ts` | MODIFY - Add validation + rate limit |
| `src/app/api/analyze/upload/route.ts` | MODIFY - Add validation + rate limit |
| `src/app/api/analyze/transcribe/route.ts` | MODIFY - Add validation + rate limit |
| `src/app/api/analyze/score/route.ts` | MODIFY - Add validation |
| `src/app/api/analyze/[callId]/stream/route.ts` | NEW - SSE endpoint |
| `src/components/analyze/CallAnalyzer.tsx` | MODIFY - Use SSE for progress |
| `tests/e2e/auth.spec.ts` | NEW |
| `tests/e2e/practice.spec.ts` | NEW |
| `tests/e2e/analysis.spec.ts` | NEW |
| `playwright.config.ts` | NEW - Playwright config |

---

## Acceptance Criteria

- [x] Rate limiting blocks excessive requests (returns 429)
- [x] Invalid API inputs return 400 with Zod error details
- [x] SSE endpoint streams real-time progress updates
- [x] CallAnalyzer uses SSE instead of polling
- [x] E2E tests created for auth flow
- [x] E2E tests created for practice flow
- [x] E2E tests created for analysis flow
- [x] Build succeeds with no TypeScript errors
- [x] All existing functionality works
- [x] Unit tests pass (35/35)

---

## Commands

```bash
# Run E2E tests
npm run test:e2e

# Run unit tests
npm run test

# Build
npm run build

# Deploy
vercel --prod
```
