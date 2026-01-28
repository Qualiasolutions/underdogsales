import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { transcribeAudio } from '@/lib/transcription/whisper'
import { checkRateLimitAsync, createRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit-redis'
import { TranscribeRequestSchema, validateInput } from '@/lib/validations'
import { logger } from '@/lib/logger'
import type { Json } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limit (expensive operation, distributed via Redis)
    const rateLimitResult = await checkRateLimitAsync(`transcribe:${user.id}`, 'transcribe')
    const headers = createRateLimitHeaders(
      rateLimitResult.remaining,
      rateLimitResult.resetTime,
      RATE_LIMITS.transcribe.max
    )

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: RATE_LIMITS.transcribe.message },
        { status: 429, headers }
      )
    }

    // Validate input
    const body = await request.json()
    const validation = validateInput(TranscribeRequestSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers }
      )
    }

    const { callId } = validation.data!

    const supabase = getAdminClient()

    // Get the call upload record
    const { data: callUpload, error: fetchError } = await supabase
      .from('call_uploads')
      .select('*')
      .eq('id', callId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !callUpload) {
      return NextResponse.json({ error: 'Call upload not found' }, { status: 404 })
    }

    // Check if already processed
    if (callUpload.status === 'completed') {
      return NextResponse.json({ error: 'Call already processed' }, { status: 400 })
    }
    if (callUpload.status === 'transcribing') {
      return NextResponse.json({ error: 'Transcription already in progress' }, { status: 400 })
    }

    // Update status to transcribing
    await supabase
      .from('call_uploads')
      .update({ status: 'transcribing', error_message: null })
      .eq('id', callId)

    try {
      // Download the audio file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('call-recordings')
        .download(callUpload.file_path)

      if (downloadError || !fileData) {
        throw new Error(`Failed to download audio file: ${downloadError?.message}`)
      }

      // Convert to ArrayBuffer
      const arrayBuffer = await fileData.arrayBuffer()

      // Determine content type from filename
      const filename = callUpload.original_filename || 'audio.mp3'
      const ext = filename.split('.').pop()?.toLowerCase() || 'mp3'
      const contentTypeMap: Record<string, string> = {
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        m4a: 'audio/m4a',
        webm: 'audio/webm',
        ogg: 'audio/ogg',
      }
      const contentType = contentTypeMap[ext] || 'audio/mpeg'

      // Transcribe with Whisper
      const { transcript, durationSeconds } = await transcribeAudio({
        audioBuffer: arrayBuffer,
        filename,
        contentType,
      })

      // Update record with transcript
      await supabase
        .from('call_uploads')
        .update({
          transcript: transcript as unknown as Json,
          duration_seconds: durationSeconds,
          status: 'scoring',
        })
        .eq('id', callId)

      return NextResponse.json({
        success: true,
        callId,
        status: 'scoring',
        durationSeconds,
        transcriptLength: transcript.length,
        message: 'Transcription complete',
      })
    } catch (transcribeError) {
      const errorMessage =
        transcribeError instanceof Error
          ? transcribeError.message
          : 'Transcription failed'

      await supabase
        .from('call_uploads')
        .update({ status: 'failed', error_message: errorMessage })
        .eq('id', callId)

      logger.exception('Transcription error', transcribeError, { operation: 'transcribe', callId })
      return NextResponse.json(
        { error: 'Transcription failed', details: errorMessage },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.exception('Transcribe route error', error, { operation: 'transcribe' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
