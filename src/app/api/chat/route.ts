import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GIULIO_SYSTEM_PROMPT } from '@/lib/vapi/giulio-prompt'
import { getUser } from '@/lib/supabase/server'
import { checkRateLimit, createRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit'
import { ChatRequestSchema, validateInput } from '@/lib/validations'

// Lazy-load OpenAI client to avoid build-time errors
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : undefined,
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

    if (mode) {
      const modeContext: Record<string, string> = {
        curriculum: '\n\nThe user wants to learn the curriculum. Focus on teaching the 12 modules systematically.',
        objections: '\n\nThe user wants to practice objection handling. Role-play as a prospect giving objections, then coach them on responses.',
        techniques: '\n\nThe user wants to learn specific techniques. Focus on openers, pitch, discovery, and closing frameworks.',
        free: '\n\nThe user wants free-form coaching. Answer any sales-related questions they have.',
      }
      systemPrompt += modeContext[mode] || ''
    }

    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_API_KEY ? 'openai/gpt-4o' : 'gpt-4o',
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

    const assistantMessage = response.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.'

    return NextResponse.json({ message: assistantMessage }, { headers })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
