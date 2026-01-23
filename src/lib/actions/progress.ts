'use server'

import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import type { ScoreDimension } from '@/types'

/**
 * Score trend data point for line charts
 */
export interface ScoreTrendPoint {
  date: string // Formatted as "Jan 15"
  score: number // Average score for that session (1 decimal)
}

/**
 * Dimension averages for radar charts
 */
export type DimensionAverages = Record<ScoreDimension, number>

// All 6 scoring dimensions
const ALL_DIMENSIONS: ScoreDimension[] = [
  'opener',
  'pitch',
  'discovery',
  'objection_handling',
  'closing',
  'communication',
]

/**
 * Get score trends over time for the current user
 * Returns array of {date, score} for trend line visualization
 * Ordered oldest to newest for proper trend direction
 */
export async function getScoreTrends(limit = 20): Promise<ScoreTrendPoint[]> {
  try {
    const user = await getUser()
    if (!user) return []

    const supabase = getAdminClient()

    // Get sessions with their scores, ordered oldest first for trend line
    const { data: sessions, error } = await supabase
      .from('roleplay_sessions')
      .select(`
        id,
        created_at,
        session_scores (score)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error || !sessions) {
      logger.error('Error fetching score trends', {
        operation: 'getScoreTrends',
        error: error?.message,
      })
      return []
    }

    // Map sessions to trend points
    return sessions.map((session) => {
      const scores = (session.session_scores as Array<{ score: number }>) || []
      const avgScore =
        scores.length > 0
          ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
          : 0

      // Format date as "Jan 15"
      const date = new Date(session.created_at || new Date())
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })

      return {
        date: formattedDate,
        score: Math.round(avgScore * 10) / 10,
      }
    })
  } catch (error) {
    logger.exception('Error in getScoreTrends', error, {
      operation: 'getScoreTrends',
    })
    return []
  }
}

/**
 * Get average scores per dimension for radar chart visualization
 * Returns all 6 dimensions with their average scores (0 if no data)
 */
export async function getDimensionAverages(): Promise<DimensionAverages> {
  // Initialize all dimensions to 0
  const defaults: DimensionAverages = {
    opener: 0,
    pitch: 0,
    discovery: 0,
    objection_handling: 0,
    closing: 0,
    communication: 0,
  }

  try {
    const user = await getUser()
    if (!user) return defaults

    const supabase = getAdminClient()

    // Get all scores for user's sessions
    // Join with roleplay_sessions to filter by user
    const { data: scores, error } = await supabase
      .from('session_scores')
      .select(`
        dimension,
        score,
        roleplay_sessions!inner (user_id)
      `)
      .eq('roleplay_sessions.user_id', user.id)

    if (error || !scores) {
      logger.error('Error fetching dimension averages', {
        operation: 'getDimensionAverages',
        error: error?.message,
      })
      return defaults
    }

    // Group scores by dimension and calculate averages
    const dimensionTotals: Record<string, { sum: number; count: number }> = {}

    for (const score of scores) {
      const dim = score.dimension
      if (!dimensionTotals[dim]) {
        dimensionTotals[dim] = { sum: 0, count: 0 }
      }
      dimensionTotals[dim].sum += score.score
      dimensionTotals[dim].count += 1
    }

    // Calculate averages for each dimension
    const result = { ...defaults }
    for (const dim of ALL_DIMENSIONS) {
      const totals = dimensionTotals[dim]
      if (totals && totals.count > 0) {
        result[dim] = Math.round((totals.sum / totals.count) * 10) / 10
      }
    }

    return result
  } catch (error) {
    logger.exception('Error in getDimensionAverages', error, {
      operation: 'getDimensionAverages',
    })
    return defaults
  }
}
