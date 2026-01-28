import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { searchKnowledgeBase } from '@/lib/knowledge'
import { logger } from '@/lib/logger'
import { checkRateLimitAsync, createRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit-redis'

interface SearchRequest {
  query: string
  source?: string
  limit?: number
  threshold?: number
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Apply rate limiting (knowledge search triggers expensive embedding API calls)
    const rateLimitResult = await checkRateLimitAsync(
      `knowledge:${user.id}`,
      'knowledge'
    )

    if (!rateLimitResult.allowed) {
      logger.warn('Knowledge search rate limited', {
        operation: 'knowledge_search',
        userId: user.id,
        resetTime: rateLimitResult.resetTime,
      })
      return NextResponse.json(
        { error: RATE_LIMITS.knowledge.message },
        {
          status: 429,
          headers: createRateLimitHeaders(
            rateLimitResult.remaining,
            rateLimitResult.resetTime,
            RATE_LIMITS.knowledge.max
          ),
        }
      )
    }

    const body: SearchRequest = await request.json()
    const { query, source, limit = 5, threshold = 0.5 } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Use shared knowledge service
    const results = await searchKnowledgeBase(query, {
      limit: Math.min(limit, 10), // Cap at 10 results
      threshold: Math.max(0.3, Math.min(threshold, 0.9)), // Clamp threshold
      source
    })

    return NextResponse.json(
      {
        results,
        query,
        count: results.length
      },
      {
        headers: createRateLimitHeaders(
          rateLimitResult.remaining,
          rateLimitResult.resetTime,
          RATE_LIMITS.knowledge.max
        ),
      }
    )
  } catch (error) {
    logger.exception('Knowledge search error', error, { operation: 'knowledge_search' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/knowledge/search',
    method: 'POST',
    body: {
      query: 'string (required)',
      source: 'wiki | persona | rubric | curriculum (optional)',
      limit: 'number (default: 5)',
      threshold: 'number (default: 0.7)',
    },
  })
}
