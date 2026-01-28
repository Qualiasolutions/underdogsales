/**
 * Simple in-memory rate limiter
 * For production scale, consider using Redis or Upstash
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitRecord>()

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
let cleanupScheduled = false

function scheduleCleanup() {
  if (cleanupScheduled) return
  cleanupScheduled = true

  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }, CLEANUP_INTERVAL)
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually user ID or IP)
 * @param config - Rate limit configuration
 * @returns Object with allowed boolean and headers
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  scheduleCleanup()

  const now = Date.now()
  const key = identifier
  const record = rateLimitStore.get(key)

  if (!record || record.resetTime < now) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      allowed: true,
      remaining: config.max - 1,
      resetTime: now + config.windowMs,
    }
  }

  if (record.count >= config.max) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  // Increment counter
  record.count++
  return {
    allowed: true,
    remaining: config.max - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(
  remaining: number,
  resetTime: number,
  limit: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
  }
}

// Pre-configured rate limits for different endpoints
export const RATE_LIMITS = {
  // Login: 5 attempts per 15 minutes (brute force protection)
  login: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  // Signup: 3 per hour (abuse prevention)
  signup: {
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many signup attempts. Please try again later.',
  },
  // Upload: 10 uploads per 15 minutes
  upload: {
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many uploads. Please try again in a few minutes.',
  },
  // Transcribe: 5 per 15 minutes (expensive operation)
  transcribe: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many transcription requests. Please wait before trying again.',
  },
  // Chat: 60 per minute
  chat: {
    windowMs: 60 * 1000,
    max: 60,
    message: 'Too many messages. Please slow down.',
  },
  // Knowledge search: 30 per minute
  knowledge: {
    windowMs: 60 * 1000,
    max: 30,
    message: 'Too many search requests.',
  },
  // Retell search: 20 per minute
  'retell-search': {
    windowMs: 60 * 1000,
    max: 20,
    message: 'Too many search requests. Please slow down.',
  },
  // Default: 100 per minute
  default: {
    windowMs: 60 * 1000,
    max: 100,
    message: 'Too many requests.',
  },
} as const
