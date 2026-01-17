'use server'

import { createServerSupabaseClient, getUser } from '@/lib/supabase/server'
import type { CurriculumProgress } from '@/types'

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
