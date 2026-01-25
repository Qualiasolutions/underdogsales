/**
 * Retell Webhook Handler
 * Receives call lifecycle events from Retell
 *
 * Note: Session saving happens client-side via savePracticeSession (matching VAPI pattern)
 * The webhook logs events for observability but doesn't store session data.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyRetellRequest } from '@/lib/retell/auth'
import { logger } from '@/lib/logger'

// Retell Webhook Payload Types
interface RetellCall {
  call_id: string
  agent_id: string
  call_type: 'web_call' | 'phone_call'
  call_status: 'registered' | 'ongoing' | 'ended' | 'error'
  start_timestamp?: number
  end_timestamp?: number
  disconnection_reason?: string
  metadata?: Record<string, unknown>
}

interface RetellWebhookPayload {
  event: string
  call: RetellCall
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()

    // Verify webhook signature
    const signature = request.headers.get('x-retell-signature')
    const verificationError = verifyRetellRequest(rawBody, signature)

    if (verificationError) {
      logger.warn('Retell webhook signature verification failed', {
        operation: 'retell_webhook',
        hasSignature: !!signature,
      })
      return NextResponse.json(
        { error: verificationError.error },
        { status: verificationError.status }
      )
    }

    const payload: RetellWebhookPayload = JSON.parse(rawBody)
    const { event, call } = payload

    logger.debug('Retell Webhook received', {
      operation: 'retell_webhook',
      event,
      callId: call.call_id,
      agentId: call.agent_id,
    })

    switch (event) {
      case 'call_started':
        logger.info('Retell call started', {
          operation: 'retell_webhook',
          callId: call.call_id,
          agentId: call.agent_id,
          callType: call.call_type,
          metadata: call.metadata,
        })
        break

      case 'call_ended':
        const duration = call.end_timestamp && call.start_timestamp
          ? Math.round((call.end_timestamp - call.start_timestamp) / 1000)
          : null
        logger.info('Retell call ended', {
          operation: 'retell_webhook',
          callId: call.call_id,
          agentId: call.agent_id,
          durationSeconds: duration,
          disconnectionReason: call.disconnection_reason,
          metadata: call.metadata,
        })
        break

      case 'call_analyzed':
        logger.info('Retell call analyzed', {
          operation: 'retell_webhook',
          callId: call.call_id,
          agentId: call.agent_id,
        })
        break

      default:
        logger.debug('Unknown Retell webhook event', {
          operation: 'retell_webhook',
          event,
          callId: call.call_id,
        })
    }

    // Return 204 No Content (webhook acknowledged)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    logger.exception('Retell Webhook processing failed', error, {
      operation: 'retell_webhook',
    })
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/retell/webhook',
    supported_events: ['call_started', 'call_ended', 'call_analyzed'],
  })
}
