import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ callId: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { callId } = await params

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('call_uploads')
      .select('*')
      .eq('id', callId)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Call upload not found' }, { status: 404 })
    }

    // Type assertion for the row data
    const callUpload = data as Database['public']['Tables']['call_uploads']['Row']

    return NextResponse.json({
      id: callUpload.id,
      status: callUpload.status,
      originalFilename: callUpload.original_filename,
      fileSizeBytes: callUpload.file_size_bytes,
      durationSeconds: callUpload.duration_seconds,
      transcript: callUpload.transcript,
      analysis: callUpload.analysis,
      overallScore: callUpload.overall_score,
      errorMessage: callUpload.error_message,
      createdAt: callUpload.created_at,
    })
  } catch (error) {
    console.error('Get call details error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
