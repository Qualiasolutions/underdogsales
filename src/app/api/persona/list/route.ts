/**
 * List user's custom personas
 */

import { NextResponse } from 'next/server'
import { getUser, createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: personas, error } = await (supabase as any)
      .from('custom_personas')
      .select('id, name, role, company, industry, personality, warmth, usage_count, created_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ personas: personas || [] })
  } catch (error) {
    console.error('Failed to list personas:', error)
    return NextResponse.json({ error: 'Failed to fetch personas' }, { status: 500 })
  }
}
