'use server'

import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import type { CurriculumProgress } from '@/types'

/**
 * Module progress data for dashboard visualization
 */
export interface ModuleProgressItem {
  moduleId: number
  completed: boolean
  score: number | null
  completedAt: string | null
}

// Total number of curriculum modules
const TOTAL_MODULES = 12

interface CurriculumProgressRow {
  id: string
  user_id: string
  module_id: number
  completed: boolean
  score: number | null
  completed_at: string | null
}

export async function getUserCurriculumProgress(): Promise<CurriculumProgress[]> {
  const user = await getUser()
  if (!user) return []

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('curriculum_progress')
    .select('*')
    .eq('user_id', user.id)
    .order('module_id', { ascending: true })

  if (error) {
    console.error('Error fetching curriculum progress:', error)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((row: CurriculumProgressRow) => ({
    id: row.id,
    user_id: row.user_id,
    module_id: row.module_id,
    completed: row.completed,
    score: row.score ?? undefined,
    completed_at: row.completed_at ?? undefined,
  }))
}

export async function getModuleProgress(moduleId: number): Promise<CurriculumProgress | null> {
  const user = await getUser()
  if (!user) return null

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('curriculum_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .single()

  if (error || !data) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any as CurriculumProgressRow

  return {
    id: row.id,
    user_id: row.user_id,
    module_id: row.module_id,
    completed: row.completed,
    score: row.score ?? undefined,
    completed_at: row.completed_at ?? undefined,
  }
}

export async function markModuleComplete(moduleId: number): Promise<{ success: boolean; error?: string }> {
  const user = await getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createServerSupabaseClient() as any

  // Check if progress record exists
  const { data: existing } = await supabase
    .from('curriculum_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .single()

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('curriculum_progress')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) {
      console.error('Error updating curriculum progress:', error)
      return { success: false, error: error.message }
    }
  } else {
    // Insert new record
    const { error } = await supabase.from('curriculum_progress').insert({
      user_id: user.id,
      module_id: moduleId,
      completed: true,
      completed_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Error inserting curriculum progress:', error)
      return { success: false, error: error.message }
    }
  }

  return { success: true }
}

export async function markModuleStarted(moduleId: number): Promise<{ success: boolean; error?: string }> {
  const user = await getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createServerSupabaseClient() as any

  // Check if progress record exists
  const { data: existing } = await supabase
    .from('curriculum_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .single()

  if (!existing) {
    // Insert new record (started but not completed)
    const { error } = await supabase.from('curriculum_progress').insert({
      user_id: user.id,
      module_id: moduleId,
      completed: false,
    })

    if (error) {
      console.error('Error inserting curriculum progress:', error)
      return { success: false, error: error.message }
    }
  }

  return { success: true }
}

/**
 * Get curriculum progress for all 12 modules
 * Returns array with all modules represented (filled in with defaults if no record exists)
 * Used for dashboard progress visualization
 */
export async function getCurriculumProgress(): Promise<ModuleProgressItem[]> {
  try {
    const user = await getUser()
    if (!user) {
      // Return empty progress for all 12 modules
      return Array.from({ length: TOTAL_MODULES }, (_, i) => ({
        moduleId: i + 1,
        completed: false,
        score: null,
        completedAt: null,
      }))
    }

    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from('curriculum_progress')
      .select('module_id, completed, score, completed_at')
      .eq('user_id', user.id)
      .order('module_id', { ascending: true })

    if (error) {
      logger.error('Error fetching curriculum progress', {
        operation: 'getCurriculumProgress',
        error: error.message,
      })
      // Return empty progress for all modules on error
      return Array.from({ length: TOTAL_MODULES }, (_, i) => ({
        moduleId: i + 1,
        completed: false,
        score: null,
        completedAt: null,
      }))
    }

    // Create a map of existing progress
    const progressMap = new Map<number, ModuleProgressItem>()
    for (const row of data || []) {
      const typedRow = row as {
        module_id: number
        completed: boolean
        score: number | null
        completed_at: string | null
      }
      progressMap.set(typedRow.module_id, {
        moduleId: typedRow.module_id,
        completed: typedRow.completed,
        score: typedRow.score,
        completedAt: typedRow.completed_at,
      })
    }

    // Build array with all 12 modules, filling in defaults for missing ones
    return Array.from({ length: TOTAL_MODULES }, (_, i) => {
      const moduleId = i + 1
      return (
        progressMap.get(moduleId) || {
          moduleId,
          completed: false,
          score: null,
          completedAt: null,
        }
      )
    })
  } catch (error) {
    logger.exception('Error in getCurriculumProgress', error, {
      operation: 'getCurriculumProgress',
    })
    // Return empty progress for all modules on exception
    return Array.from({ length: TOTAL_MODULES }, (_, i) => ({
      moduleId: i + 1,
      completed: false,
      score: null,
      completedAt: null,
    }))
  }
}
