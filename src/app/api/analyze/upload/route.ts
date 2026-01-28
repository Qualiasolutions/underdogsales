import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { checkRateLimitAsync, createRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit-redis'
import { logger } from '@/lib/logger'

// Max file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024

// Allowed audio types
const ALLOWED_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
]

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limit (distributed via Redis)
    const rateLimitResult = await checkRateLimitAsync(`upload:${user.id}`, 'upload')
    const headers = createRateLimitHeaders(
      rateLimitResult.remaining,
      rateLimitResult.resetTime,
      RATE_LIMITS.upload.max
    )

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: RATE_LIMITS.upload.message },
        { status: 429, headers }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400, headers })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: MP3, WAV, WebM, OGG, M4A' },
        { status: 400, headers }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB' },
        { status: 400, headers }
      )
    }

    // Use admin client for storage operations
    const supabase = getAdminClient()

    // Generate unique file path
    const callId = crypto.randomUUID()
    const filePath = `${user.id}/${callId}/${file.name}`

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('call-recordings')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      logger.error('Storage upload error', { error: uploadError.message, operation: 'upload' })
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Create database record
    const { data: callUpload, error: dbError } = await supabase
      .from('call_uploads')
      .insert({
        id: callId,
        user_id: user.id,
        file_path: filePath,
        original_filename: file.name,
        file_size_bytes: file.size,
        status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      logger.error('Database insert error', { error: dbError.message, operation: 'upload' })
      // Clean up uploaded file
      await supabase.storage.from('call-recordings').remove([filePath])
      return NextResponse.json(
        { error: 'Failed to create upload record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      callId: callUpload.id,
      status: 'pending',
      message: 'File uploaded successfully',
    })
  } catch (error) {
    logger.exception('Upload error', error, { operation: 'upload' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
