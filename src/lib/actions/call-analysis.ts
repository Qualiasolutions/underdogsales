'use server'

import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/supabase/server'
import type { CallUpload, CallUploadStatus } from '@/types'
import type { Database } from '@/lib/supabase/types'

type CallUploadRow = Database['public']['Tables']['call_uploads']['Row']

function rowToCallUpload(row: CallUploadRow): CallUpload {
  return {
    id: row.id,
    user_id: row.user_id,
    file_path: row.file_path,
    original_filename: row.original_filename || '',
    file_size_bytes: row.file_size_bytes || 0,
    duration_seconds: row.duration_seconds || 0,
    status: row.status as CallUploadStatus,
    error_message: row.error_message || undefined,
    transcript: (row.transcript as unknown as CallUpload['transcript']) || [],
    analysis: (row.analysis as unknown as CallUpload['analysis']) || null,
    overall_score: row.overall_score,
    created_at: row.created_at,
  }
}

function getServiceSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Get all call uploads for the current user
 */
export async function getUserCallUploads(): Promise<CallUpload[]> {
  const user = await getUser()
  if (!user) return []

  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('call_uploads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching call uploads:', error)
    return []
  }

  return (data || []).map(rowToCallUpload)
}

/**
 * Get a specific call upload by ID
 */
export async function getCallUpload(callId: string): Promise<CallUpload | null> {
  const user = await getUser()
  if (!user) return null

  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('call_uploads')
    .select('*')
    .eq('id', callId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null

  return rowToCallUpload(data)
}

/**
 * Delete a call upload and its associated file
 */
export async function deleteCallUpload(
  callId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const supabase = getServiceSupabase()

  // Get the file path first
  const { data } = await supabase
    .from('call_uploads')
    .select('file_path')
    .eq('id', callId)
    .eq('user_id', user.id)
    .single()

  if (!data) {
    return { success: false, error: 'Call upload not found' }
  }

  const filePath = (data as { file_path: string }).file_path

  // Delete from storage
  await supabase.storage.from('call-recordings').remove([filePath])

  // Delete database record
  const { error } = await supabase
    .from('call_uploads')
    .delete()
    .eq('id', callId)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * NOTE: Call processing (transcribe + score) is handled client-side in CallAnalyzer.tsx
 * by calling API routes directly. This works because the browser sends auth cookies.
 *
 * Server actions cannot call authenticated API routes without forwarding cookies,
 * so the client-side approach is the correct pattern for this use case.
 *
 * Flow: Client -> /api/analyze/upload -> /api/analyze/transcribe -> /api/analyze/score
 */
