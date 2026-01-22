# Coding Conventions

**Analysis Date:** 2026-01-23

## Naming Patterns

**Files:**
- Kebab-case for regular modules: `circuit-breaker.ts`, `fetch-utils.ts`, `rate-limit.ts`
- Kebab-case for API routes: `[callId]`, `analyze`, `webhook`
- PascalCase for React components: `Analyze.tsx`, `Practice.tsx`
- Index files for barrel exports: `src/components/ui/index.ts`, `src/components/analyze/index.ts`

**Functions:**
- camelCase for all function names: `getAdminClient()`, `analyzeTranscript()`, `validateInput()`
- Prefix with verb: `get*`, `create*`, `save*`, `check*`, `analyze*`
- Private/internal functions use underscore prefix: `_transitionTo()`, `_onSuccess()`, `_onFailure()`
- Server actions use descriptive verbs: `savePracticeSession()`, `getCallAnalysis()`, `updateProgress()`

**Variables:**
- camelCase for all variables and constants: `isDev`, `errorMessage`, `startTime`, `maxAttempts`
- UPPERCASE_SNAKE_CASE for exported constants: `AUDIO_CONTENT_TYPES`, `PERSONAS`, `CURRICULUM_MODULES`
- CONST in error codes: `ErrorCodes.NETWORK_ERROR`, `ErrorCodes.TIMEOUT`
- Prefix booleans with `is`, `has`, `should`: `isAvailable()`, `isDev`, `shouldRetry()`

**Types:**
- PascalCase for all types: `ServiceStatus`, `LogLevel`, `CircuitBreakerOptions`, `ValidationResult`
- Suffix interfaces with no prefix: `LogContext`, `LogEntry`, `ApiErrorResponse`
- Suffix error classes with `Error`: `AppError`, `CircuitOpenError`, `RetryableError`
- Generic type parameters use single letter: `<T>`, `<T, R>`
- Database row types suffix with `Row`: `RoleplaySessionRow`, `SessionScoreRow`

## Code Style

**Formatting:**
- ESLint with Next.js config (`eslint-config-next/core-web-vitals` + TypeScript)
- Semicolons: Required (enforced by config)
- Line length: Not explicitly enforced; typical 80-120 chars per line
- Indentation: 2 spaces (inferred from .tsx files)

**Linting:**
- Config: `.eslintrc.mjs` using new flat config format
- Next.js web vitals and TypeScript rules enabled
- No Prettier config detected; relies on ESLint formatting

## Import Organization

**Order:**
1. External packages: `import { z } from 'zod'`, `import { NextResponse } from 'next/server'`
2. Internal types/interfaces: `import type { LogContext, LogEntry } from '@/lib/logger'`
3. Internal utilities: `import { logger } from '@/lib/logger'`, `import { ErrorCodes } from '@/lib/errors'`
4. Config files: `import { PERSONAS } from '@/config/personas'`, `import { SCORING_RUBRIC } from '@/config/rubric'`
5. Components: `import { AnalyzeForm } from '@/components/analyze'`
6. Server directives at top: `'use server'`

**Path Aliases:**
- `@/*` → `./src/*` - Always use this, never relative paths like `../../../lib`
- Applied in `tsconfig.json` and vitest config
- Examples: `@/lib/logger`, `@/config/personas`, `@/types`, `@/lib/supabase/admin`

## Error Handling

**Patterns:**

Custom error class pattern:
```typescript
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string,
    public details?: string
  ) {
    super(message || ErrorMessages[code])
    this.name = 'AppError'
  }
}
```

Structured error codes:
```typescript
export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  INVALID_INPUT: 'INVALID_INPUT',
  // ... indexed for type-safe lookups
} as const
```

Error responses:
```typescript
export interface ApiErrorResponse {
  error: string
  code?: ErrorCode
  details?: string
  retryAfter?: number
}
```

Type narrowing with instanceof:
```typescript
const message = error instanceof Error ? error.message : String(error)
const stack = error instanceof Error ? error.stack : undefined
```

Mapping HTTP status to error codes:
```typescript
export function httpStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400: return ErrorCodes.INVALID_INPUT
    case 429: return ErrorCodes.RATE_LIMITED
    // ...
  }
}
```

## Logging

**Framework:** Structured logging via `src/lib/logger.ts`

**Patterns:**

Development mode uses colored console output:
```typescript
const logger = {
  debug: (message: string, context?: LogContext) => {
    if (isDev) log('debug', message, context)
  },
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
}
```

Production mode outputs JSON for log aggregation:
```typescript
console[level](JSON.stringify(entry))
```

Structured context object:
```typescript
interface LogContext {
  requestId?: string
  userId?: string
  operation?: string
  duration?: number
  statusCode?: number
  error?: string
  [key: string]: unknown
}
```

Specialized logging methods:
```typescript
logger.request(method, path, statusCode, duration, context)  // API requests
logger.exception(message, error, context)                     // Exceptions with stack
logger.info('message', { userId: '123', operation: 'login' }) // Custom context
```

When to log:
- **INFO**: Normal operations, successful API calls, session starts/ends
- **WARN**: Retries, degraded service, unexpected conditions
- **ERROR**: Failed operations, unhandled errors, security issues
- **DEBUG**: Development only, internal state changes, detailed traces

## Comments

**When to Comment:**
- Complex algorithms or business logic: `// Exponential backoff: baseDelay * 2^(attempt-1)`
- Non-obvious workarounds: `// PGRST116 is "no rows returned" which is fine`
- Circuit breaker pattern state transitions: `// Check if circuit should transition from open to half-open`
- Magic numbers: Explain why (e.g., `maxDelay = 10000 // 10 seconds max`

**JSDoc/TSDoc:**
- File headers with purpose: `/** Structured logging utility for production observability */`
- Function documentation for public APIs:
  ```typescript
  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T>
  ```
- Parameter documentation for complex types:
  ```typescript
  interface CircuitBreakerOptions {
    /** Name of the service being protected */
    name: string
    /** Number of failures before opening the circuit */
    failureThreshold: number
  }
  ```
- No comments on trivial code or obvious implementations

## Function Design

**Size:**
- Typical: 20-50 lines
- Utilities can be shorter (5-10 lines): `cn()` utility, simple getters
- Complex logic split into smaller helpers: `calculateDelay()`, `formatLogEntry()`
- Single responsibility principle enforced (one job per function)

**Parameters:**
- Single object parameter for multiple related args:
  ```typescript
  export interface CircuitBreakerOptions {
    name: string
    failureThreshold: number
    resetTimeout: number
  }

  export class CircuitBreaker {
    constructor(options: CircuitBreakerOptions) { ... }
  }
  ```
- Generic type parameters when reusable: `async execute<T>(fn: () => Promise<T>): Promise<T>`
- Optional configs with defaults: `options: RetryOptions = {}`

**Return Values:**
- Explicit types on all public functions (no implicit any)
- Use union types for error handling: `Promise<T> | null`
- Return structured objects for complex results:
  ```typescript
  interface ValidationResult<T> {
    success: boolean
    data?: T
    error?: string
    errors?: Record<string, string>
  }
  ```
- Async functions always return Promise explicitly: `Promise<void>`, `Promise<SaveSessionResult>`

## Module Design

**Exports:**
- Named exports preferred: `export const logger = { ... }`
- Default exports only for page/layout components in Next.js
- Type exports use `export type`: `export type { LogContext, LogEntry }`
- Organize related exports: Error codes, then messages, then functions

**Barrel Files:**
- `src/components/ui/index.ts` re-exports UI components
- `src/components/analyze/index.ts` re-exports analyze components
- Keep barrel files minimal, just re-exports

## Service/Library Patterns

**Circuit Breaker Pattern:**
- States: `closed` (normal) → `open` (failing) → `half-open` (testing)
- Pre-configured instances: `openaiCircuit`, `openrouterCircuit`, `vapiCircuit`, `supabaseCircuit`
- Used for external API protection

**Retry Pattern:**
- Exponential backoff with jitter: `baseDelay * 2^(attempt-1) + random(0-1000)`
- Configurable via `RetryOptions`: `maxAttempts`, `baseDelay`, `maxDelay`, `shouldRetry`
- HTTP status check: `[429, 502, 503, 504]` are retryable

**Validation Pattern:**
- Zod schemas for all API inputs
- Schemas organized by domain: ChatRequestSchema, UploadRequestSchema, etc.
- Comments separating schema groups:
  ```typescript
  // ============================================
  // Chat API Schemas
  // ============================================
  ```

**Database Access Pattern:**
- Server actions use `'use server'` directive
- Admin client for server-side operations: `getAdminClient()`
- User context passed explicitly: `const user = await getUser()`
- Type-safe database rows defined as interfaces: `RoleplaySessionRow`, `SessionScoreRow`

---

*Convention analysis: 2026-01-23*
