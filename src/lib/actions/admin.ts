'use server'

import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/config/admin'
import { logger } from '@/lib/logger'
import {
  openrouterCircuit,
  vapiCircuit,
  supabaseCircuit,
} from '@/lib/circuit-breaker'

/**
 * Admin user with activity metrics
 */
export interface AdminUser {
  id: string
  email: string
  name: string
  role: string | null
  created_at: string
  session_count: number
  last_active: string
  average_score: number
}

/**
 * Session data for admin user detail view
 */
export interface AdminSession {
  id: string
  persona_id: string
  scenario_type: string
  duration_seconds: number | null
  created_at: string
  scores: Array<{ dimension: string; score: number; feedback: string | null }>
}

interface GetAllUsersOptions {
  search?: string
  limit?: number
  offset?: number
}

interface GetAllUsersResult {
  users: AdminUser[]
  hasMore: boolean
  error?: string
}

interface GetUserDetailResult {
  user: AdminUser | null
  sessions: AdminSession[]
  error?: string
}

/**
 * Get all users with activity metrics (admin only)
 *
 * Returns paginated list of users with session count, last active date,
 * and average score across all sessions.
 */
export async function getAllUsers(
  options: GetAllUsersOptions = {}
): Promise<GetAllUsersResult> {
  const { search, limit = 20, offset = 0 } = options

  try {
    // Verify admin access
    const user = await getUser()
    if (!user) {
      return { users: [], hasMore: false, error: 'Not authenticated' }
    }

    if (!isAdmin(user.email)) {
      logger.warn('Non-admin attempted to access getAllUsers', {
        userId: user.id,
        email: user.email,
      })
      return { users: [], hasMore: false, error: 'Admin access required' }
    }

    const supabase = getAdminClient()

    // Build query for users
    let query = supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .order('created_at', { ascending: false })

    // Apply search filter if provided
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`
      query = query.or(`email.ilike.${searchTerm},name.ilike.${searchTerm}`)
    }

    // Fetch limit + 1 for hasMore detection
    query = query.range(offset, offset + limit)

    const { data: usersData, error: usersError } = await query

    if (usersError) {
      logger.error('Error fetching users', {
        operation: 'getAllUsers',
        error: usersError.message,
      })
      return { users: [], hasMore: false, error: 'Failed to fetch users' }
    }

    if (!usersData || usersData.length === 0) {
      return { users: [], hasMore: false }
    }

    // Get session data for all users in one query
    const userIds = usersData.map((u) => u.id)

    const { data: sessionsData, error: sessionsError } = await supabase
      .from('roleplay_sessions')
      .select(`
        id,
        user_id,
        created_at,
        session_scores (score)
      `)
      .in('user_id', userIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (sessionsError) {
      logger.error('Error fetching sessions for users', {
        operation: 'getAllUsers',
        error: sessionsError.message,
      })
    }

    // Build user activity map
    const userActivityMap = new Map<
      string,
      {
        sessionCount: number
        lastActive: string | null
        totalScore: number
        scoreCount: number
      }
    >()

    // Initialize all users
    for (const u of usersData) {
      userActivityMap.set(u.id, {
        sessionCount: 0,
        lastActive: null,
        totalScore: 0,
        scoreCount: 0,
      })
    }

    // Process sessions
    if (sessionsData) {
      for (const session of sessionsData) {
        const activity = userActivityMap.get(session.user_id)
        if (activity) {
          activity.sessionCount += 1

          // Track most recent session
          if (
            !activity.lastActive ||
            new Date(session.created_at || '') > new Date(activity.lastActive)
          ) {
            activity.lastActive = session.created_at
          }

          // Accumulate scores
          const scores = (session.session_scores as Array<{ score: number }>) || []
          for (const s of scores) {
            activity.totalScore += s.score
            activity.scoreCount += 1
          }
        }
      }
    }

    // Map to AdminUser format
    const users: AdminUser[] = usersData.slice(0, limit).map((u) => {
      const activity = userActivityMap.get(u.id)
      const avgScore =
        activity && activity.scoreCount > 0
          ? Math.round((activity.totalScore / activity.scoreCount) * 10) / 10
          : 0

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        created_at: u.created_at || new Date().toISOString(),
        session_count: activity?.sessionCount || 0,
        last_active: activity?.lastActive || u.created_at || new Date().toISOString(),
        average_score: avgScore,
      }
    })

    return {
      users,
      hasMore: usersData.length > limit,
    }
  } catch (error) {
    logger.exception('Error in getAllUsers', error, { operation: 'getAllUsers' })
    return { users: [], hasMore: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get detailed user data with full session history (admin only)
 *
 * Returns user profile and all their sessions with scores.
 */
export async function getUserDetail(userId: string): Promise<GetUserDetailResult> {
  try {
    // Verify admin access
    const user = await getUser()
    if (!user) {
      return { user: null, sessions: [], error: 'Not authenticated' }
    }

    if (!isAdmin(user.email)) {
      logger.warn('Non-admin attempted to access getUserDetail', {
        userId: user.id,
        email: user.email,
        targetUserId: userId,
      })
      return { user: null, sessions: [], error: 'Admin access required' }
    }

    const supabase = getAdminClient()

    // Fetch user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      logger.error('Error fetching user detail', {
        operation: 'getUserDetail',
        error: userError?.message,
        userId,
      })
      return { user: null, sessions: [], error: 'User not found' }
    }

    // Fetch sessions with scores
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('roleplay_sessions')
      .select(`
        id,
        persona_id,
        scenario_type,
        duration_seconds,
        created_at,
        session_scores (
          dimension,
          score,
          feedback
        )
      `)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (sessionsError) {
      logger.error('Error fetching sessions for user', {
        operation: 'getUserDetail',
        error: sessionsError.message,
        userId,
      })
    }

    // Calculate aggregate stats
    let totalScore = 0
    let scoreCount = 0
    let lastActive = userData.created_at

    const sessions: AdminSession[] = []

    if (sessionsData) {
      for (const session of sessionsData) {
        const scores = (
          session.session_scores as Array<{
            dimension: string
            score: number
            feedback: string | null
          }>
        ) || []

        sessions.push({
          id: session.id,
          persona_id: session.persona_id,
          scenario_type: session.scenario_type,
          duration_seconds: session.duration_seconds,
          created_at: session.created_at || new Date().toISOString(),
          scores,
        })

        // Track most recent session
        if (
          !lastActive ||
          new Date(session.created_at || '') > new Date(lastActive)
        ) {
          lastActive = session.created_at
        }

        // Accumulate scores
        for (const s of scores) {
          totalScore += s.score
          scoreCount += 1
        }
      }
    }

    const avgScore =
      scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 0

    const adminUser: AdminUser = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      created_at: userData.created_at || new Date().toISOString(),
      session_count: sessions.length,
      last_active: lastActive || userData.created_at || new Date().toISOString(),
      average_score: avgScore,
    }

    return {
      user: adminUser,
      sessions,
    }
  } catch (error) {
    logger.exception('Error in getUserDetail', error, {
      operation: 'getUserDetail',
      userId,
    })
    return { user: null, sessions: [], error: 'An unexpected error occurred' }
  }
}

/**
 * Daily metric data point for charts
 */
export interface DailyMetric {
  date: string  // "Jan 15"
  sessions: number
  calls: number
}

interface AnalyticsMetrics {
  totalSessions: number
  totalCalls: number
  activeUsers: number
  dailyData: DailyMetric[]
}

interface GetAnalyticsDataResult {
  metrics: AnalyticsMetrics | null
  error?: string
}

/**
 * Helper to group records by day
 */
function groupByDay(
  records: Array<{ created_at: string | null }>
): Map<string, number> {
  const dayMap = new Map<string, number>()

  for (const record of records) {
    if (!record.created_at) continue

    const dateKey = new Date(record.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + 1)
  }

  return dayMap
}

/**
 * Get platform analytics data (admin only)
 *
 * Returns aggregate metrics for sessions, calls, and active users
 * over the specified time period.
 */
export async function getAnalyticsData(
  days: number = 30
): Promise<GetAnalyticsDataResult> {
  try {
    // Verify admin access
    const user = await getUser()
    if (!user) {
      return { metrics: null, error: 'Not authenticated' }
    }

    if (!isAdmin(user.email)) {
      logger.warn('Non-admin attempted to access getAnalyticsData', {
        userId: user.id,
        email: user.email,
      })
      return { metrics: null, error: 'Admin access required' }
    }

    const supabase = getAdminClient()

    // Calculate date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString()

    // Query roleplay_sessions for the period
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('roleplay_sessions')
      .select('id, user_id, created_at')
      .gte('created_at', startDateStr)
      .is('deleted_at', null)

    if (sessionsError) {
      logger.error('Error fetching sessions for analytics', {
        operation: 'getAnalyticsData',
        error: sessionsError.message,
      })
      return { metrics: null, error: 'Failed to fetch analytics data' }
    }

    // Query call_uploads for the period
    const { data: callsData, error: callsError } = await supabase
      .from('call_uploads')
      .select('id, created_at')
      .gte('created_at', startDateStr)
      .is('deleted_at', null)

    if (callsError) {
      logger.error('Error fetching calls for analytics', {
        operation: 'getAnalyticsData',
        error: callsError.message,
      })
      return { metrics: null, error: 'Failed to fetch analytics data' }
    }

    const sessions = sessionsData || []
    const calls = callsData || []

    // Count unique active users from sessions
    const uniqueUserIds = new Set<string>()
    for (const session of sessions) {
      uniqueUserIds.add(session.user_id)
    }

    // Group by day for chart data
    const sessionsByDay = groupByDay(sessions)
    const callsByDay = groupByDay(calls)

    // Merge into daily data array
    const allDates = new Set([...sessionsByDay.keys(), ...callsByDay.keys()])
    const dailyDataUnsorted: DailyMetric[] = Array.from(allDates).map((date) => ({
      date,
      sessions: sessionsByDay.get(date) || 0,
      calls: callsByDay.get(date) || 0,
    }))

    // Sort by date ascending (parse back to Date for sorting)
    const currentYear = new Date().getFullYear()
    dailyDataUnsorted.sort((a, b) => {
      const dateA = new Date(`${a.date}, ${currentYear}`)
      const dateB = new Date(`${b.date}, ${currentYear}`)
      return dateA.getTime() - dateB.getTime()
    })

    const metrics: AnalyticsMetrics = {
      totalSessions: sessions.length,
      totalCalls: calls.length,
      activeUsers: uniqueUserIds.size,
      dailyData: dailyDataUnsorted,
    }

    return { metrics }
  } catch (error) {
    logger.exception('Error in getAnalyticsData', error, {
      operation: 'getAnalyticsData',
    })
    return { metrics: null, error: 'An unexpected error occurred' }
  }
}

/**
 * System health result with service statuses and circuit breaker states
 */
export interface SystemHealthResult {
  health: {
    status: 'healthy' | 'unhealthy' | 'degraded'
    timestamp: string
    uptime: number
    services: {
      supabase: { status: string; latency?: number; error?: string }
      openai: { status: string; latency?: number; error?: string }
      openrouter: { status: string; latency?: number; error?: string }
    }
  } | null
  circuitBreakers: Array<{
    name: string
    state: string
    failures: number
    totalRequests: number
  }>
  error: string | null
}

/**
 * Get system health status (admin only)
 *
 * Fetches health data from /api/health and circuit breaker stats.
 * Returns partial data if health check fails.
 */
export async function getSystemHealth(): Promise<SystemHealthResult> {
  try {
    // Verify admin access
    const user = await getUser()
    if (!user) {
      return { health: null, circuitBreakers: [], error: 'Not authenticated' }
    }

    if (!isAdmin(user.email)) {
      logger.warn('Non-admin attempted to access getSystemHealth', {
        userId: user.id,
        email: user.email,
      })
      return { health: null, circuitBreakers: [], error: 'Admin access required' }
    }

    // Get circuit breaker stats (always available)
    const circuitBreakers = [
      { name: 'OpenRouter', ...openrouterCircuit.getStats() },
      { name: 'VAPI', ...vapiCircuit.getStats() },
      { name: 'Supabase', ...supabaseCircuit.getStats() },
    ].map((cb) => ({
      name: cb.name,
      state: cb.state,
      failures: cb.failures,
      totalRequests: cb.totalRequests,
    }))

    // Fetch health data from API endpoint
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    let health: SystemHealthResult['health'] = null
    let fetchError: string | null = null

    try {
      const response = await fetch(`${baseUrl}/api/health`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      })

      if (response.ok) {
        const data = await response.json()
        health = {
          status: data.status,
          timestamp: data.timestamp,
          uptime: data.uptime,
          services: data.services,
        }
      } else {
        fetchError = `Health check returned ${response.status}`
      }
    } catch (error) {
      fetchError =
        error instanceof Error ? error.message : 'Failed to fetch health status'
      logger.error('Error fetching health status', {
        operation: 'getSystemHealth',
        error: fetchError,
      })
    }

    return {
      health,
      circuitBreakers,
      error: fetchError,
    }
  } catch (error) {
    logger.exception('Error in getSystemHealth', error, {
      operation: 'getSystemHealth',
    })
    return {
      health: null,
      circuitBreakers: [],
      error: 'An unexpected error occurred',
    }
  }
}
