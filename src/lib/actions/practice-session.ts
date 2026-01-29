'use server'

import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { analyzeTranscriptWithAI } from '@/lib/scoring/ai-engine'
import { supabaseCircuit, CircuitOpenError } from '@/lib/circuit-breaker'
import { logger } from '@/lib/logger'
import type { TranscriptEntry, ScoreDimension, CallAnalysis } from '@/types'
import type { Json } from '@/lib/supabase/types'

interface SaveSessionInput {
  personaId: string
  scenarioType: string
  transcript: TranscriptEntry[]
  durationSeconds: number
  vapiCallId?: string
}

interface SaveSessionResult {
  success: boolean
  sessionId?: string
  error?: string
}

interface SessionWithScores {
  id: string
  user_id: string
  persona_id: string
  scenario_type: string
  duration_seconds: number
  vapi_call_id: string | null
  transcript: TranscriptEntry[]
  created_at: string
  overall_score: number
  analysis: CallAnalysis
}

interface PaginationOptions {
  limit?: number
  offset?: number
}

// DB row types for type safety
interface RoleplaySessionRow {
  id: string
  user_id: string
  persona_id: string
  scenario_type: string
  duration_seconds: number | null
  vapi_call_id: string | null
  transcript: unknown
  created_at: string
}

interface SessionScoreRow {
  id: string
  session_id: string
  dimension: string
  score: number
  feedback: string | null
  created_at: string
}

/**
 * Save a practice session with transcript and run scoring analysis
 */
export async function savePracticeSession(
  input: SaveSessionInput
): Promise<SaveSessionResult> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate input
    if (!input.transcript || input.transcript.length === 0) {
      return { success: false, error: 'No transcript to save' }
    }

    // Run AI-powered scoring analysis (Cold Calling Wiki methodology)
    const scoringResult = await analyzeTranscriptWithAI({
      transcript: input.transcript,
      durationSeconds: input.durationSeconds,
      scenarioType: input.scenarioType,
    })

    const supabase = getAdminClient()

    // Save the session with circuit breaker protection
    let session: { id: string } | null = null
    try {
      const result = await supabaseCircuit.execute(async () => {
        return await supabase
          .from('roleplay_sessions')
          .insert({
            user_id: user.id,
            persona_id: input.personaId,
            scenario_type: input.scenarioType,
            duration_seconds: input.durationSeconds,
            vapi_call_id: input.vapiCallId || null,
            transcript: input.transcript as unknown as Json,
          })
          .select('id')
          .single()
      })

      session = result.data as { id: string } | null

      if (result.error || !session) {
        logger.error('Error saving session', { operation: 'savePracticeSession', error: result.error?.message })
        return { success: false, error: 'Failed to save session' }
      }
    } catch (error) {
      if (error instanceof CircuitOpenError) {
        logger.warn('Database circuit breaker open', { operation: 'savePracticeSession' })
        return { success: false, error: 'Service temporarily unavailable. Please try again.' }
      }
      throw error
    }

    // Save dimension scores
    const scoreInserts = Object.entries(scoringResult.dimensionScores).map(
      ([dimension, score]) => ({
        session_id: session.id,
        dimension,
        score: score.score,
        feedback: score.feedback,
      })
    )

    const { error: scoresError } = await supabase
      .from('session_scores')
      .insert(scoreInserts)

    if (scoresError) {
      logger.error('Error saving scores', { operation: 'savePracticeSession', error: scoresError.message })
      // Don't fail the whole operation, session is saved
    }

    return { success: true, sessionId: session.id }
  } catch (error) {
    logger.exception('Error in savePracticeSession', error, { operation: 'savePracticeSession' })
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get a practice session with its scores
 */
export async function getPracticeSession(
  sessionId: string
): Promise<SessionWithScores | null> {
  try {
    const user = await getUser()
    if (!user) return null

    const supabase = getAdminClient()

    // Get session with scores in single query (fixes N+1)
    const { data: sessionData, error: sessionError } = await supabase
      .from('roleplay_sessions')
      .select(`
        id,
        user_id,
        persona_id,
        scenario_type,
        duration_seconds,
        vapi_call_id,
        transcript,
        created_at,
        session_scores (
          id,
          session_id,
          dimension,
          score,
          feedback,
          created_at
        )
      `)
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !sessionData) return null

    const session = sessionData as RoleplaySessionRow & { session_scores: SessionScoreRow[] }
    const scores = session.session_scores || []

    // Reconstruct the analysis from scores
    const dimensionScores: CallAnalysis['scores'] = {} as CallAnalysis['scores']
    let totalScore = 0
    let scoreCount = 0

    const dimensions: ScoreDimension[] = [
      'opener',
      'pitch',
      'discovery',
      'objection_handling',
      'closing',
      'communication',
    ]

    for (const dim of dimensions) {
      const scoreData = scores.find((s) => s.dimension === dim)
      dimensionScores[dim] = {
        score: scoreData?.score || 0,
        feedback: scoreData?.feedback || '',
        criteria: [], // Criteria details not stored in DB, would need to re-analyze
      }
      if (scoreData) {
        totalScore += scoreData.score
        scoreCount++
      }
    }

    const overallScore = scoreCount > 0 ? totalScore / scoreCount : 0

    // Generate summary based on scores
    const sortedDimensions = Object.entries(dimensionScores).sort(
      ([, a], [, b]) => b.score - a.score
    )
    const bestDimension = sortedDimensions[0]?.[0] || 'opener'
    const worstDimension = sortedDimensions[sortedDimensions.length - 1]?.[0] || 'closing'

    let summary: string
    if (overallScore >= 8) {
      summary = `Excellent call! Your strongest area was ${bestDimension.replace('_', ' ')}. Keep up the great work.`
    } else if (overallScore >= 6) {
      summary = `Solid performance. Your ${bestDimension.replace('_', ' ')} was strong. Focus on improving your ${worstDimension.replace('_', ' ')} next time.`
    } else {
      summary = `Keep practicing! Focus on ${worstDimension.replace('_', ' ')} as your priority area for improvement.`
    }

    // Extract strengths and improvements from feedback
    const strengths: string[] = []
    const improvements: string[] = []

    for (const [, score] of Object.entries(dimensionScores)) {
      if (score.score >= 7 && score.feedback) {
        strengths.push(score.feedback)
      } else if (score.score < 7 && score.feedback) {
        improvements.push(score.feedback)
      }
    }

    const analysis: CallAnalysis = {
      summary,
      strengths: strengths.slice(0, 5),
      improvements: improvements.slice(0, 5),
      scores: dimensionScores,
    }

    return {
      id: session.id,
      user_id: session.user_id,
      persona_id: session.persona_id,
      scenario_type: session.scenario_type,
      duration_seconds: session.duration_seconds || 0,
      vapi_call_id: session.vapi_call_id,
      transcript: (session.transcript as unknown as TranscriptEntry[]) || [],
      created_at: session.created_at,
      overall_score: Math.round(overallScore * 10) / 10,
      analysis,
    }
  } catch (error) {
    logger.exception('Error in getPracticeSession', error, { operation: 'getPracticeSession' })
    return null
  }
}

/**
 * Get all practice sessions for the current user with pagination
 */
export async function getUserPracticeSessions(
  options: PaginationOptions = {}
): Promise<{
  sessions: Array<{
    id: string
    persona_id: string
    scenario_type: string
    duration_seconds: number
    created_at: string
    overall_score: number
  }>
  hasMore: boolean
}> {
  try {
    const { limit = 10, offset = 0 } = options
    const user = await getUser()
    if (!user) return { sessions: [], hasMore: false }

    const supabase = getAdminClient()

    // Get sessions with their scores (fetch limit + 1 for hasMore detection)
    const { data: sessions, error } = await supabase
      .from('roleplay_sessions')
      .select(`
        id,
        persona_id,
        scenario_type,
        duration_seconds,
        created_at,
        session_scores (score)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)  // range() is inclusive, so fetch exactly limit items

    if (error || !sessions) return { sessions: [], hasMore: false }

    const mapped = sessions.map((session) => {
      const scores = (session.session_scores as Array<{ score: number }>) || []
      const avgScore =
        scores.length > 0
          ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
          : 0

      return {
        id: session.id,
        persona_id: session.persona_id,
        scenario_type: session.scenario_type,
        duration_seconds: session.duration_seconds || 0,
        created_at: session.created_at || new Date().toISOString(),
        overall_score: Math.round(avgScore * 10) / 10,
      }
    })

    return {
      sessions: mapped.slice(0, limit),
      hasMore: mapped.length > limit
    }
  } catch (error) {
    logger.exception('Error in getUserPracticeSessions', error, { operation: 'getUserPracticeSessions' })
    return { sessions: [], hasMore: false }
  }
}
