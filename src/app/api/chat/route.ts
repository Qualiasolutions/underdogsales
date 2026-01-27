import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GIULIO_SYSTEM_PROMPT } from '@/lib/vapi/giulio-prompt'
import { getUser } from '@/lib/supabase/server'
import { checkRateLimit, createRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit'
import { ChatRequestSchema, validateInput } from '@/lib/validations'
import { ErrorCodes, createErrorResponse } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { openrouterCircuit, CircuitOpenError } from '@/lib/circuit-breaker'

const CHAT_TIMEOUT = 30000 // 30 seconds
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

// Web search using Perplexity/Sonar via OpenRouter
async function performWebSearch(query: string): Promise<string | null> {
  if (!OPENROUTER_API_KEY) {
    logger.warn('No OpenRouter API key for web search')
    return null
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://underdogsales.vercel.app',
        'X-Title': 'Underdog Sales Coach',
      },
      body: JSON.stringify({
        model: 'perplexity/sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a sales research assistant. Provide detailed, factual information about companies, industries, and prospects. Include: company overview, what they do, key people if available, recent news, and potential pain points a salesperson could address. Be thorough but organized.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      logger.error('Web search failed', { status: response.status })
      return null
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || null
  } catch (error) {
    logger.exception('Web search error', error, { query })
    return null
  }
}

// Detect if query needs web search (company names, external research)
function needsWebSearch(message: string, mode?: string): boolean {
  if (mode === 'research') return true

  const researchPatterns = [
    /research\s+(about|on|for)\s+/i,
    /look\s*up\s+/i,
    /find\s+(info|information|out)\s+(about|on)/i,
    /what\s+(do\s+you\s+know|can\s+you\s+find)\s+about/i,
    /tell\s+me\s+about\s+\w+\s+(company|inc|ltd|corp|llc|gmbh|solutions)/i,
    /\.(com|net|org|io|ai|co)\b/i, // Domain names
    /who\s+(is|are)\s+/i,
  ]

  return researchPatterns.some(pattern => pattern.test(message))
}

// OpenRouter client for LLM requests
function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured')
  }
  return new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    timeout: CHAT_TIMEOUT,
    maxRetries: 2,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://underdogsales.vercel.app',
      'X-Title': 'Underdog Sales Coach',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check rate limit
    const rateLimitResult = checkRateLimit(`chat:${user.id}`, RATE_LIMITS.chat)
    const headers = createRateLimitHeaders(
      rateLimitResult.remaining,
      rateLimitResult.resetTime,
      RATE_LIMITS.chat.max
    )

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: RATE_LIMITS.chat.message },
        { status: 429, headers }
      )
    }

    // Validate input
    const body = await request.json()
    const validation = validateInput(ChatRequestSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers }
      )
    }

    const { messages, mode } = validation.data!

    // Build system prompt with coaching mode context
    let systemPrompt = GIULIO_SYSTEM_PROMPT

    // RAG: Search knowledge base based on user input (last message)
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1].content

      // Web search for research mode or detected research queries
      if (needsWebSearch(lastMessage, mode)) {
        logger.info('Performing web search', { mode, query: lastMessage.substring(0, 100) })
        const webResults = await performWebSearch(lastMessage)

        if (webResults) {
          systemPrompt += `\n\n## WEB RESEARCH RESULTS\n${webResults}\n\nUse this research to help the user prepare for their sales call. Suggest specific cold call openers and talking points based on what you learned about the company/prospect.`
        }
      }

      // Also search local knowledge base (skip if research mode to prioritize web results)
      if (mode !== 'research') {
        const { searchKnowledgeBase } = await import('@/lib/knowledge')

        const knowledgeResults = await searchKnowledgeBase(lastMessage, {
          limit: 3,
          threshold: 0.55
        })

        if (knowledgeResults.length > 0) {
          const knowledgeContext = knowledgeResults
            .map(k => `[SOURCE: ${k.source_file}]\n${k.content}`)
            .join('\n\n')

          systemPrompt += `\n\nRELEVANT KNOWLEDGE BASE CONTEXT:\n${knowledgeContext}\n\nUse this context to answer the user's questions accurately. Quote the methodology when appropriate.`
        }
      }
    }

    if (mode) {
      const modeContext: Record<string, string> = {
        pitch: '\n\nThe user wants to build their pitch. Focus on crafting a compelling cold call opener and value proposition.',
        objections: '\n\nThe user wants to practice objection handling. Role-play as a prospect giving objections, then coach them on responses.',
        research: '\n\nThe user is researching prospects. Use the web research results to provide detailed company insights and suggest specific cold call strategies, openers, and pain points to address.',
        general: '\n\nThe user wants free-form coaching. Answer any sales-related questions they have.',
      }
      systemPrompt += modeContext[mode] || ''
    }

    const client = getOpenRouterClient()

    // Use circuit breaker to prevent cascading failures
    const response = await openrouterCircuit.execute(() =>
      client.chat.completions.create({
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system' as const, content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        ],
        temperature: 0.8,
        max_tokens: 1000,
      })
    ) as OpenAI.Chat.Completions.ChatCompletion

    const assistantMessage = response.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.'

    return NextResponse.json({ message: assistantMessage }, { headers })
  } catch (error) {
    logger.exception('Chat API error', error, { operation: 'chat' })

    // Handle specific error types
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        return NextResponse.json(
          createErrorResponse(ErrorCodes.RATE_LIMITED),
          { status: 429 }
        )
      }
      if (error.status === 503 || error.status === 502) {
        return NextResponse.json(
          createErrorResponse(ErrorCodes.SERVICE_UNAVAILABLE),
          { status: 503 }
        )
      }
    }

    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        createErrorResponse(ErrorCodes.TIMEOUT),
        { status: 408 }
      )
    }

    // Handle circuit breaker open
    if (error instanceof CircuitOpenError) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      createErrorResponse(ErrorCodes.INTERNAL_ERROR),
      { status: 500 }
    )
  }
}
