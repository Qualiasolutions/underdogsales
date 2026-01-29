import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import { checkRateLimitAsync, createRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit-redis'
import { logger } from '@/lib/logger'
import type { LeaderboardEntry, LeaderboardTrend } from '@/types'

// Cache leaderboard for 5 minutes to reduce DB load
const CACHE_TTL = 5 * 60 * 1000
let cachedLeaderboard: { data: LeaderboardEntry[]; timestamp: number } | null = null

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimitAsync(`leaderboard:${user.id}`, 'default')
    const headers = createRateLimitHeaders(
      rateLimitResult.remaining,
      rateLimitResult.resetTime,
      RATE_LIMITS.default.max
    )

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers }
      )
    }

    // Get time period from query params (default: 30 days)
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '30'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    // Check cache (only for default params)
    if (period === '30' && limit === 50 && cachedLeaderboard) {
      const cacheAge = Date.now() - cachedLeaderboard.timestamp
      if (cacheAge < CACHE_TTL) {
        // Add is_current_user flag
        const dataWithCurrentUser = cachedLeaderboard.data.map(entry => ({
          ...entry,
          is_current_user: entry.user_id === user.id,
        }))
        return NextResponse.json({ leaderboard: dataWithCurrentUser }, { headers })
      }
    }

    const supabase = await createServerSupabaseClient()

    // Call the leaderboard function
    const { data, error } = await supabase.rpc('get_leaderboard', {
      result_limit: limit,
      time_period: `${period} days`,
    })

    if (error) {
      logger.error('Leaderboard query failed', { error: error.message })
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500, headers }
      )
    }

    // Transform and type the data
    const leaderboard: LeaderboardEntry[] = (data || []).map((row: {
      user_id: string
      display_name: string
      avatar_initial: string
      total_sessions: number
      avg_score: number
      best_score: number
      total_practice_minutes: number
      rank: number
      trend: string
    }) => ({
      user_id: row.user_id,
      display_name: row.display_name,
      avatar_initial: row.avatar_initial,
      total_sessions: row.total_sessions,
      avg_score: parseFloat(String(row.avg_score)) || 0,
      best_score: parseFloat(String(row.best_score)) || 0,
      total_practice_minutes: row.total_practice_minutes,
      rank: Number(row.rank),
      trend: row.trend as LeaderboardTrend,
      is_current_user: row.user_id === user.id,
    }))

    // Update cache for default params
    if (period === '30' && limit === 50) {
      cachedLeaderboard = { data: leaderboard, timestamp: Date.now() }
    }

    logger.info('Leaderboard fetched', {
      operation: 'getLeaderboard',
      userId: user.id,
      count: leaderboard.length,
    })

    return NextResponse.json({ leaderboard }, { headers })
  } catch (error) {
    logger.exception('Leaderboard API error', error, { operation: 'leaderboard' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
