import { NextResponse } from 'next/server'
import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * GDPR Data Export Endpoint
 * Allows users to download all their personal data
 * Implements GDPR Article 20 (Right to Data Portability)
 */

interface ExportData {
  exportDate: string
  exportVersion: string
  user: {
    id: string
    email: string | undefined
    createdAt: string | undefined
  }
  roleplaySessions: unknown[]
  sessionScores: unknown[]
  callUploads: unknown[]
  curriculumProgress: unknown[]
}

export async function GET() {
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

    logger.info('GDPR data export requested', {
      userId: user.id,
      operation: 'data_export',
    })

    const supabase = await createServerSupabaseClient()

    // Fetch all user data in parallel
    const [
      sessionsResult,
      uploadsResult,
      progressResult,
      scoresResult,
    ] = await Promise.all([
      // Roleplay sessions
      supabase
        .from('roleplay_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),

      // Call uploads
      supabase
        .from('call_uploads')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),

      // Curriculum progress
      supabase
        .from('curriculum_progress')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null),

      // Session scores (via join with sessions)
      supabase
        .from('session_scores')
        .select(`
          *,
          roleplay_sessions!inner(user_id)
        `)
        .eq('roleplay_sessions.user_id', user.id)
        .is('deleted_at', null),
    ])

    // Build export data
    const exportData: ExportData = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
      roleplaySessions: sessionsResult.data || [],
      sessionScores: scoresResult.data || [],
      callUploads: (uploadsResult.data || []).map((upload) => {
        // Remove file_path for security, provide metadata only
        const { file_path, ...safeUpload } = upload as Record<string, unknown>
        return {
          ...safeUpload,
          file_path: file_path ? '[REDACTED - Use download endpoint]' : null,
        }
      }),
      curriculumProgress: progressResult.data || [],
    }

    logger.info('GDPR data export completed', {
      userId: user.id,
      operation: 'data_export',
      duration: Date.now() - startTime,
      recordCounts: {
        sessions: exportData.roleplaySessions.length,
        scores: exportData.sessionScores.length,
        uploads: exportData.callUploads.length,
        progress: exportData.curriculumProgress.length,
      },
    })

    // Return as downloadable JSON file
    const filename = `underdog-data-export-${user.id.slice(0, 8)}-${Date.now()}.json`

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    logger.exception('GDPR data export failed', error, {
      operation: 'data_export',
    })

    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
