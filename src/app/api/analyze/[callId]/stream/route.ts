import { NextRequest } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface StreamMessage {
  status: string
  progress?: number
  message?: string
  error?: string
  data?: Record<string, unknown>
}

function formatSSE(data: StreamMessage): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ callId: string }> }
) {
  const { callId } = await params

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(callId)) {
    return new Response(formatSSE({ status: 'error', error: 'Invalid call ID format' }), {
      status: 400,
      headers: { 'Content-Type': 'text/event-stream' },
    })
  }

  const user = await getUser()
  if (!user) {
    return new Response(formatSSE({ status: 'error', error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'text/event-stream' },
    })
  }

  const supabase = getAdminClient()

  // Verify ownership
  const { data: callUpload, error: fetchError } = await supabase
    .from('call_uploads')
    .select('id, status, error_message, overall_score, analysis')
    .eq('id', callId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !callUpload) {
    return new Response(formatSSE({ status: 'error', error: 'Call not found' }), {
      status: 404,
      headers: { 'Content-Type': 'text/event-stream' },
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial status
      const sendStatus = (msg: StreamMessage) => {
        controller.enqueue(encoder.encode(formatSSE(msg)))
      }

      // Map status to progress percentage
      const statusProgress: Record<string, number> = {
        pending: 10,
        transcribing: 40,
        scoring: 70,
        completed: 100,
        failed: 0,
      }

      // Send current status immediately
      const currentStatus = callUpload.status || 'pending'
      sendStatus({
        status: currentStatus,
        progress: statusProgress[currentStatus] || 0,
        message: getStatusMessage(currentStatus),
        data: currentStatus === 'completed' ? {
          overallScore: callUpload.overall_score,
          analysis: callUpload.analysis,
        } : undefined,
        error: currentStatus === 'failed' ? callUpload.error_message ?? undefined : undefined,
      })

      // If already terminal, close stream
      if (['completed', 'failed'].includes(currentStatus)) {
        controller.close()
        return
      }

      // Poll for updates
      let lastStatus: string = currentStatus
      const maxPolls = 120 // 2 minutes max
      let pollCount = 0

      const pollInterval = setInterval(async () => {
        pollCount++

        if (pollCount > maxPolls) {
          sendStatus({ status: 'error', error: 'Timeout waiting for processing' })
          clearInterval(pollInterval)
          controller.close()
          return
        }

        try {
          const { data: updated } = await supabase
            .from('call_uploads')
            .select('status, error_message, overall_score, analysis')
            .eq('id', callId)
            .single()

          const updatedStatus = updated?.status || 'pending'
          if (updated && updatedStatus !== lastStatus) {
            lastStatus = updatedStatus

            sendStatus({
              status: updatedStatus,
              progress: statusProgress[updatedStatus] || 0,
              message: getStatusMessage(updatedStatus),
              data: updatedStatus === 'completed' ? {
                overallScore: updated.overall_score,
                analysis: updated.analysis,
              } : undefined,
              error: updatedStatus === 'failed' ? updated.error_message ?? undefined : undefined,
            })

            if (['completed', 'failed'].includes(updatedStatus)) {
              clearInterval(pollInterval)
              controller.close()
            }
          }
        } catch {
          // Silently continue on poll errors
        }
      }, 1000)

      // Clean up on abort
      request.signal.addEventListener('abort', () => {
        clearInterval(pollInterval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'pending':
      return 'Preparing to process...'
    case 'transcribing':
      return 'Transcribing audio with Whisper...'
    case 'scoring':
      return 'Analyzing call performance...'
    case 'completed':
      return 'Analysis complete!'
    case 'failed':
      return 'Processing failed'
    default:
      return 'Processing...'
  }
}
