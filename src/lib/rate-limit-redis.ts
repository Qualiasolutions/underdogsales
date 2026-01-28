/**
 * Distributed rate limiting with Upstash Redis
 * Falls back to in-memory rate limiting when Redis is unavailable
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { checkRateLimit as checkRateLimitMemory, RATE_LIMITS } from './rate-limit'
import { logger } from './logger'

// Check if Redis is configured
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

// Create Redis client if configured
let redis: Redis | null = null
let ratelimiters: Map<string, Ratelimit> | null = null

function initRedis() {
  if (redis) return true

  if (!REDIS_URL || !REDIS_TOKEN) {
    return false
  }

  try {
    redis = new Redis({
      url: REDIS_URL,
      token: REDIS_TOKEN,
    })
    ratelimiters = new Map()
    return true
  } catch (error) {
    logger.warn('Failed to initialize Redis for rate limiting', { error: String(error) })
    return false
  }
}

// Get or create a ratelimiter for a specific config
function getRatelimiter(configKey: keyof typeof RATE_LIMITS): Ratelimit | null {
  if (!redis || !ratelimiters) return null

  const existing = ratelimiters.get(configKey)
  if (existing) return existing

  const config = RATE_LIMITS[configKey]
  const windowSeconds = Math.ceil(config.windowMs / 1000)

  const ratelimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.max, `${windowSeconds} s`),
    analytics: true,
    prefix: `ratelimit:${configKey}`,
  })

  ratelimiters.set(configKey, ratelimiter)
  return ratelimiter
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

/**
 * Async rate limiting with Redis (distributed) or in-memory fallback
 * Use this for all API routes that need distributed rate limiting
 */
export async function checkRateLimitAsync(
  identifier: string,
  configKey: keyof typeof RATE_LIMITS
): Promise<RateLimitResult> {
  // Try to initialize Redis
  const hasRedis = initRedis()

  if (!hasRedis) {
    // Fall back to in-memory rate limiting
    const config = RATE_LIMITS[configKey]
    return checkRateLimitMemory(identifier, config)
  }

  const ratelimiter = getRatelimiter(configKey)
  if (!ratelimiter) {
    // Fall back to in-memory rate limiting
    const config = RATE_LIMITS[configKey]
    return checkRateLimitMemory(identifier, config)
  }

  try {
    const result = await ratelimiter.limit(identifier)

    return {
      allowed: result.success,
      remaining: result.remaining,
      resetTime: result.reset,
    }
  } catch (error) {
    // Log and fall back to in-memory on Redis error
    logger.warn('Redis rate limit check failed, using in-memory fallback', {
      error: String(error),
      identifier,
      configKey,
    })

    const config = RATE_LIMITS[configKey]
    return checkRateLimitMemory(identifier, config)
  }
}

/**
 * Check if Redis is available for distributed rate limiting
 */
export function isRedisAvailable(): boolean {
  return initRedis()
}

// Re-export for convenience
export { RATE_LIMITS, createRateLimitHeaders } from './rate-limit'
