/**
 * Retell Web Call Registration Endpoint
 * Creates a web call and returns access token for browser SDK
 */

import { NextRequest, NextResponse } from 'next/server'
import Retell from 'retell-sdk'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// Initialize Retell client
const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY!,
})

interface RegisterRequest {
  agentId: string
  metadata?: {
    personaId?: string
    scenarioType?: string
  }
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

    logger.info('Registering Retell web call', {
      operation: 'retell_register',
      userId: user.id,
      agentId,
      metadata,
    })

    // Create web call via Retell API
    const response = await retell.call.createWebCall({
      agent_id: agentId,
      metadata: {
        ...metadata,
        userId: user.id,
      },
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
