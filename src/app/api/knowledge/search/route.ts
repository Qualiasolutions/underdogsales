import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { searchKnowledgeBase } from '@/lib/knowledge'
import { logger } from '@/lib/logger'

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
      limit,
      threshold,
      source
    })

    return NextResponse.json({
      results,
      query,
      count: results.length
    })
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
