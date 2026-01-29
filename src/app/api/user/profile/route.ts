import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const ProfileSchema = z.object({
  company: z.string().min(2, 'Company must be at least 2 characters'),
  targetRole: z.string().min(2, 'Target role must be at least 2 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const validation = ProfileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { company, targetRole } = validation.data
    const supabase = getAdminClient()

    // Update user profile
    const { error } = await supabase
      .from('users')
      .update({
        company,
        target_role: targetRole,
        // Clear cached ICP context when profile changes
        icp_context: null,
      })
      .eq('id', user.id)

    if (error) {
      logger.error('Failed to update profile', {
        operation: 'updateProfile',
        userId: user.id,
        error: error.message,
      })
      return NextResponse.json(
        { error: 'Failed to save profile' },
        { status: 500 }
      )
    }

    logger.info('User profile updated', {
      operation: 'updateProfile',
      userId: user.id,
      company,
      targetRole,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.exception('Profile API error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from('users')
      .select('company, target_role, icp_context')
      .eq('id', user.id)
      .single()

    if (error) {
      logger.error('Failed to get profile', {
        operation: 'getProfile',
        userId: user.id,
        error: error.message,
      })
      return NextResponse.json(
        { error: 'Failed to get profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      company: data?.company || null,
      targetRole: data?.target_role || null,
      icpContext: data?.icp_context || null,
    })
  } catch (error) {
    logger.exception('Profile API error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
