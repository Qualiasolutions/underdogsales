import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

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

export async function POST(request: NextRequest) {
  try {
    const payload: VapiWebhookPayload = await request.json()
    const { message } = payload

    console.log('VAPI Webhook:', message.type, message.call?.id)

    switch (message.type) {
      case 'tool-calls':
        // Handle function/tool calls (RAG lookup, etc.)
        if (message.toolCallList && message.toolCallList.length > 0) {
          const results = await handleToolCalls(message.toolCallList)
          return NextResponse.json({ results })
        }
        break

      case 'call-started':
        console.log('Call started:', message.call?.id)
        break

      case 'call-ended':
        // Call ended - save session to database
        if (message.call?.id && message.analysis) {
          await saveSession(message.call.id, message.analysis)
        }
        break

      case 'transcript':
        // Real-time transcript update
        // Could stream to client via WebSocket/SSE
        break

      case 'status-update':
        console.log('Status update:', message.call?.status)
        break

      default:
        console.log('Unknown webhook type:', message.type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('VAPI Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle tool calls from VAPI
async function handleToolCalls(toolCalls: VapiToolCall[]): Promise<ToolCallResult[]> {
  const results: ToolCallResult[] = []

  for (const toolCall of toolCalls) {
    const { id, function: fn } = toolCall

    try {
      const args = JSON.parse(fn.arguments || '{}')

      switch (fn.name) {
        case 'search_knowledge': {
          const result = await searchKnowledge(
            args.query as string,
            args.source as string | undefined
          )
          results.push({ toolCallId: id, result })
          break
        }

        case 'end_roleplay': {
          results.push({
            toolCallId: id,
            result: JSON.stringify({
              success: true,
              reason: args.reason,
              meeting_booked: args.meeting_booked || false,
            }),
          })
          break
        }

        case 'log_objection': {
          console.log('Objection logged:', args)
          results.push({
            toolCallId: id,
            result: JSON.stringify({ logged: true, ...args }),
          })
          break
        }

        case 'log_milestone': {
          console.log('Milestone logged:', args)
          results.push({
            toolCallId: id,
            result: JSON.stringify({ logged: true, ...args }),
          })
          break
        }

        default:
          console.warn('Unknown function:', fn.name)
          results.push({
            toolCallId: id,
            result: JSON.stringify({ error: `Unknown function: ${fn.name}` }),
          })
      }
    } catch (error) {
      console.error(`Error handling tool call ${fn.name}:`, error)
      results.push({
        toolCallId: id,
        result: JSON.stringify({ error: 'Function execution failed' }),
      })
    }
  }

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
      match_threshold: 0.65,
      match_count: 3,
      filter_source: source || null,
    })

    if (error) {
      console.error('Knowledge search error:', error)
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
    console.error('Knowledge search error:', error)
    return 'I encountered an error searching the knowledge base.'
  }
}

// Save session to database
async function saveSession(
  vapiCallId: string,
  analysis: { summary?: string; structuredData?: Record<string, unknown> }
) {
  try {
    console.log('Saving session:', vapiCallId)
    console.log('Analysis summary:', analysis.summary)

    // TODO: Extract user_id from call metadata and save to database
    // This requires the call to include user context in the assistant config

    // Log structured data for debugging
    if (analysis.structuredData) {
      console.log('Structured data:', JSON.stringify(analysis.structuredData, null, 2))
    }
  } catch (error) {
    console.error('Failed to save session:', error)
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
