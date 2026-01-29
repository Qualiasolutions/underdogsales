import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

const VALID_INDUSTRIES = [
  'saas_tech',
  'healthcare',
  'finance',
  'real_estate',
  'manufacturing',
  'professional_services',
] as const

type Industry = typeof VALID_INDUSTRIES[number]

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { industry } = body

    if (!industry || !VALID_INDUSTRIES.includes(industry as Industry)) {
      return NextResponse.json(
        { error: 'Invalid industry' },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    const { error } = await supabase
      .from('users')
      .update({ industry })
      .eq('id', user.id)

    if (error) {
      logger.error('Failed to update industry', {
        operation: 'updateIndustry',
        userId: user.id,
        error: error.message,
      })
      return NextResponse.json(
        { error: 'Failed to save industry' },
        { status: 500 }
      )
    }

    logger.info('User industry updated', {
      operation: 'updateIndustry',
      userId: user.id,
      industry,
    })

    return NextResponse.json({ success: true, industry })
  } catch (error) {
    logger.exception('Industry API error', error)
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
      .select('industry')
      .eq('id', user.id)
      .single()

    if (error) {
      logger.error('Failed to get industry', {
        operation: 'getIndustry',
        userId: user.id,
        error: error.message,
      })
      return NextResponse.json(
        { error: 'Failed to get industry' },
        { status: 500 }
      )
    }

    return NextResponse.json({ industry: data?.industry || null })
  } catch (error) {
    logger.exception('Industry API error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
