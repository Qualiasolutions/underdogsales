import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import crypto from 'crypto'

// Verify VAPI webhook signature
function verifyVapiSignature(
  payload: string,
  signature: string | null,
  secret: string | undefined
): boolean {
  if (!signature || !secret) {
    return false
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

// VAPI Webhook Payload Types
interface VapiToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string // JSON string
  }
}

interface VapiWebhookPayload {
  message: {
    type: string
    call?: {
      id: string
      status: string
      customer?: {
        number: string
      }
    }
    toolCallList?: VapiToolCall[]
    transcript?: string
    analysis?: {
      summary?: string
      structuredData?: Record<string, unknown>
    }
  }
}

interface ToolCallResult {
  toolCallId: string
  result: string
}

const isDev = process.env.NODE_ENV === 'development'

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()

    // Verify webhook signature in production
    if (!isDev) {
      const signature = request.headers.get('x-vapi-signature')
      const webhookSecret = process.env.VAPI_WEBHOOK_SECRET

      if (!verifyVapiSignature(rawBody, signature, webhookSecret)) {
        console.error('VAPI webhook signature verification failed')
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        )
      }
    }

    const payload: VapiWebhookPayload = JSON.parse(rawBody)
    const { message } = payload

    if (isDev) console.log('VAPI Webhook:', message.type, message.call?.id)

    switch (message.type) {
      case 'tool-calls':
        // Handle function/tool calls (RAG lookup, etc.)
        if (message.toolCallList && message.toolCallList.length > 0) {
          const results = await handleToolCalls(message.toolCallList)
          return NextResponse.json({ results })
        }
        break

      case 'call-started':
        if (isDev) console.log('Call started:', message.call?.id)
        break

      case 'call-ended':
        // Call ended - save session to database
        if (message.call?.id && message.analysis) {
          await saveSession(message.call.id, message.analysis)
        }
        break

      case 'transcript':
        // Real-time transcript update
        break

      case 'status-update':
        if (isDev) console.log('Status update:', message.call?.status)
        break

      default:
        if (isDev) console.log('Unknown webhook type:', message.type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (isDev) console.error('VAPI Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Process a single tool call
async function processToolCall(toolCall: VapiToolCall): Promise<ToolCallResult> {
  const { id, function: fn } = toolCall

  try {
    const args = JSON.parse(fn.arguments || '{}')

    switch (fn.name) {
      case 'search_knowledge': {
        const result = await searchKnowledge(
          args.query as string,
          args.source as string | undefined
        )
        return { toolCallId: id, result }
      }

      case 'end_roleplay': {
        return {
          toolCallId: id,
          result: JSON.stringify({
            success: true,
            reason: args.reason,
            meeting_booked: args.meeting_booked || false,
          }),
        }
      }

      case 'log_objection': {
        return {
          toolCallId: id,
          result: JSON.stringify({ logged: true, ...args }),
        }
      }

      case 'log_milestone': {
        return {
          toolCallId: id,
          result: JSON.stringify({ logged: true, ...args }),
        }
      }

      default:
        return {
          toolCallId: id,
          result: JSON.stringify({ error: `Unknown function: ${fn.name}` }),
        }
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error handling tool call ${fn.name}:`, error)
    }
    return {
      toolCallId: id,
      result: JSON.stringify({ error: 'Function execution failed' }),
    }
  }
}

// Handle tool calls from VAPI - parallelized for performance
async function handleToolCalls(toolCalls: VapiToolCall[]): Promise<ToolCallResult[]> {
  // Process all tool calls in parallel for better latency
  const results = await Promise.all(toolCalls.map(processToolCall))
  return results
}

// Search knowledge base using RAG
async function searchKnowledge(
  query: string,
  source?: string
): Promise<string> {
  try {
    if (!query || query.trim().length === 0) {
      return 'Please provide a search query.'
    }

    // Generate embedding for the query using OpenRouter
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
      match_threshold: 0.5,
      match_count: 5,
      filter_source: source || null,
    })

    if (error) {
      if (isDev) console.error('Knowledge search error:', error)
      return 'I encountered an error searching the knowledge base.'
    }

    if (!data || data.length === 0) {
      return 'I couldn\'t find specific information about that in the Underdog methodology. Please try rephrasing your question.'
    }

    // Format results for the AI to use
    const formattedResults = data
      .map((item: {
        section_title: string
        content: string
        source: string
        similarity: number
      }, i: number) => {
        // Truncate content to keep response reasonable
        const content = item.content.length > 800
          ? item.content.slice(0, 800) + '...'
          : item.content
        return `[${i + 1}] ${item.section_title} (${item.source}):\n${content}`
      })
      .join('\n\n---\n\n')

    return `Here's relevant information from the Underdog methodology:\n\n${formattedResults}`
  } catch (error) {
    if (isDev) console.error('Knowledge search error:', error)
    return 'I encountered an error searching the knowledge base.'
  }
}

// Save session to database
async function saveSession(
  vapiCallId: string,
  analysis: { summary?: string; structuredData?: Record<string, unknown> }
) {
  try {
    if (isDev) {
      console.log('Saving session:', vapiCallId)
      console.log('Analysis summary:', analysis.summary)
      if (analysis.structuredData) {
        console.log('Structured data:', JSON.stringify(analysis.structuredData, null, 2))
      }
    }

    // TODO: Extract user_id from call metadata and save to database
    // This requires the call to include user context in the assistant config
  } catch (error) {
    if (isDev) console.error('Failed to save session:', error)
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/vapi/webhook',
    supported_events: ['tool-calls', 'call-started', 'call-ended', 'transcript', 'status-update'],
    supported_functions: ['search_knowledge', 'end_roleplay', 'log_objection', 'log_milestone'],
  })
}
