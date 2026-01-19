# Sprint 6: Resilience & Reliability

> **Priority**: P0 (Critical)
> **Goal**: Add timeouts, retry logic, and robust error handling
> **Based on**: Sprint 4/5 review + codebase analysis

---

## Overview

Focus: Make the app production-ready with proper error handling and resilience.

1. **Fetch Timeouts**: Prevent hanging requests
2. **Retry Logic**: Handle transient failures gracefully
3. **SSE Improvements**: Better error recovery
4. **Error Codes**: Actionable user feedback

---

## Task 1: Fetch Timeout Wrapper Utility

**File**: `src/lib/fetch-utils.ts`

```typescript
interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number // ms
}

export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

// Timeouts by service type
export const TIMEOUTS = {
  WHISPER: 180000,     // 3 min (long audio)
  OPENAI_CHAT: 30000,  // 30s
  EMBEDDINGS: 20000,   // 20s
  SUPABASE: 15000,     // 15s
  UPLOAD: 60000,       // 60s
  DEFAULT: 30000,      // 30s
}
```

---

## Task 2: Retry Logic with Exponential Backoff

**File**: `src/lib/retry.ts`

```typescript
interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  retryOn?: (error: Error, response?: Response) => boolean
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryOn = defaultRetryCondition,
  } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxAttempts || !retryOn(lastError)) {
        throw lastError
      }

      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
        maxDelay
      )
      await sleep(delay)
    }
  }

  throw lastError!
}

function defaultRetryCondition(error: Error): boolean {
  // Retry on network errors and specific HTTP codes
  if (error.name === 'AbortError') return false // timeout - don't retry
  if (error.message.includes('fetch failed')) return true
  return false
}

export function isRetryableResponse(response: Response): boolean {
  return [429, 502, 503, 504].includes(response.status)
}
```

---

## Task 3: Apply Timeouts to API Calls

### Files to Modify:

| File | Timeout | Notes |
|------|---------|-------|
| `src/lib/transcription/whisper.ts` | 180s | Long audio files |
| `src/app/api/chat/route.ts` | 30s | OpenAI chat |
| `src/app/api/knowledge/search/route.ts` | 20s | Embeddings + RPC |
| `src/components/analyze/CallAnalyzer.tsx` | 60s | Upload, 30s others |

---

## Task 4: Fix SSE Error Handling

**File**: `src/components/analyze/CallAnalyzer.tsx`

Current issues:
- No max retries for fallback polling
- No exponential backoff
- No explicit timeout for SSE

```typescript
// Improved SSE handling
useEffect(() => {
  if (!currentCallId || uploadState !== 'processing') return

  let retryCount = 0
  const maxRetries = 3
  const sseTimeout = 45000 // 45s before fallback

  const eventSource = new EventSource(`/api/analyze/${currentCallId}/stream`)
  const timeoutId = setTimeout(() => {
    eventSource.close()
    fallbackToPoll()
  }, sseTimeout)

  eventSource.onmessage = (event) => {
    clearTimeout(timeoutId)
    // ... existing logic
  }

  eventSource.onerror = () => {
    clearTimeout(timeoutId)
    eventSource.close()
    fallbackToPoll()
  }

  const fallbackToPoll = async () => {
    if (retryCount >= maxRetries) {
      setUploadState('error')
      setError('Processing timed out. Please try again.')
      return
    }

    retryCount++
    const delay = Math.pow(2, retryCount) * 1000 // 2s, 4s, 8s
    await sleep(delay)

    // Poll logic with timeout
  }

  return () => {
    clearTimeout(timeoutId)
    eventSource.close()
  }
}, [currentCallId, uploadState])
```

---

## Task 5: Structured Error Codes

**File**: `src/lib/errors.ts`

```typescript
export const ErrorCodes = {
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',

  // Validation
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_INPUT: 'INVALID_INPUT',

  // Processing
  TRANSCRIPTION_FAILED: 'TRANSCRIPTION_FAILED',
  SCORING_FAILED: 'SCORING_FAILED',

  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',

  // Server
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export const ErrorMessages: Record<string, string> = {
  NETWORK_ERROR: 'Unable to connect. Check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  RATE_LIMITED: 'Too many requests. Please wait a moment.',
  INVALID_FILE_TYPE: 'Unsupported file type. Use MP3, WAV, or M4A.',
  FILE_TOO_LARGE: 'File too large. Maximum size is 100MB.',
  TRANSCRIPTION_FAILED: 'Failed to transcribe audio. Try a clearer recording.',
  SCORING_FAILED: 'Failed to analyze call. Please try again.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Try again in a few minutes.',
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/fetch-utils.ts` | NEW - Timeout wrapper |
| `src/lib/retry.ts` | NEW - Retry logic |
| `src/lib/errors.ts` | NEW - Error codes |
| `src/lib/transcription/whisper.ts` | MODIFY - Add timeout + retry |
| `src/app/api/chat/route.ts` | MODIFY - Add timeout |
| `src/app/api/knowledge/search/route.ts` | MODIFY - Add timeout |
| `src/components/analyze/CallAnalyzer.tsx` | MODIFY - Fix SSE + error handling |

---

## Acceptance Criteria

- [x] All external API calls have timeouts
- [x] Whisper calls retry up to 3 times on transient errors
- [x] SSE fallback uses exponential backoff (3 retries, 2s/4s/8s)
- [x] Error messages are user-friendly and actionable
- [x] No hanging requests in production
- [x] Build succeeds
- [x] Unit tests pass (35/35)
- [x] Full test cycle complete

---

## Commands

```bash
# Run unit tests
npm run test

# Build
npm run build

# Deploy
vercel --prod
```
