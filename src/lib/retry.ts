/**
 * Retry logic with exponential backoff
 */

import { sleep, isTimeoutError } from './fetch-utils'

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number
  /** Base delay in milliseconds (default: 1000) */
  baseDelay?: number
  /** Maximum delay in milliseconds (default: 10000) */
  maxDelay?: number
  /** Custom retry condition function */
  shouldRetry?: (error: Error, attempt: number) => boolean
  /** Callback on each retry attempt */
  onRetry?: (error: Error, attempt: number, delay: number) => void
}

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = options

  let lastError: Error = new Error('Unknown error')

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on last attempt or if condition says no
      if (attempt === maxAttempts || !shouldRetry(lastError, attempt)) {
        throw lastError
      }

      // Calculate delay with jitter
      const delay = calculateDelay(attempt, baseDelay, maxDelay)

      // Notify about retry
      onRetry?.(lastError, attempt, delay)

      await sleep(delay)
    }
  }

  throw lastError
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  // Exponential backoff: baseDelay * 2^(attempt-1)
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1)

  // Add random jitter (0-1000ms)
  const jitter = Math.random() * 1000

  // Cap at maxDelay
  return Math.min(exponentialDelay + jitter, maxDelay)
}

/**
 * Default retry condition - retries on network errors and specific HTTP codes
 */
function defaultShouldRetry(error: Error): boolean {
  // Get message early to avoid type narrowing issues
  const message = error.message || ''

  // Don't retry timeouts (likely overloaded, need to back off more)
  if (isTimeoutError(error)) return false

  // Retry on network errors
  if (
    message.includes('fetch failed') ||
    message.includes('network') ||
    message.includes('Failed to fetch')
  ) {
    return true
  }

  return false
}

/**
 * Check if HTTP response status is retryable
 */
export function isRetryableStatus(status: number): boolean {
  return [429, 502, 503, 504].includes(status)
}

/**
 * Create a retry condition that includes HTTP status checks
 */
export function createHttpRetryCondition(
  response?: Response
): (error: Error) => boolean {
  return (error: Error) => {
    // Check HTTP status if available
    if (response && isRetryableStatus(response.status)) {
      return true
    }
    return defaultShouldRetry(error)
  }
}

/**
 * Retry wrapper specifically for fetch requests
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return withRetry(async () => {
    const response = await fetch(url, options)

    // Throw on retryable status codes to trigger retry
    if (isRetryableStatus(response.status)) {
      const retryAfter = response.headers.get('Retry-After')
      throw new RetryableError(
        `HTTP ${response.status}`,
        response.status,
        retryAfter ? parseInt(retryAfter, 10) * 1000 : undefined
      )
    }

    return response
  }, {
    ...retryOptions,
    shouldRetry: (error) => {
      if (error instanceof RetryableError) return true
      return defaultShouldRetry(error)
    },
  })
}

/**
 * Error class for retryable HTTP errors
 */
export class RetryableError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfter?: number
  ) {
    super(message)
    this.name = 'RetryableError'
  }
}
