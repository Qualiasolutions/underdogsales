'use server'

import { getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/config/admin'
import { logger } from '@/lib/logger'

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
