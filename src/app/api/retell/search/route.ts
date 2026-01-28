/**
 * Web Search API for Retell AI Coach (Giulio)
 *
 * Retell custom tools send POST with args directly in body.
 * Returns JSON with result that Retell extracts via response_variables.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { checkRateLimitAsync, createRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit-redis'
import { logger } from '@/lib/logger'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

// Retell sends args directly or under "args" key
interface SearchRequest {
  query?: string
  args?: {
    query?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', result: 'Authentication required.', success: false },
        { status: 401 }
      )
    }

    // Check rate limit (distributed via Redis)
    const rateLimitResult = await checkRateLimitAsync(`retell-search:${user.id}`, 'retell-search')
    const headers = createRateLimitHeaders(
      rateLimitResult.remaining,
      rateLimitResult.resetTime,
      RATE_LIMITS['retell-search'].max
    )

    if (!rateLimitResult.allowed) {
      logger.warn('Retell search rate limited', {
        operation: 'retell_search',
        userId: user.id,
        resetTime: rateLimitResult.resetTime,
      })
      return NextResponse.json(
        { error: RATE_LIMITS['retell-search'].message, result: 'Too many requests. Please slow down.', success: false },
        { status: 429, headers }
      )
    }

    const body: SearchRequest = await request.json()

    // Handle both formats: args at root or nested
    const query = body.query || body.args?.query

    logger.info('Retell search request', { operation: 'retell_search', userId: user.id, query: query?.substring(0, 50) })

    if (!query) {
      return NextResponse.json({
        result: 'No search query provided.',
        success: false
      }, { headers })
    }

    const searchResult = await performWebSearch(query)

    logger.debug('Retell search completed', { operation: 'retell_search', resultLength: searchResult.length })

    // Return in format Retell can extract
    return NextResponse.json({
      result: searchResult,
      success: true,
      query: query
    }, { headers })

  } catch (error) {
    logger.exception('Retell search error', error, { operation: 'retell_search' })
    return NextResponse.json({
      result: 'Sorry, the search encountered an error.',
      success: false
    })
  }
}

async function performWebSearch(query: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    return 'I cannot search right now, but let me help you with what I know about this topic.'
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://underdogsales.vercel.app',
        'X-Title': 'Underdog Sales Coach',
      },
      body: JSON.stringify({
        model: 'perplexity/sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a sales research assistant. Provide concise, practical information. Keep responses under 100 words, suitable for spoken conversation. No bullet points or formatting.',
          },
          {
            role: 'user',
            content: `Search for: ${query}. Give a brief spoken summary.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('OpenRouter web search error', { status: response.status, error: errorText })
      return 'I could not search right now. Let me share what I know instead.'
    }

    const data = await response.json()
    const result = data.choices?.[0]?.message?.content

    if (!result) {
      return 'The search did not return results. Let me help with what I know.'
    }

    return result

  } catch (error) {
    logger.exception('Search fetch error', error, { operation: 'retell_search' })
    return 'Search failed. Let me help you with what I know about this.'
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'retell-web-search',
    hasApiKey: !!OPENROUTER_API_KEY
  })
}
