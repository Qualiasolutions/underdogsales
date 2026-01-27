/**
 * Web Search API for Retell AI Coach (Giulio)
 *
 * Retell custom tools send POST with args directly in body.
 * Returns JSON with result that Retell extracts via response_variables.
 */

import { NextRequest, NextResponse } from 'next/server'

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
    const body: SearchRequest = await request.json()

    // Handle both formats: args at root or nested
    const query = body.query || body.args?.query

    console.log('Retell search request:', JSON.stringify(body))

    if (!query) {
      return NextResponse.json({
        result: 'No search query provided.',
        success: false
      })
    }

    const searchResult = await performWebSearch(query)

    console.log('Search result:', searchResult.substring(0, 100))

    // Return in format Retell can extract
    return NextResponse.json({
      result: searchResult,
      success: true,
      query: query
    })

  } catch (error) {
    console.error('Retell search error:', error)
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
      console.error('OpenRouter error:', response.status, errorText)
      return 'I could not search right now. Let me share what I know instead.'
    }

    const data = await response.json()
    const result = data.choices?.[0]?.message?.content

    if (!result) {
      return 'The search did not return results. Let me help with what I know.'
    }

    return result

  } catch (error) {
    console.error('Search fetch error:', error)
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
