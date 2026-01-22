# Testing Patterns

**Analysis Date:** 2026-01-23

## Test Framework

**Runner:**
- Vitest 4.0.17
- Config: `vitest.config.ts`
- Environment: jsdom (browser-like)
- Globals enabled (describe, it, expect available without imports)

**E2E Framework:**
- Playwright 1.57.0
- Config: `playwright.config.ts`
- Browser: Chromium only
- Screenshot on failure enabled
- Trace on first retry enabled

**Assertion Library:**
- Vitest (includes chai-like assertions)
- Playwright test assertions (`.toHaveURL()`, `.toBeVisible()`, etc.)

**Run Commands:**
```bash
npm run test              # Run all unit tests
npm run test:watch       # Watch mode for development
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests with Playwright
```

## Test File Organization

**Location:**
- Unit tests: `tests/unit/` - Co-located by feature
- E2E tests: `tests/e2e/` - Separate directory structure
- Setup file: `tests/setup.ts` - Global setup with testing-library/jest-dom

**Naming:**
- Unit: `*.test.ts` - Example: `config.test.ts`, `scoring.test.ts`
- E2E: `*.spec.ts` - Example: `auth.spec.ts`, `practice.spec.ts`

**Structure:**
```
tests/
├── setup.ts              # Global setup file
├── unit/
│   ├── config.test.ts    # Test configuration files
│   └── scoring.test.ts   # Test scoring engine
└── e2e/
    ├── auth.spec.ts      # Authentication flow tests
    ├── practice.spec.ts   # Practice session tests
    └── analysis.spec.ts   # Call analysis tests
```

## Test Structure

**Suite Organization:**

Unit tests use nested describe blocks:
```typescript
import { describe, it, expect } from 'vitest'
import { getPersonaById, getAllPersonas } from '@/config/personas'

describe('Personas Configuration', () => {
  describe('getPersonaById', () => {
    it('should return persona by id', () => {
      const persona = getPersonaById('skeptical_cfo')
      expect(persona).toBeDefined()
      expect(persona?.name).toBe('Sarah Chen')
    })

    it('should return undefined for unknown id', () => {
      const persona = getPersonaById('nonexistent')
      expect(persona).toBeUndefined()
    })
  })
})
```

E2E tests use Playwright's test.describe:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('redirects unauthenticated users from protected routes', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/)
  })
})
```

**Patterns:**

1. **Setup:** Arrange test data or state
2. **Action:** Execute the function/feature
3. **Assert:** Verify the result

Example:
```typescript
it('should score permission-based openers highly', () => {
  // Arrange
  const input: ScoringInput = {
    transcript: [
      { role: 'user', content: "Hi, I'll be completely honest, this is a cold call. Can I have 30 seconds?", timestamp: 1000 },
    ],
    durationSeconds: 15,
    scenarioType: 'cold_call',
  }

  // Act
  const result = analyzeTranscript(input)

  // Assert
  expect(result.dimensionScores.opener.score).toBeGreaterThanOrEqual(5)
})
```

**Teardown:**
- No explicit teardown needed (jsdom isolated per test)
- Playwright tests use automatic browser context cleanup

## Mocking

**Framework:** Vitest spy/mock (built-in)

**Patterns:**

Configuration-based unit tests (no mocking):
```typescript
describe('Personas Configuration', () => {
  it('should have all required personas', () => {
    for (const id of requiredPersonas) {
      expect(PERSONAS[id]).toBeDefined()
      expect(PERSONAS[id].name).toBeTruthy()
    }
  })
})
```

Integration with real config:
```typescript
describe('Scoring Engine', () => {
  it('should return a valid scoring result', () => {
    const input: ScoringInput = { ... }
    const result = analyzeTranscript(input)
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
  })
})
```

**What to Mock:**
- External API calls (OpenAI, Supabase) - Not done in current tests; integration tests used instead
- Timers for retry/circuit breaker logic (when testing delays)
- Browser APIs like `fetch()` if needed (not currently done)

**What NOT to Mock:**
- Configuration objects: test with real personas, rubric, curriculum
- Scoring engine: uses real algorithm with test transcripts
- Validation logic: test with real Zod schemas
- Error handling: test with real error codes and messages

## Fixtures and Factories

**Test Data:**

Inline test data in test files:
```typescript
const input: ScoringInput = {
  transcript: [
    { role: 'assistant', content: 'Hello?', timestamp: 0 },
    {
      role: 'user',
      content: "Hi, I'll be upfront, this is a cold call. Do you mind if I have 30 seconds?",
      timestamp: 1000,
    },
    { role: 'assistant', content: 'Sure, go ahead.', timestamp: 2000 },
  ],
  durationSeconds: 60,
  scenarioType: 'cold_call',
}
```

Multi-case test data in describe blocks:
```typescript
const personas = [
  'skeptical_cfo',
  'busy_vp_sales',
  'friendly_gatekeeper',
  'defensive_manager',
  'interested_but_stuck',
  'aggressive_closer',
]

for (const id of personas) {
  expect(PERSONAS[id]).toBeDefined()
}
```

**Location:**
- Inline in test files (no shared fixtures yet)
- Test data organized by feature/endpoint
- Reuse across related tests in same describe block

## Coverage

**Requirements:** Not explicitly enforced

**View Coverage:**
```bash
npm run test:coverage
```

**Coverage by module:**
- Config files (personas, rubric, curriculum): High coverage - declarative data with validators
- Scoring engine: Comprehensive - multiple test cases per dimension
- Error handling: Good - error code mapping and message generation tested
- Retry/circuit breaker: Moderate - basic happy path tests

## Test Types

**Unit Tests:**

Scope: Single functions and modules
Location: `tests/unit/`
Approach: Direct function calls with test data, no external dependencies

Examples:
- `config.test.ts`: Personas, curriculum, rubric validators
  ```typescript
  it('should have 6 dimensions', () => {
    expect(SCORING_RUBRIC.length).toBe(6)
  })
  ```

- `scoring.test.ts`: Scoring engine algorithm
  ```typescript
  it('should score permission-based openers highly', () => {
    const result = analyzeTranscript(input)
    expect(result.dimensionScores.opener.score).toBeGreaterThanOrEqual(5)
  })
  ```

**Integration Tests:**
- None yet; uses E2E tests for integration validation

**E2E Tests:**

Scope: Full user flows through UI
Location: `tests/e2e/`
Browser: Chromium
Approach: Playwright page navigation and interaction

`auth.spec.ts`:
```typescript
test('redirects unauthenticated users from protected routes', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/login/)
})

test('shows validation errors for invalid email', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder(/email/i).fill('invalid-email')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page.getByText(/invalid|email/i)).toBeVisible()
})
```

`practice.spec.ts`:
```typescript
test('shows all 6 personas', async ({ page }) => {
  await page.goto('/practice')
  const personas = [
    'Skeptical CFO',
    'Busy VP Sales',
    // ...
  ]
  for (const persona of personas) {
    await expect(page.getByText(persona)).toBeVisible()
  }
})

test('persona selection highlights selected card', async ({ page }) => {
  await page.goto('/practice')
  const busyVP = page.getByText('Busy VP Sales').first()
  if (await busyVP.isVisible()) {
    await busyVP.click()
    await expect(page.locator('[class*="ring-gold"]').first()).toBeVisible()
  }
})
```

`analysis.spec.ts`:
- Call upload flow
- Results page rendering
- Error state handling

## Common Patterns

**Async Testing:**

Unit test with async function:
```typescript
it('should return a valid scoring result', () => {
  const input: ScoringInput = { ... }
  const result = analyzeTranscript(input)  // Synchronous in this case
  expect(result.overallScore).toBeGreaterThanOrEqual(0)
})
```

E2E test with async navigation:
```typescript
test('redirects unauthenticated users from protected routes', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/login/)
})
```

Playwright waits for async operations:
```typescript
test('clicking start shows connecting state', async ({ page }) => {
  await page.getByRole('button', { name: /start practice call/i }).click()
  const connecting = page.getByText(/connecting/i)
  await expect(connecting).toBeVisible({ timeout: 10000 })
})
```

**Error Testing:**

Configuration validator catches missing properties:
```typescript
it('should have required fields', () => {
  for (const module of CURRICULUM_MODULES) {
    expect(module.id).toBeGreaterThan(0)
    expect(module.name).toBeTruthy()
    expect(module.description).toBeTruthy()
  }
})
```

Scoring engine detects specific failures:
```typescript
it('should fail avoided_triggers criterion', () => {
  const input: ScoringInput = {
    transcript: [
      { role: 'user', content: "Let's book a meeting. I'll send you a calendar invite for a demo.", timestamp: 1000 },
    ],
    durationSeconds: 15,
    scenarioType: 'closing',
  }

  const result = analyzeTranscript(input)
  expect(result.dimensionScores.closing.criteria.some(c => c.name === 'avoided_triggers' && !c.passed)).toBe(true)
})
```

E2E error state handling:
```typescript
test('shows validation errors for empty password', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder(/email/i).fill('test@example.com')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page.getByText(/password|required/i)).toBeVisible()
})
```

**Conditional Testing (E2E):**

Tests account for authentication state:
```typescript
test('shows persona selection', async ({ page }) => {
  await page.goto('/practice')
  const pageUrl = page.url()

  if (pageUrl.includes('/login')) {
    // Redirect behavior verified
    await expect(page).toHaveURL(/login/)
  } else {
    // Authenticated flow
    await expect(page.getByText(/choose your challenge/i)).toBeVisible()
  }
})
```

Tests handle missing VAPI configuration:
```typescript
test('clicking start shows connecting state', async ({ page }) => {
  await page.goto('/practice')
  const startButton = page.getByRole('button', { name: /start practice call/i })

  if (await startButton.isVisible()) {
    await startButton.click()
    const connecting = page.getByText(/connecting/i)
    const error = page.getByText(/error|not configured/i)
    await expect(connecting.or(error)).toBeVisible()
  }
})
```

## Test Examples

**Config Test Example:**
Location: `tests/unit/config.test.ts`
```typescript
import { describe, it, expect } from 'vitest'
import { PERSONAS, getPersonaById } from '@/config/personas'
import { SCORING_RUBRIC, getDimensionWeight } from '@/config/rubric'

describe('Scoring Rubric Configuration', () => {
  it('should have weights summing to approximately 1', () => {
    const totalWeight = SCORING_RUBRIC.reduce((sum, r) => sum + r.weight, 0)
    expect(totalWeight).toBeCloseTo(1, 2)
  })

  it('should return correct weight', () => {
    const weight = getDimensionWeight('discovery')
    expect(weight).toBe(0.25)
  })
})
```

**Scoring Engine Test Example:**
Location: `tests/unit/scoring.test.ts`
```typescript
describe('Scoring Engine', () => {
  it('should detect when someone rushes to solution', () => {
    const input: ScoringInput = {
      transcript: [
        { role: 'user', content: 'Our solution does amazing things! Let me show you a demo.', timestamp: 1000 },
      ],
      durationSeconds: 20,
      scenarioType: 'cold_call',
    }

    const result = analyzeTranscript(input)
    expect(result.dimensionScores.discovery.criteria.some(c => c.name === 'stayed_on_problem' && !c.passed)).toBe(true)
  })

  it('should provide improvement suggestions', () => {
    const input: ScoringInput = { ... }
    const result = analyzeTranscript(input)
    expect(result.improvements.length).toBeGreaterThan(0)
  })
})
```

**E2E Test Example:**
Location: `tests/e2e/auth.spec.ts`
```typescript
test.describe('Authentication Flow', () => {
  test('shows login page correctly', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('link to signup from login works', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /sign up|create account/i }).click()
    await expect(page).toHaveURL(/signup/)
  })
})
```

---

*Testing analysis: 2026-01-23*
