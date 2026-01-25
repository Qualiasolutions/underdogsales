import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { analyzeTranscript, type ScoringResult } from '@/lib/scoring/engine'
import type { TranscriptEntry, CallAnalysis } from '@/types'
import type { Json } from '@/lib/supabase/types'
import { ScoreRequestSchema, validateInput } from '@/lib/validations'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate input
    const body = await request.json()
    const validation = validateInput(ScoreRequestSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
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

    // Validate status
    if (callUpload.status === 'completed') {
      return NextResponse.json({ error: 'Call already scored' }, { status: 400 })
    }
    if (callUpload.status !== 'scoring') {
      return NextResponse.json(
        { error: 'Call must be transcribed before scoring. Current status: ' + callUpload.status },
        { status: 400 }
      )
    }
    if (!callUpload.transcript || (Array.isArray(callUpload.transcript) && callUpload.transcript.length === 0)) {
      return NextResponse.json({ error: 'No transcript available' }, { status: 400 })
    }

    try {
      // Run scoring engine
      const transcript = callUpload.transcript as unknown as TranscriptEntry[]
      const scoringResult: ScoringResult = analyzeTranscript({
        transcript,
        durationSeconds: callUpload.duration_seconds || 0,
        scenarioType: 'cold_call',
      })

      // Convert ScoringResult to CallAnalysis format
      const analysis: CallAnalysis = {
        summary: scoringResult.summary,
        strengths: scoringResult.strengths,
        improvements: scoringResult.improvements,
        scores: scoringResult.dimensionScores,
      }

      // Update record with analysis
      const { error: updateError } = await supabase
        .from('call_uploads')
        .update({
          analysis: analysis as unknown as Json,
          overall_score: scoringResult.overallScore,
          status: 'completed',
          error_message: null,
        })
        .eq('id', callId)

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`)
      }

      return NextResponse.json({
        success: true,
        callId,
        status: 'completed',
        overallScore: scoringResult.overallScore,
        analysis,
      })
    } catch (scoreError) {
      const errorMessage =
        scoreError instanceof Error ? scoreError.message : 'Scoring failed'

      await supabase
        .from('call_uploads')
        .update({ status: 'failed', error_message: errorMessage })
        .eq('id', callId)

      logger.exception('Scoring error', scoreError, { operation: 'score', callId })
      return NextResponse.json(
        { error: 'Scoring failed', details: errorMessage },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.exception('Score route error', error, { operation: 'score' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
