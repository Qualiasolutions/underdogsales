import { NextResponse } from 'next/server'
import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * GDPR Data Deletion Endpoint
 * Implements GDPR Article 17 (Right to Erasure / Right to be Forgotten)
 *
 * This performs a soft delete of all user data:
 * - Sets deleted_at timestamp on all user records
 * - Data remains for 90 days for compliance/recovery, then hard deleted
 * - User can still access the platform but will have no historical data
 */

interface DeletionResult {
  success: boolean
  deletedAt: string
  recordsAffected: {
    roleplaySessions: number
    sessionScores: number
    callUploads: number
    curriculumProgress: number
  }
  retentionPolicy: {
    softDeleteRetention: string
    hardDeleteScheduled: string
  }
}

export async function POST() {
  const startTime = Date.now()

  try {
    // Require authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('GDPR data deletion requested', {
      userId: user.id,
      operation: 'data_delete',
    })

    const supabase = await createServerSupabaseClient()
    const deletedAt = new Date().toISOString()

    // Soft delete all user data in parallel
    // Note: Using type assertions because deleted_at columns are added via migration
    // but not yet reflected in generated Supabase types
    const [
      sessionsResult,
      uploadsResult,
      progressResult,
    ] = await Promise.all([
      // Soft delete roleplay sessions
      supabase
        .from('roleplay_sessions')
        .update({ deleted_at: deletedAt } as never)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .select('id'),

      // Soft delete call uploads
      supabase
        .from('call_uploads')
        .update({ deleted_at: deletedAt } as never)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .select('id'),

      // Soft delete curriculum progress
      supabase
        .from('curriculum_progress')
        .update({ deleted_at: deletedAt } as never)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .select('id'),
    ])

    // Soft delete session scores for affected sessions
    const sessionIds = (sessionsResult.data as { id: string }[] | null)?.map(s => s.id) || []
    let scoresCount = 0

    if (sessionIds.length > 0) {
      const scoresResult = await supabase
        .from('session_scores')
        .update({ deleted_at: deletedAt } as never)
        .in('session_id', sessionIds)
        .is('deleted_at', null)
        .select('id')

      scoresCount = (scoresResult.data as { id: string }[] | null)?.length || 0
    }

    // Calculate hard delete date (90 days from now)
    const hardDeleteDate = new Date()
    hardDeleteDate.setDate(hardDeleteDate.getDate() + 90)

    const result: DeletionResult = {
      success: true,
      deletedAt,
      recordsAffected: {
        roleplaySessions: (sessionsResult.data as unknown[] | null)?.length || 0,
        sessionScores: scoresCount,
        callUploads: (uploadsResult.data as unknown[] | null)?.length || 0,
        curriculumProgress: (progressResult.data as unknown[] | null)?.length || 0,
      },
      retentionPolicy: {
        softDeleteRetention: '90 days',
        hardDeleteScheduled: hardDeleteDate.toISOString(),
      },
    }

    logger.info('GDPR data deletion completed', {
      userId: user.id,
      operation: 'data_delete',
      duration: Date.now() - startTime,
      recordsAffected: result.recordsAffected,
    })

    return NextResponse.json(result)
  } catch (error) {
    logger.exception('GDPR data deletion failed', error, {
      operation: 'data_delete',
    })

    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    )
  }
}

// Health check for the endpoint
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/user/delete',
    method: 'POST',
    description: 'GDPR Right to Erasure - Soft deletes all user data',
    authentication: 'Required (Supabase Auth)',
    retention: '90 days before hard delete',
  })
}
