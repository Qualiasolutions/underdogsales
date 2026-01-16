import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

interface SearchRequest {
  query: string
  source?: 'wiki' | 'persona' | 'rubric' | 'curriculum'
  limit?: number
  threshold?: number
}

interface KnowledgeResult {
  id: string
  source: string
  source_file: string
  section_title: string
  content: string
  topics: string[]
  similarity: number
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json()
    const { query, source, limit = 5, threshold = 0.7 } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Generate embedding for query using OpenRouter
    const openrouterClient = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    })
    const embeddingResponse = await openrouterClient.embeddings.create({
      model: 'openai/text-embedding-3-small',
      input: query.trim(),
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // Search knowledge base
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase.rpc('match_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_source: source || null,
    })

    if (error) {
      console.error('Knowledge search error:', error)
      return NextResponse.json(
        { error: 'Search failed', details: error.message },
        { status: 500 }
      )
    }

    const results: KnowledgeResult[] = (data || []).map((item: {
      id: string
      source: string
      source_file: string
      section_title: string
      content: string
      topics: string[]
      similarity: number
    }) => ({
      id: item.id,
      source: item.source,
      source_file: item.source_file,
      section_title: item.section_title,
      content: item.content,
      topics: item.topics,
      similarity: item.similarity,
    }))

    return NextResponse.json({
      results,
      query,
      count: results.length
    })
  } catch (error) {
    console.error('Knowledge search error:', error)
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
