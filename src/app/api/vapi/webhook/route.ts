import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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
    transcript?: string
    analysis?: {
      summary?: string
      structuredData?: Record<string, unknown>
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: VapiWebhookPayload = await request.json()
    const { message } = payload

    console.log('VAPI Webhook:', message.type, message.call?.id)

    switch (message.type) {
      case 'call-started':
        // Call has started - could log initial state
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

      case 'function-call':
        // Handle function calls (e.g., RAG lookup)
        // Return response to VAPI
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

async function saveSession(
  vapiCallId: string,
  analysis: { summary?: string; structuredData?: Record<string, unknown> }
) {
  try {
    const supabase = await createServerSupabaseClient()

    // For now, we'll log the session data
    // In production, you'd extract user_id from the call metadata
    console.log('Saving session:', vapiCallId, analysis)

    // Example of how to save (would need user context):
    // const { error } = await supabase.from('roleplay_sessions').insert({
    //   user_id: userId,
    //   persona_id: personaId,
    //   scenario_type: scenarioType,
    //   vapi_call_id: vapiCallId,
    //   transcript: analysis.structuredData?.transcript,
    //   duration_seconds: analysis.structuredData?.duration,
    // })
  } catch (error) {
    console.error('Failed to save session:', error)
  }
}

// Handle VAPI assistant request (for dynamic assistant config)
export async function GET() {
  return NextResponse.json({
    message: 'VAPI webhook endpoint active',
  })
}
