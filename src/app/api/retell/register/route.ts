/**
 * Retell Web Call Registration Endpoint
 * Creates a web call and returns access token for browser SDK
 *
 * Uses direct fetch instead of SDK to avoid connection issues on Vercel
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

const RETELL_API_BASE = 'https://api.retellai.com'

interface RegisterRequest {
  agentId: string
  metadata?: {
    personaId?: string
    scenarioType?: string
  }
}

interface RetellWebCallResponse {
  call_id: string
  access_token: string
  call_status: string
}

/**
 * Create a web call using Retell API directly via fetch
 * This bypasses the SDK which has connection issues on Vercel
 */
async function createWebCall(
  apiKey: string,
  agentId: string,
  metadata: Record<string, string | undefined>
): Promise<RetellWebCallResponse> {
  const response = await fetch(`${RETELL_API_BASE}/v2/create-web-call`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_id: agentId,
      metadata,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Retell API error ${response.status}: ${errorText}`)
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: RegisterRequest = await request.json()
    const { agentId, metadata } = body

    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      )
    }

    // Get and validate API key
    const apiKey = process.env.RETELL_API_KEY?.trim().replace(/\\n/g, '')
    if (!apiKey) {
      logger.error('RETELL_API_KEY not configured', { operation: 'retell_register' })
      return NextResponse.json(
        { error: 'Retell API not configured' },
        { status: 500 }
      )
    }

    logger.info('Registering Retell web call', {
      operation: 'retell_register',
      userId: user.id,
      agentId,
      metadata,
    })

    // Create web call via direct API call
    const response = await createWebCall(apiKey, agentId, {
      ...metadata,
      userId: user.id,
    })

    logger.info('Retell web call registered', {
      operation: 'retell_register',
      callId: response.call_id,
      userId: user.id,
    })

    return NextResponse.json({
      accessToken: response.access_token,
      callId: response.call_id,
    })
  } catch (error) {
    logger.exception('Failed to register Retell web call', error, {
      operation: 'retell_register',
    })

    // Handle specific Retell errors
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Invalid Retell API key' },
          { status: 500 }
        )
      }
      if (error.message.includes('404')) {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to register call' },
      { status: 500 }
    )
  }
}
